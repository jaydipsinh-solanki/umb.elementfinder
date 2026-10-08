using System.Text.Json;
using Umb.ContentCleaner.Services;
using Xunit;

namespace Umb.ContentCleaner.Tests;

public class BlockConfigurationCleanerServiceTests
{
    [Fact]
    public void TryCleanBlocks_RemovesMatchingContentElementTypeBlockFromBlockList()
    {
        var targetKey = Guid.NewGuid();
        var otherKey = Guid.NewGuid();

        var config = new Dictionary<string, object?>
        {
            ["blocks"] = JsonSerializer.Deserialize<JsonElement>($@"[
                {{
                    ""contentElementTypeKey"": ""{targetKey}"",
                    ""label"": ""Deleted Block""
                }},
                {{
                    ""contentElementTypeKey"": ""{otherKey}"",
                    ""label"": ""Remaining Block""
                }}
            ]")
        };

        var changed = BlockConfigurationCleanerService.TryCleanBlocks(
            config,
            new HashSet<Guid> { targetKey },
            out var updatedConfig);

        Assert.True(changed);
        var updatedBlocks = updatedConfig["blocks"];
        Assert.NotNull(updatedBlocks);

        var json = JsonSerializer.Serialize(updatedBlocks);
        using var doc = JsonDocument.Parse(json);
        var array = doc.RootElement.EnumerateArray().ToArray();

        Assert.Single(array);
        Assert.Equal(otherKey.ToString(), array[0].GetProperty("contentElementTypeKey").GetString());
        Assert.Equal("Remaining Block", array[0].GetProperty("label").GetString());
    }

    [Fact]
    public void TryCleanBlocks_ClearsMatchingSettingsElementTypeKeyWhileKeepingBlock()
    {
        var settingsKey = Guid.NewGuid();
        var contentKey = Guid.NewGuid();

        var config = new Dictionary<string, object?>
        {
            ["blocks"] = JsonSerializer.Deserialize<JsonElement>($@"[
                {{
                    ""contentElementTypeKey"": ""{contentKey}"",
                    ""settingsElementTypeKey"": ""{settingsKey}"",
                    ""label"": ""Block with Settings""
                }}
            ]")
        };

        var changed = BlockConfigurationCleanerService.TryCleanBlocks(
            config,
            new HashSet<Guid> { settingsKey },
            out var updatedConfig);

        Assert.True(changed);
        var json = JsonSerializer.Serialize(updatedConfig["blocks"]);
        using var doc = JsonDocument.Parse(json);
        var array = doc.RootElement.EnumerateArray().ToArray();

        Assert.Single(array);
        Assert.Equal(contentKey.ToString(), array[0].GetProperty("contentElementTypeKey").GetString());
        Assert.Equal(JsonValueKind.Null, array[0].GetProperty("settingsElementTypeKey").ValueKind);
    }

    [Fact]
    public void TryCleanBlocks_RemovesMatchingElementTypeFromBlockGridAreaAllowance()
    {
        var targetKey = Guid.NewGuid();
        var otherKey = Guid.NewGuid();
        var areaAllowedKey = targetKey;

        var config = new Dictionary<string, object?>
        {
            ["blocks"] = JsonSerializer.Deserialize<JsonElement>($@"[
                {{
                    ""contentElementTypeKey"": ""{otherKey}"",
                    ""label"": ""Grid Block"",
                    ""areas"": [
                        {{
                            ""key"": ""{Guid.NewGuid()}"",
                            ""alias"": ""left"",
                            ""specifiedAllowance"": [
                                {{ ""elementTypeKey"": ""{areaAllowedKey}"" }},
                                {{ ""elementTypeKey"": ""{Guid.NewGuid()}"" }}
                            ]
                        }}
                    ]
                }}
            ]")
        };

        var changed = BlockConfigurationCleanerService.TryCleanBlocks(
            config,
            new HashSet<Guid> { targetKey },
            out var updatedConfig);

        Assert.True(changed);
        var json = JsonSerializer.Serialize(updatedConfig["blocks"]);
        using var doc = JsonDocument.Parse(json);
        var array = doc.RootElement.EnumerateArray().ToArray();

        Assert.Single(array);
        var area = array[0].GetProperty("areas").EnumerateArray().First();
        var allowances = area.GetProperty("specifiedAllowance").EnumerateArray().ToArray();

        Assert.Single(allowances);
        Assert.NotEqual(targetKey.ToString(), allowances[0].GetProperty("elementTypeKey").GetString());
    }

    [Fact]
    public void TryCleanBlocks_ReturnsFalseWhenNoMatchingKeysFound()
    {
        var key1 = Guid.NewGuid();
        var key2 = Guid.NewGuid();
        var unrelatedKey = Guid.NewGuid();

        var config = new Dictionary<string, object?>
        {
            ["blocks"] = JsonSerializer.Deserialize<JsonElement>($@"[
                {{ ""contentElementTypeKey"": ""{key1}"" }},
                {{ ""contentElementTypeKey"": ""{key2}"" }}
            ]")
        };

        var changed = BlockConfigurationCleanerService.TryCleanBlocks(
            config,
            new HashSet<Guid> { unrelatedKey },
            out var updatedConfig);

        Assert.False(changed);
    }
}
