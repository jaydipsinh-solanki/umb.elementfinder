using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace Umb.ContentCleaner.Services;

/// <summary>
/// Scans Data Types (Block List, Block Grid, Rich Text, etc.) and safely removes
/// block configurations that reference deleted Element Types or Document Types,
/// preventing orphaned blocks and undefined errors in the Umbraco backoffice.
/// </summary>
public sealed class BlockConfigurationCleanerService : IBlockConfigurationCleanerService
{
    private readonly IDataTypeService _dataTypeService;
    private readonly ILogger<BlockConfigurationCleanerService> _logger;

    public BlockConfigurationCleanerService(
        IDataTypeService dataTypeService,
        ILogger<BlockConfigurationCleanerService> logger)
    {
        _dataTypeService = dataTypeService;
        _logger = logger;
    }

    public Task<int> RemoveBlockReferencesAsync(Guid elementOrContentTypeKey, CancellationToken cancellationToken = default)
        => RemoveBlockReferencesAsync(new HashSet<Guid> { elementOrContentTypeKey }, cancellationToken);

    public async Task<int> RemoveBlockReferencesAsync(IReadOnlySet<Guid> elementOrContentTypeKeys, CancellationToken cancellationToken = default)
    {
        if (elementOrContentTypeKeys.Count == 0)
        {
            return 0;
        }

        var dataTypes = (await _dataTypeService.GetAllAsync()).ToArray();
        var updatedCount = 0;

        foreach (var dataType in dataTypes)
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (dataType.ConfigurationData is null || dataType.ConfigurationData.Count == 0)
            {
                continue;
            }

            if (!TryCleanBlocks(dataType.ConfigurationData, elementOrContentTypeKeys, out var updatedConfig))
            {
                continue;
            }

            try
            {
                dataType.ConfigurationData = updatedConfig;
                await _dataTypeService.UpdateAsync(dataType, Constants.Security.SuperUserKey);
                updatedCount++;
                _logger.LogInformation(
                    "Removed block configuration references to deleted items from Data Type '{DataTypeName}' ({DataTypeKey}).",
                    dataType.Name,
                    dataType.Key);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "Failed to update block configuration on Data Type '{DataTypeName}' ({DataTypeKey}) after item deletion.",
                    dataType.Name,
                    dataType.Key);
            }
        }

        return updatedCount;
    }

    public static bool TryCleanBlocks(
        IDictionary<string, object?> configData,
        IReadOnlySet<Guid> keysToRemove,
        out Dictionary<string, object?> updatedConfig)
    {
        updatedConfig = new Dictionary<string, object?>(configData, StringComparer.OrdinalIgnoreCase);
        var modified = false;

        foreach (var key in configData.Keys)
        {
            var value = configData[key];
            if (value is null)
            {
                continue;
            }

            JsonNode? node = null;
            try
            {
                if (value is JsonNode jn)
                {
                    node = JsonNode.Parse(jn.ToJsonString());
                }
                else if (value is JsonElement je)
                {
                    node = JsonNode.Parse(je.GetRawText());
                }
                else if (value is string str && (str.TrimStart().StartsWith('[') || str.TrimStart().StartsWith('{')))
                {
                    node = JsonNode.Parse(str);
                }
                else
                {
                    var serialized = JsonSerializer.Serialize(value);
                    node = JsonNode.Parse(serialized);
                }
            }
            catch
            {
                continue;
            }

            if (node is null)
            {
                continue;
            }

            var propertyModified = false;

            if (node is JsonArray jsonArray)
            {
                propertyModified = CleanArray(jsonArray, keysToRemove);
            }
            else if (node is JsonObject jsonObject)
            {
                propertyModified = CleanObject(jsonObject, keysToRemove);
            }

            if (propertyModified)
            {
                modified = true;
                using var doc = JsonDocument.Parse(node.ToJsonString());
                updatedConfig[key] = doc.RootElement.Clone();
            }
        }

        return modified;
    }

    private static bool CleanArray(JsonArray array, IReadOnlySet<Guid> targetKeys)
    {
        var changed = false;
        var indicesToRemove = new List<int>();

        for (var i = 0; i < array.Count; i++)
        {
            var item = array[i];
            if (item is JsonObject obj)
            {
                // 1. Is this a block based on the deleted element type?
                var contentKeyProp = obj.FirstOrDefault(p =>
                    string.Equals(p.Key, "contentElementTypeKey", StringComparison.OrdinalIgnoreCase));

                if (contentKeyProp.Value is not null &&
                    TryGetGuid(contentKeyProp.Value, out var contentGuid) &&
                    targetKeys.Contains(contentGuid))
                {
                    indicesToRemove.Add(i);
                    changed = true;
                    continue;
                }

                // 2. Is this an area allowance referencing the deleted element type?
                var elemKeyProp = obj.FirstOrDefault(p =>
                    string.Equals(p.Key, "elementTypeKey", StringComparison.OrdinalIgnoreCase));

                if (elemKeyProp.Value is not null &&
                    TryGetGuid(elemKeyProp.Value, out var elemGuid) &&
                    targetKeys.Contains(elemGuid))
                {
                    indicesToRemove.Add(i);
                    changed = true;
                    continue;
                }

                // 3. Does this block reference the deleted element type as its settings?
                var settingsKeyProp = obj.FirstOrDefault(p =>
                    string.Equals(p.Key, "settingsElementTypeKey", StringComparison.OrdinalIgnoreCase));

                if (settingsKeyProp.Value is not null &&
                    TryGetGuid(settingsKeyProp.Value, out var settingsGuid) &&
                    targetKeys.Contains(settingsGuid))
                {
                    obj[settingsKeyProp.Key] = null;
                    changed = true;
                }

                // 4. Recursively clean nested properties (e.g. "areas", "specifiedAllowance")
                if (CleanObject(obj, targetKeys))
                {
                    changed = true;
                }
            }
            else if (item is JsonArray childArray)
            {
                if (CleanArray(childArray, targetKeys))
                {
                    changed = true;
                }
            }
        }

        for (var i = indicesToRemove.Count - 1; i >= 0; i--)
        {
            array.RemoveAt(indicesToRemove[i]);
        }

        return changed;
    }

    private static bool CleanObject(JsonObject obj, IReadOnlySet<Guid> targetKeys)
    {
        var changed = false;

        foreach (var prop in obj.ToArray())
        {
            if (prop.Value is JsonArray childArray)
            {
                if (CleanArray(childArray, targetKeys))
                {
                    changed = true;
                }
            }
            else if (prop.Value is JsonObject childObj)
            {
                if (CleanObject(childObj, targetKeys))
                {
                    changed = true;
                }
            }
        }

        return changed;
    }

    private static bool TryGetGuid(JsonNode? node, out Guid guid)
    {
        guid = Guid.Empty;
        if (node is null) return false;

        if (node is JsonValue jv)
        {
            if (jv.TryGetValue<Guid>(out guid))
            {
                return true;
            }

            if (jv.TryGetValue<string>(out var str) && Guid.TryParse(str, out guid))
            {
                return true;
            }
        }

        var text = node.ToString();
        return Guid.TryParse(text, out guid);
    }
}
