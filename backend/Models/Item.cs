namespace ModernWMS.Backend.Models;

public class Item
{
    public Item() { }

    public string SKU { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string UnitOfMeasure { get; set; } = "EA";
    public string? ItemGroupId { get; set; }
    public string? CustomerId { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Length { get; set; }
    public decimal? Width { get; set; }
    public decimal? Height { get; set; }
    public string Status { get; set; } = "A";
    public DateTime LastUpdate { get; set; }
    public string LastUser { get; set; } = "SYSTEM";
}
