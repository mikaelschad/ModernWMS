namespace ModernWMS.Backend.Models;

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
