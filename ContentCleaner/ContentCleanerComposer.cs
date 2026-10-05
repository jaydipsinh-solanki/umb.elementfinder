using Microsoft.Extensions.DependencyInjection;
using Umb.ContentCleaner.Services;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace Umb.ContentCleaner;

public sealed class ContentCleanerComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddScoped<IContentCleanerAnalysisService, ContentCleanerAnalysisService>();
        builder.Services.AddScoped<IContentCleanerCacheService, ContentCleanerCacheService>();
    }
}
