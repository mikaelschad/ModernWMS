using System.Data;
using Microsoft.Data.SqlClient;
using ModernWMS.Backend.Models;

namespace ModernWMS.Backend.Repositories;

public class SqlLocationTypeRepository : ILocationTypeRepository
{
    private readonly string _conn;

    public SqlLocationTypeRepository(IConfiguration cfg)
    {
        _conn = cfg.GetConnectionString("LegacySqlDB") ?? throw new InvalidOperationException("Connection string 'LegacySqlDB' not found.");
    }

    public async Task<IEnumerable<LocationType>> GetAllAsync()
    {
        var list = new List<LocationType>();
        using var c = new SqlConnection(_conn);
        await c.OpenAsync();
        using var cmd = new SqlCommand("SELECT * FROM LOCATIONTYPE WHERE STATUS != 'I'", c);
        using var r = await cmd.ExecuteReaderAsync();
        while (await r.ReadAsync())
        {
            list.Add(Map(r));
        }
        return list;
    }

    public async Task<LocationType?> GetByIdAsync(string id)
    {
        using var c = new SqlConnection(_conn);
        await c.OpenAsync();
        // Since we don't have composite key here, simple lookup
        using var cmd = new SqlCommand("SELECT * FROM LOCATIONTYPE WHERE LOCATIONTYPE = @id", c);
        cmd.Parameters.AddWithValue("@id", id);
        using var r = await cmd.ExecuteReaderAsync();
        if (await r.ReadAsync())
        {
            return Map(r);
        }
        return null;
    }

    public async Task<string> CreateAsync(LocationType type)
    {
        using var c = new SqlConnection(_conn);
        await c.OpenAsync();
        using var cmd = new SqlCommand("INSERT INTO LOCATIONTYPE (LOCATIONTYPE, DESCRIPTION, STATUS, LASTUPDATE, LASTUSER) VALUES (@id, @desc, @st, GETDATE(), @usr)", c);
        cmd.Parameters.AddWithValue("@id", type.Id);
        cmd.Parameters.AddWithValue("@desc", (object?)type.Description ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@st", type.Status);
        cmd.Parameters.AddWithValue("@usr", type.LastUser);
        await cmd.ExecuteNonQueryAsync();
        return type.Id;
    }

    public async Task<bool> UpdateAsync(LocationType type)
    {
        using var c = new SqlConnection(_conn);
        await c.OpenAsync();
        using var cmd = new SqlCommand("UPDATE LOCATIONTYPE SET DESCRIPTION = @desc, STATUS = @st, LASTUPDATE = GETDATE(), LASTUSER = @usr WHERE LOCATIONTYPE = @id", c);
        cmd.Parameters.AddWithValue("@id", type.Id);
        cmd.Parameters.AddWithValue("@desc", (object?)type.Description ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@st", type.Status);
        cmd.Parameters.AddWithValue("@usr", type.LastUser);
        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        using var c = new SqlConnection(_conn);
        await c.OpenAsync();
        // Soft delete
        using var cmd = new SqlCommand("DELETE FROM LOCATIONTYPE WHERE LOCATIONTYPE = @id", c);
        cmd.Parameters.AddWithValue("@id", id);
        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    private LocationType Map(IDataRecord r) => new LocationType
    {
        Id = r["LOCATIONTYPE"]?.ToString() ?? "",
        Description = r["DESCRIPTION"]?.ToString() ?? "",
        Status = r["STATUS"]?.ToString() ?? "A",
        LastUpdate = r["LASTUPDATE"] != DBNull.Value ? Convert.ToDateTime(r["LASTUPDATE"]) : DateTime.UtcNow,
        LastUser = r["LASTUSER"]?.ToString() ?? "SYSTEM"
    };
}
