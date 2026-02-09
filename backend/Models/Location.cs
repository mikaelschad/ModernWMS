namespace ModernWMS.Backend.Models;

public class Location
{
    public Location() { }

    public string Id { get; set; } = string.Empty;
    public string FacilityId { get; set; } = string.Empty;
    public string? ZoneId { get; set; }
    public string? SectionId { get; set; }
    public string? LocationType { get; set; }
    public string Status { get; set; } = "A";
    public decimal? MaxWeight { get; set; }
    public decimal? MaxVolume { get; set; }
    public DateTime LastUpdate { get; set; }
    public string LastUser { get; set; } = "SYSTEM";
}
