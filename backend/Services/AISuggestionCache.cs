using System.Collections.Concurrent;

namespace ModernWMS.Backend.Services;

public interface IAISuggestionCache
{
    void SetSuggestion(string facilityId, string sku, string suggestedLocation, TimeSpan expiry);
    string? GetSuggestion(string facilityId, string sku);
    void InvalidateSuggestion(string facilityId, string sku);
}

public class AISuggestionCache : IAISuggestionCache
{
    private class CachedSuggestion
    {
        public string SuggestedLocation { get; set; } = string.Empty;
        public DateTime Expiry { get; set; }
    }

    private readonly ConcurrentDictionary<string, CachedSuggestion> _cache = new();

    public void SetSuggestion(string facilityId, string sku, string suggestedLocation, TimeSpan expiry)
    {
        string key = GetKey(facilityId, sku);
        _cache[key] = new CachedSuggestion
        {
            SuggestedLocation = suggestedLocation,
            Expiry = DateTime.UtcNow.Add(expiry)
        };
    }

    public string? GetSuggestion(string facilityId, string sku)
    {
        string key = GetKey(facilityId, sku);
        if (_cache.TryGetValue(key, out var cached))
        {
            if (cached.Expiry > DateTime.UtcNow)
            {
                return cached.SuggestedLocation;
            }
            _cache.TryRemove(key, out _);
        }
        return null;
    }

    public void InvalidateSuggestion(string facilityId, string sku)
    {
        string key = GetKey(facilityId, sku);
        _cache.TryRemove(key, out _);
    }

    private string GetKey(string facilityId, string sku) => $"{facilityId}:{sku}";
}
