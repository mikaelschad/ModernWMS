using System.ComponentModel.DataAnnotations.Schema;

namespace ModernWMS.Backend.Models;

[Table("ROLE_PERMISSIONS")]
public class RolePermission
{
    public string RoleId { get; set; }
    public string PermissionId { get; set; }
}
