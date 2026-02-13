using ModernWMS.Backend.Models;

namespace ModernWMS.Backend.Repositories;

public interface IRoleRepository
{
    Task<IEnumerable<Role>> GetAllAsync();
    Task<IEnumerable<Permission>> GetAllPermissionsAsync();
    Task<IEnumerable<string>> GetPermissionsForRoleAsync(string roleId);
    Task<bool> UpdateRolePermissionsAsync(string roleId, IEnumerable<string> permissionIds);
}

public class Role
{
    public string Id { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class Permission
{
    public string Id { get; set; } = string.Empty;
    public string Entity { get; set; } = string.Empty;
    public string Operation { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
