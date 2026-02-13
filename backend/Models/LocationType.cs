using System.ComponentModel.DataAnnotations;

namespace ModernWMS.Backend.Models;

public class LocationType
{
    [Key]
    [StringLength(3)]
    public string Id { get; set; } = string.Empty;

    [StringLength(100)]
    public string Description { get; set; } = string.Empty;

    [StringLength(1)]
    public string Status { get; set; } = "A";

    public DateTime LastUpdate { get; set; } = DateTime.UtcNow;
    
    [StringLength(50)]
    public string LastUser { get; set; } = "SYSTEM";
}
