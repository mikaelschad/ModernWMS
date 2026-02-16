using System.ComponentModel.DataAnnotations.Schema;

namespace ModernWMS.Backend.Models;

[Table("ROLE_PERMISSIONS")]
public class RolePermission
{
    public Guid Id { get; set; }
    public string RoleId { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty; // User, Customer, Plate, Item, Order, etc.
    public bool CanRead { get; set; }
    public bool CanCreate { get; set; }
    public bool CanUpdate { get; set; }
    public bool CanDisable { get; set; } // Soft delete / deactivate
    public bool CanPrint { get; set; } // For transactions (labels, reports)
}
