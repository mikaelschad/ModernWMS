using Microsoft.Data.SqlClient;
using ModernWMS.Backend.Models;
using System.Data;

namespace ModernWMS.Backend.Repositories;

public class SqlZoneRepository : IZoneRepository
{
    private readonly string _conn;

    public SqlZoneRepository(IConfiguration cfg)
    {
        _conn = cfg.GetConnectionString("LegacySqlDB") ?? throw new InvalidOperationException();
    }

    public async Task<IEnumerable<Zone>> GetAllAsync()
    {
        var lst = new List<Zone>();
        using var c = new SqlConnection(_conn);
        await c.OpenAsync();
        using var cmd = new SqlCommand("SELECT * FROM ZONE WHERE STATUS != 'I' ORDER BY ZONE", c);
        using var r = await cmd.ExecuteReaderAsync();
        while (await r.ReadAsync())
        {
            lst.Add(new Zone
            {
                Id = r["ZONE"]?.ToString() ?? "",
                FacilityId = r["FACILITY"]?.ToString() ?? "",
                Description = r["DESCRIPTION"]?.ToString(),
                Status = r["STATUS"]?.ToString() ?? "A",
                LastUpdate = r["LASTUPDATE"] != DBNull.Value ? Convert.ToDateTime(r["LASTUPDATE"]) : DateTime.Now,
                LastUser = r["LASTUSER"]?.ToString() ?? "SYSTEM"
            });
        }
        return lst;
    }

    public async Task<Zone?> GetByIdAsync(string id, string facilityId)
    {
        using var c = new SqlConnection(_conn);
        await c.OpenAsync();
        using var cmd = new SqlCommand("SELECT * FROM ZONE WHERE ZONE = @id AND FACILITY = @fac", c);
        cmd.Parameters.AddWithValue("@id", id);
        cmd.Parameters.AddWithValue("@fac", facilityId);
        using var r = await cmd.ExecuteReaderAsync();
        if (await r.ReadAsync())
        {
            return new Zone
            {
                Id = r["ZONE"]?.ToString() ?? "",
                FacilityId = r["FACILITY"]?.ToString() ?? "",
                Description = r["DESCRIPTION"]?.ToString(),
                Status = r["STATUS"]?.ToString() ?? "A",
                LastUpdate = r["LASTUPDATE"] != DBNull.Value ? Convert.ToDateTime(r["LASTUPDATE"]) : DateTime.Now,
                LastUser = r["LASTUSER"]?.ToString() ?? "SYSTEM"
            };
        }
        return null;
    }

    public async Task<string> CreateAsync(Zone z)
    {
        try
        {
            using var c = new SqlConnection(_conn);
            await c.OpenAsync();
            using var cmd = new SqlCommand("INSERT INTO ZONE(ZONE, FACILITY, DESCRIPTION, STATUS, LASTUPDATE, LASTUSER) VALUES(@id, @fac, @desc, @st, GETDATE(), @usr)", c);
            cmd.Parameters.AddWithValue("@id", z.Id);
            cmd.Parameters.AddWithValue("@fac", z.FacilityId);
            cmd.Parameters.AddWithValue("@desc", (object?)z.Description ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@st", z.Status);
            cmd.Parameters.AddWithValue("@usr", z.LastUser ?? "SYSTEM");
            await cmd.ExecuteNonQueryAsync();
            return z.Id;
        }
        catch (SqlException ex) when (ex.Number == 547)
        {
            // Log extra info about constraints
            Console.WriteLine("FK Conflict detected. Dumping constraints...");
            using var c2 = new SqlConnection(_conn);
            await c2.OpenAsync();
            using var cmd2 = new SqlCommand("SELECT name, OBJECT_NAME(parent_object_id) as TableName FROM sys.objects WHERE type IN ('F', 'C')", c2);
            using var r = await cmd2.ExecuteReaderAsync();
            while (await r.ReadAsync())
            {
                Console.WriteLine($"Constraint: {r["name"]} on {r["TableName"]}");
            }
            throw;
        }
    }

    public async Task<bool> UpdateAsync(Zone z)
    {
        using var c = new SqlConnection(_conn);
        await c.OpenAsync();
        using var cmd = new SqlCommand("UPDATE ZONE SET DESCRIPTION = @desc, STATUS = @st, LASTUPDATE = GETDATE(), LASTUSER = @usr WHERE ZONE = @id AND FACILITY = @fac", c);
        cmd.Parameters.AddWithValue("@id", z.Id);
        cmd.Parameters.AddWithValue("@fac", z.FacilityId);
        cmd.Parameters.AddWithValue("@desc", (object?)z.Description ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@st", z.Status);
        cmd.Parameters.AddWithValue("@usr", z.LastUser ?? "SYSTEM");
        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    public async Task<bool> DeleteAsync(string id, string facilityId)
    {
        using var c = new SqlConnection(_conn);
        await c.OpenAsync();
        using var cmd = new SqlCommand("DELETE FROM ZONE WHERE ZONE = @id AND FACILITY = @fac", c);
        cmd.Parameters.AddWithValue("@id", id);
        cmd.Parameters.AddWithValue("@fac", facilityId);
        return await cmd.ExecuteNonQueryAsync() > 0;
    }
}
