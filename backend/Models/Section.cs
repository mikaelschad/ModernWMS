using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ModernWMS.Backend.Models;

public class Section
{
    public Section() { }

    public string Id { get; set; } = string.Empty;

    [Column("FACILITY")]
    [Required]
    public string FacilityId { get; set; } = string.Empty;


    public string? Description { get; set; }
    public string Status { get; set; } = "A";
    public DateTime LastUpdate { get; set; }
    public string LastUser { get; set; } = "SYSTEM";
}
