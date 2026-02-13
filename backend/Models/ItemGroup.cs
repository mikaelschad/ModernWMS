using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ModernWMS.Backend.Models;

public class ItemGroup
{
    public ItemGroup() { }

    public string Id { get; set; } = string.Empty;
    public string? Description { get; set; }
    [Column("CUSTID")]
    [Required]
    public string CustomerId { get; set; } = string.Empty;
    public string? Category { get; set; }
    
    // Synapse Template Fields
    public string BaseUOM { get; set; } = "EA";
    public bool TrackLotNumber { get; set; }
    public bool TrackSerialNumber { get; set; }
    public bool TrackExpirationDate { get; set; }
    public bool TrackManufactureDate { get; set; }
    
    // Hazardous Settings
    public bool IsHazardous { get; set; }
    public string? HazardClass { get; set; }
    public string? UNNumber { get; set; }
    public string? PackingGroup { get; set; }
    
    // Logistics
    public string? CommodityCode { get; set; }
    public string? CountryOfOrigin { get; set; }
    public string? VelocityClass { get; set; }

    public DateTime LastUpdate { get; set; }
    public string LastUser { get; set; } = "SYSTEM";
}
