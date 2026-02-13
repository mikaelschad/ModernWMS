using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ModernWMS.Backend.Models;

[Table("ITEM")]
public class Item
{
    public Item() { }

    [Key]
    [Column("ITEM")]
    [Required]
    [MaxLength(30)]
    public string Id { get; set; } = string.Empty; // Primary key: ITEM
    
    [MaxLength(50)]
    public string? SKU { get; set; } // Attribute
    public string Description { get; set; } = string.Empty;
    public string? Abbreviation { get; set; }
    [Column("BASEUOM")]
    public string BaseUOM { get; set; } = "EA";
    public string? ItemGroupId { get; set; }
    [Column("CUSTID")]
    [Required]
    [MaxLength(30)]
    public string CustomerId { get; set; } = string.Empty;
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
    
    // Logistics
    public string? CommodityCode { get; set; }
    public string? CountryOfOrigin { get; set; }
    public string? VelocityClass { get; set; }
    
    // Pallet Configuration
    public int? Ti { get; set; } // Cases per layer
    public int? Hi { get; set; } // Layers per pallet

    // Replenishment
    public int? MinQty { get; set; }
    public int? MaxQty { get; set; }
    public string? PickLocation { get; set; }

    public string Status { get; set; } = "A";
    public DateTime LastUpdate { get; set; }
    public string LastUser { get; set; } = "SYSTEM";
}
