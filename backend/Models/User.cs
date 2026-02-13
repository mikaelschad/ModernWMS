using System.ComponentModel.DataAnnotations.Schema;

namespace ModernWMS.Backend.Models;

[Table("USERS")]
public class User
{
    [Column("USERID")]
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? PasswordHash { get; set; } // BCrypt hash
    public DateTime? PasswordChangedDate { get; set; }
    public DateTime? PasswordExpiryDate { get; set; }
    public bool MustChangePassword { get; set; } = false;
    public int FailedLoginAttempts { get; set; } = 0;
    public DateTime? LockedUntil { get; set; }
    public DateTime? LastLoginDate { get; set; }
    
    [Column("FACILITY")]
    public string? FacilityId { get; set; } // Default/Primary Facility
    
    public string Status { get; set; } = "A";
    public string Language { get; set; } = "en";
    public DateTime LastUpdate { get; set; }
    public string LastUser { get; set; } = "SYSTEM";

    [NotMapped]
    public List<string> Roles { get; set; } = new();
    
    [NotMapped]
    public List<string> AccessibleFacilities { get; set; } = new();
    
    [NotMapped]
    public List<string> AccessibleCustomers { get; set; } = new();
    
    [NotMapped]
    public List<string> Permissions { get; set; } = new();
}
