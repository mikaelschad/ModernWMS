using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ModernWMS.Backend.Models;

[Table("AUDIT_LOG")]
public class AuditLog
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string TableName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string RecordId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(20)]
    public string Action { get; set; } = string.Empty; // INSERT, UPDATE, DELETE, LOGIN, SECURITY
    
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    
    [MaxLength(100)]
    public string? ChangedBy { get; set; }
    
    public DateTime ChangedDate { get; set; } = DateTime.Now;
}
