namespace ModernWMS.Backend.Models;

public class Consignee
{
    public Consignee() { }

    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Address1 { get; set; }
    public string? Address2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country {get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public DateTime LastUpdate { get; set; }
    public string LastUser { get; set; } = "SYSTEM";
}
