namespace ModernWMS.Backend.Models;

public class Customer
{
    public Customer() { }

    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Address1 { get; set; }
    public string? Address2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Contact { get; set; }
    
    // Synapse Receiving & Shipping Rules
    public bool AllowPartialShipment { get; set; } = true;
    public bool AllowOverage { get; set; }
    public decimal OverageTolerance { get; set; }
    
    // Default Tracking Rules
    public bool DefaultTrackLot { get; set; }
    public bool DefaultTrackSerial { get; set; }
    public bool DefaultTrackExpDate { get; set; }
    public bool DefaultTrackMfgDate { get; set; }

    // Inventory Control
    public bool AllowMixSKU { get; set; }
    public bool AllowMixLot { get; set; }

    // Receiving Rules
    public bool ReceiveRule_RequireExpDate { get; set; }
    public bool ReceiveRule_RequireMfgDate { get; set; }
    public string? ReceiveRule_LotValidationRegex { get; set; }
    public string? ReceiveRule_SerialValidationRegex { get; set; }
    public int ReceiveRule_MinShelfLifeDays { get; set; }

    public string Status { get; set; } = "A";
    public DateTime LastUpdate { get; set; }
    public string LastUser { get; set; } = "SYSTEM";
}
