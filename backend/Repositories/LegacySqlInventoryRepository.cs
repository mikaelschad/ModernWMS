using ModernWMS.Backend.Models;
using Microsoft.Data.SqlClient;
using System.Data;

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
        var items = new List<InventoryItem>();
        try 
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            
            // Assuming we have an INVENTORY table in SQL
            string query = "SELECT SKU, QUANTITY, LOCATIONCODE as LocationCode, FACILITYID as FacilityId FROM INVENTORY";
            using var cmd = new SqlCommand(query, conn);
            
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                items.Add(new InventoryItem
                {
                    SKU = reader["SKU"]?.ToString() ?? string.Empty,
                    Quantity = Convert.ToInt32(reader["QUANTITY"]),
                    LocationCode = reader["LocationCode"]?.ToString(),
                    FacilityId = reader["FacilityId"]?.ToString()
                });
            }
        }
        catch 
        {
            // Fallback for demo purposes if table doesn't exist yet
            return new List<InventoryItem>
            {
                new() { SKU = "SQL-777", Quantity = 1200, LocationCode = "A-SQL-1", FacilityId = "FAC-SQL" }
            };
        }
        return items;
    }
}
