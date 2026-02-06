using ModernWMS.Backend.Models;

namespace ModernWMS.Backend.Repositories;

public interface ILegacyInventoryRepository
{
    Task<IEnumerable<InventoryItem>> GetLegacyInventoryAsync();
}

public class LegacySqlInventoryRepository : ILegacyInventoryRepository
{
    private readonly string _connectionString;

    public LegacySqlInventoryRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("LegacySqlDB") ?? string.Empty;
    }

    public async Task<IEnumerable<InventoryItem>> GetLegacyInventoryAsync()
    {
        // In a real implementation, we would use Microsoft.Data.SqlClient
        // For the skeleton, we simulate a database call
        await Task.Delay(100); // Simulate network latency

        return new List<InventoryItem>
        {
            new() { SKU = "SQL-777", Quantity = 1200, LocationCode = "A-SQL-1", FacilityId = "FAC-SQL" }
        };
    }
}
