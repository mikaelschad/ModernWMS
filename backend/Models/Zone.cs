namespace ModernWMS.Backend.Models;

public class Zone
{
    public Zone() { }

    public string Id { get; set; } = string.Empty;
    public string FacilityId { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "A";
    public DateTime LastUpdate { get; set; }
    public string LastUser { get; set; } = "SYSTEM";
}
