using Microsoft.Data.SqlClient;
using ModernWMS.Backend.Models;
using System.Data;

namespace ModernWMS.Backend.Repositories;

public class SqlItemAliasRepository : IItemAliasRepository
{
    private readonly string _connectionString;

    public SqlItemAliasRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("LegacySqlDB") 
            ?? throw new InvalidOperationException("Connection string not found");
    }

    public async Task<IEnumerable<ItemAlias>> GetByItemIdAsync(string itemId, string customerId)
    {
        var aliases = new List<ItemAlias>();
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = "SELECT * FROM ITEMALIAS WHERE ITEMID = @itemId AND CUSTOMERID = @customerId";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@itemId", itemId);
        cmd.Parameters.AddWithValue("@customerId", customerId);
        
        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            aliases.Add(MapAlias(reader));
        }
        return aliases;
    }

    public async Task<string> CreateAsync(ItemAlias alias)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = @"INSERT INTO ITEMALIAS (ITEMID, ALIAS, TYPE, CUSTOMERID, LASTUPDATE, LASTUSER) 
                      OUTPUT INSERTED.ID
                      VALUES (@itemId, @alias, @type, @customerId, GETDATE(), @user)";
        
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@itemId", alias.ItemId);
        cmd.Parameters.AddWithValue("@alias", alias.Alias);
        cmd.Parameters.AddWithValue("@type", alias.Type);
        cmd.Parameters.AddWithValue("@customerId", alias.CustomerId);
        cmd.Parameters.AddWithValue("@user", alias.LastUser);
        
        var newId = await cmd.ExecuteScalarAsync();
        return newId?.ToString() ?? string.Empty;
    }

    public async Task<bool> DeleteAsync(Guid id, string customerId)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        // Ensure we only delete if it belongs to the customer (security)
        var query = "DELETE FROM ITEMALIAS WHERE ID = @id AND CUSTOMERID = @customerId";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", id);
        cmd.Parameters.AddWithValue("@customerId", customerId);
        
        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0;
    }

    private ItemAlias MapAlias(IDataRecord reader)
    {
        return new ItemAlias
        {
            Id = (Guid)reader["ID"],
            ItemId = reader["ITEMID"]?.ToString() ?? string.Empty,
            Alias = reader["ALIAS"]?.ToString() ?? string.Empty,
            Type = reader["TYPE"]?.ToString() ?? "UPC",
            CustomerId = reader["CUSTOMERID"]?.ToString() ?? string.Empty,
            LastUpdate = reader["LASTUPDATE"] != DBNull.Value ? Convert.ToDateTime(reader["LASTUPDATE"]) : DateTime.Now,
            LastUser = reader["LASTUSER"]?.ToString() ?? "SYSTEM"
        };
    }
}
