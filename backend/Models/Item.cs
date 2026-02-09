namespace ModernWMS.Backend.Models;

public class Item
{
    public Item() { }

    public string SKU { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Abbreviation { get; set; }
    public string UnitOfMeasure { get; set; } = "EA";
    public string? ItemGroupId { get; set; }
    public string? CustomerId { get; set; }
    public string? RateGroup { get; set; }
    public string? ProductGroup { get; set; }
    public string? KitType { get; set; }
    
    // Requirement Flags
    public bool RequireCycleCount { get; set; }
    public bool RequireLotNumber { get; set; }
    public bool RequireSerialNumber { get; set; }
    public bool RequireManufactureDate { get; set; }
    public bool RequireExpirationDate { get; set; }

    // Hazardous Settings
    public bool IsHazardous { get; set; }
    public string? UNNumber { get; set; }
    public string? HazardClass { get; set; }
    public string? PackingGroup { get; set; }

    // Specs
    public decimal? Weight { get; set; }
    public decimal? Length { get; set; }
    public decimal? Width { get; set; }
    public decimal? Height { get; set; }
    public decimal? Volume { get; set; }

    public string Status { get; set; } = "A";
    public DateTime LastUpdate { get; set; }
    public string LastUser { get; set; } = "SYSTEM";
}
