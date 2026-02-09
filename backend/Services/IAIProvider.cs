namespace ModernWMS.Backend.Services;

public interface IAIProvider
{
    Task<string> GetSuggestedLocationAsync(string facilityId, string sku, string itemType);
    Task<string> ProcessDocumentAsync(Stream documentStream, string documentType);
}
