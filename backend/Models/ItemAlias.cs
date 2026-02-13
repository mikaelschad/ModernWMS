using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ModernWMS.Backend.Models;

[Table("ITEMALIAS")]
public class ItemAlias
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(30)]
    public string ItemId { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Alias { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Type { get; set; } = "UPC"; // UPC, EAN, VENDOR, CUSTOM

    [Required]
    [MaxLength(30)]
    public string CustomerId { get; set; } = string.Empty;

    public DateTime LastUpdate { get; set; } = DateTime.Now;
    public string LastUser { get; set; } = "SYSTEM";
}
