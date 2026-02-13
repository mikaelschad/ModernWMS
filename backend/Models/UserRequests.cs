namespace ModernWMS.Backend.Models;

public class UserCreateRequest
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty; // Plain text password from frontend
    public string? FacilityId { get; set; }
    public string Status { get; set; } = "A";
    public string Language { get; set; } = "en";
    public List<string> Roles { get; set; } = new();
    public List<string> AccessibleFacilities { get; set; } = new();
    public List<string> AccessibleCustomers { get; set; } = new();
}

public class UserUpdateRequest
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Password { get; set; } // Optional - only if changing password
    public string? FacilityId { get; set; }
    public string Status { get; set; } = "A";
    public string Language { get; set; } = "en";
    public List<string> Roles { get; set; } = new();
    public List<string> AccessibleFacilities { get; set; } = new();
    public List<string> AccessibleCustomers { get; set; } = new();
}
