using Microsoft.Data.SqlClient;
using ModernWMS.Backend.Models;
using System.Data;

namespace ModernWMS.Backend.Repositories;

public class SqlItemGroupRepository : IItemGroupRepository
{
    private readonly string _connectionString;

    public SqlItemGroupRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("LegacySqlDB") 
            ?? throw new InvalidOperationException("Connection string not found");
    }

    public async Task<IEnumerable<ItemGroup>> GetAllAsync()
    {
        var items = new List<ItemGroup>();
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = "SELECT * FROM ITEMGROUP ORDER BY ITEMGROUP";
        using var cmd = new SqlCommand(query, conn);
        using var reader = await cmd.ExecuteReaderAsync();
        
        while (await reader.ReadAsync())
        {
            items.Add(MapItemGroup(reader));
        }
        
        return items;
    }

    public async Task<ItemGroup?> GetByIdAsync(string id)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = "SELECT * FROM ITEMGROUP WHERE ITEMGROUP = @id";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", id);
        using var reader = await cmd.ExecuteReaderAsync();
        
        if (await reader.ReadAsync())
        {
            return MapItemGroup(reader);
        }
        
        return null;
    }

    public async Task<string> CreateAsync(ItemGroup itemGroup)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = @"INSERT INTO ITEMGROUP (ITEMGROUP, DESCRIPTION, CUSTID, CATEGORY, LASTUPDATE, LASTUSER) 
                     VALUES (@id, @desc, @cust, @cat, GETDATE(), @user)";
        
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", itemGroup.Id);
        cmd.Parameters.AddWithValue("@desc", (object?)itemGroup.Description ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@cust", (object?)itemGroup.CustomerId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@cat", (object?)itemGroup.Category ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@user", "SYSTEM");
        
        await cmd.ExecuteNonQueryAsync();
        return itemGroup.Id;
    }

    public async Task<bool> UpdateAsync(ItemGroup itemGroup)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = @"UPDATE ITEMGROUP SET DESCRIPTION=@desc, CUSTID=@cust, CATEGORY=@cat, LASTUPDATE=GETDATE(), LASTUSER=@user WHERE ITEMGROUP=@id";
        
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", itemGroup.Id);
        cmd.Parameters.AddWithValue("@desc", (object?)itemGroup.Description ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@cust", (object?)itemGroup.CustomerId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@cat", (object?)itemGroup.Category ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@user", "SYSTEM");
        
        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = "DELETE FROM ITEMGROUP WHERE ITEMGROUP = @id";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", id);
        
        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0;
    }

    private ItemGroup MapItemGroup(IDataRecord reader)
    {
        return new ItemGroup
        {
            Id = reader["ITEMGROUP"]?.ToString() ?? string.Empty,
            Description = reader["DESCRIPTION"]?.ToString(),
            Category = reader["CATEGORY"]?.ToString(),
            CustomerId = reader["CUSTID"]?.ToString(),
            LastUpdate = reader["LASTUPDATE"] != DBNull.Value ? Convert.ToDateTime(reader["LASTUPDATE"]) : DateTime.Now,
            LastUser = reader["LASTUSER"]?.ToString() ?? "SYSTEM"
        };
    }
}
