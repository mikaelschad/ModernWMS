namespace ModernWMS.Backend.Models;

public enum PlateStatus
{
    Active,
    Hold,
    Consumed,
    Canceled,
    InTransit
}

public class LicensePlate
{
    public string Id { get; set; } = string.Empty; // Legacy LPID
    public string SKU { get; set; } = string.Empty;
    public string? CustomerId { get; set; }
    public string? FacilityId { get; set; }
    public string? Location { get; set; }
    public PlateStatus Status { get; set; } = PlateStatus.Active;
    public string? HoldReason { get; set; }
    public string? UnitOfMeasure { get; set; }
    public decimal Quantity { get; set; }
    public string? PlateType { get; set; } // Legacy TYPE
    public string? SerialNumber { get; set; }
    public string? LotNumber { get; set; }
    public DateTime? CreationDate { get; set; }
    public DateTime? ManufactureDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public string? PurchaseOrder { get; set; } // Legacy PO
    public string? ParentLPID { get; set; }
    public decimal? Weight { get; set; }
    public string? InventoryClass { get; set; }
    public DateTime LastUpdate { get; set; } = DateTime.Now;
    public string? LastUser { get; set; }

    // Navigation properties for nested plates
    public List<LicensePlate> ChildPlates { get; set; } = new();
}

public class PlateSearchCriteria
{
    public string? LPID { get; set; }
    public string? SKU { get; set; }
    public string? CustomerId { get; set; }
    public string? FacilityId { get; set; }
    public string? Location { get; set; }
    public string? LotNumber { get; set; }
    public string? Status { get; set; }
    public int? Limit { get; set; }
}


public class InventoryItem
{
    public Guid Id { get; set; }
    public string SKU { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string LocationCode { get; set; } = string.Empty;
    public string FacilityId { get; set; } = string.Empty;
    public string? LicensePlateNumber { get; set; }
}

public class InboundOrder
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string SupplierId { get; set; } = string.Empty;
    public DateTime ExpectedDate { get; set; }
    public string Status { get; set; } = "Pending";
}
