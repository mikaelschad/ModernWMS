using Microsoft.Data.SqlClient;
using ModernWMS.Backend.Models;
using System.Data;

namespace ModernWMS.Backend.Repositories;

public class SqlSectionRepository : ISectionRepository
{
    private readonly string _conn;

    public SqlSectionRepository(IConfiguration cfg)
    {
        _conn = cfg.GetConnectionString("LegacySqlDB") ?? throw new InvalidOperationException();
    }

    public async Task<IEnumerable<Section>> GetAllAsync()
    {
        var lst = new List<Section>();
        using var c = new SqlConnection(_conn);
        await c.OpenAsync();
        using var cmd = new SqlCommand("SELECT * FROM SECTION WHERE STATUS != 'I' ORDER BY SECTION", c);
        using var r = await cmd.ExecuteReaderAsync();
        while (await r.ReadAsync())
            lst.Add(Map(r));
        return lst;
    }

    public async Task<Section?> GetByIdAsync(string id)
    {
        using var c = new SqlConnection(_conn);
        await c.OpenAsync();
        using var cmd = new SqlCommand("SELECT * FROM SECTION WHERE SECTION = @id", c);
        cmd.Parameters.AddWithValue("@id", id);
        using var r = await cmd.ExecuteReaderAsync();
        if (await r.ReadAsync())
            return Map(r);
        return null;
    }

    public async Task<string> CreateAsync(Section s)
    {
        using var c = new SqlConnection(_conn);
        await c.OpenAsync();
        using var cmd = new SqlCommand(@"
            INSERT INTO SECTION (SECTION, FACILITY, DESCRIPTION, STATUS, LASTUPDATE, LASTUSER) 
            VALUES (@id, @fac, @desc, @st, GETDATE(), @usr)", c);
        
        cmd.Parameters.AddWithValue("@id", s.Id);
        cmd.Parameters.AddWithValue("@fac", s.FacilityId);
        cmd.Parameters.AddWithValue("@desc", (object?)s.Description ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@st", s.Status);
        cmd.Parameters.AddWithValue("@usr", "SYSTEM");
        
        await cmd.ExecuteNonQueryAsync();
        return s.Id;
    }

    public async Task<bool> UpdateAsync(Section s)
    {
        using var c = new SqlConnection(_conn);
        await c.OpenAsync();
        using var cmd = new SqlCommand(@"
            UPDATE SECTION 
            SET FACILITY = @fac, DESCRIPTION = @desc, STATUS = @st, 
                LASTUPDATE = GETDATE(), LASTUSER = @usr 
            WHERE SECTION = @id", c);
        
        cmd.Parameters.AddWithValue("@id", s.Id);
        cmd.Parameters.AddWithValue("@fac", s.FacilityId);
        cmd.Parameters.AddWithValue("@desc", (object?)s.Description ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@st", s.Status);
        cmd.Parameters.AddWithValue("@usr", "SYSTEM");
        
        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        using var c = new SqlConnection(_conn);
        await c.OpenAsync();
        using var cmd = new SqlCommand("UPDATE SECTION SET STATUS = 'I', LASTUPDATE = GETDATE() WHERE SECTION = @id", c);
        cmd.Parameters.AddWithValue("@id", id);
        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    private Section Map(IDataRecord r) => new Section
    {
        Id = r["SECTION"]?.ToString() ?? "",
        FacilityId = r["FACILITY"]?.ToString() ?? "",
        Description = r["DESCRIPTION"]?.ToString(),
        Status = r["STATUS"]?.ToString() ?? "A",
        LastUpdate = r["LASTUPDATE"] != DBNull.Value ? Convert.ToDateTime(r["LASTUPDATE"]) : DateTime.Now,
        LastUser = r["LASTUSER"]?.ToString() ?? "SYSTEM"
    };
}
