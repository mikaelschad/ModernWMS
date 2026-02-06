namespace ModernWMS.Backend.DTOs;

public class InventoryItemDto
{
    public string Sku { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Location { get; set; } = string.Empty;
    public string FacilityId { get; set; } = string.Empty;
}

public class InboundOrderDto
{
    public string OrderNumber { get; set; } = string.Empty;
    public string SupplierId { get; set; } = string.Empty;
    public DateTime ExpectedDate { get; set; }
    public List<InboundOrderLineDto> Lines { get; set; } = new();
}

public class InboundOrderLineDto
{
    public string Sku { get; set; } = string.Empty;
    public int Quantity { get; set; }
}
