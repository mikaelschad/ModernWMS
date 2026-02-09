namespace ModernWMS.Backend.Models;

public class ItemGroup
{
    public ItemGroup() { }

    public string Id { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CustomerId { get; set; }
    public string? Category { get; set; }
    public DateTime LastUpdate { get; set; }
    public string LastUser { get; set; } = "SYSTEM";
}
