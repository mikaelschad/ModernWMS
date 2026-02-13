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

    public async Task<ItemGroup?> GetByIdAsync(string id, string customerId)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = "SELECT * FROM ITEMGROUP WHERE ITEMGROUP = @id AND CUSTID = @cust";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", id);
        cmd.Parameters.AddWithValue("@cust", customerId);
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
        
        var query = @"INSERT INTO ITEMGROUP (
                        ITEMGROUP, DESCRIPTION, CUSTID, CATEGORY, 
                        BASEUOM, TRACKLOTNUMBER, TRACKSERIALNUMBER, TRACKEXPIRATIONDATE, TRACKMANUFACTUREDATE,
                        ISHAZARDOUS, HAZARDCLASS, UNNUMBER, PACKINGGROUP,
                        COMMODITYCODE, COUNTRYOFORIGIN, VELOCITYCLASS,
                        LASTUPDATE, LASTUSER) 
                     VALUES (
                        @id, @desc, @cust, @cat, 
                        @uom, @lot, @serial, @exp, @mfg,
                        @haz, @hclass, @un, @pgroup,
                        @code, @origin, @vel,
                        GETDATE(), @user)";
        
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", itemGroup.Id);
        cmd.Parameters.AddWithValue("@desc", (object?)itemGroup.Description ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@cust", itemGroup.CustomerId);
        cmd.Parameters.AddWithValue("@cat", (object?)itemGroup.Category ?? DBNull.Value);
        
        cmd.Parameters.AddWithValue("@uom", itemGroup.BaseUOM);
        cmd.Parameters.AddWithValue("@lot", itemGroup.TrackLotNumber);
        cmd.Parameters.AddWithValue("@serial", itemGroup.TrackSerialNumber);
        cmd.Parameters.AddWithValue("@exp", itemGroup.TrackExpirationDate);
        cmd.Parameters.AddWithValue("@mfg", itemGroup.TrackManufactureDate);
        
        cmd.Parameters.AddWithValue("@haz", itemGroup.IsHazardous);
        cmd.Parameters.AddWithValue("@hclass", (object?)itemGroup.HazardClass ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@un", (object?)itemGroup.UNNumber ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@pgroup", (object?)itemGroup.PackingGroup ?? DBNull.Value);
        
        cmd.Parameters.AddWithValue("@code", (object?)itemGroup.CommodityCode ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@origin", (object?)itemGroup.CountryOfOrigin ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@vel", (object?)itemGroup.VelocityClass ?? DBNull.Value);

        cmd.Parameters.AddWithValue("@user", itemGroup.LastUser);
        
        await cmd.ExecuteNonQueryAsync();
        return itemGroup.Id;
    }

    public async Task<bool> UpdateAsync(ItemGroup itemGroup)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = @"UPDATE ITEMGROUP SET 
                        DESCRIPTION=@desc, CATEGORY=@cat, 
                        BASEUOM=@uom, TRACKLOTNUMBER=@lot, TRACKSERIALNUMBER=@serial, TRACKEXPIRATIONDATE=@exp, TRACKMANUFACTUREDATE=@mfg,
                        ISHAZARDOUS=@haz, HAZARDCLASS=@hclass, UNNUMBER=@un, PACKINGGROUP=@pgroup,
                        COMMODITYCODE=@code, COUNTRYOFORIGIN=@origin, VELOCITYCLASS=@vel,
                        LASTUPDATE=GETDATE(), LASTUSER=@user 
                      WHERE ITEMGROUP=@id AND CUSTID=@cust";
        
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", itemGroup.Id);
        cmd.Parameters.AddWithValue("@desc", (object?)itemGroup.Description ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@cust", itemGroup.CustomerId);
        cmd.Parameters.AddWithValue("@cat", (object?)itemGroup.Category ?? DBNull.Value);
        
        cmd.Parameters.AddWithValue("@uom", itemGroup.BaseUOM);
        cmd.Parameters.AddWithValue("@lot", itemGroup.TrackLotNumber);
        cmd.Parameters.AddWithValue("@serial", itemGroup.TrackSerialNumber);
        cmd.Parameters.AddWithValue("@exp", itemGroup.TrackExpirationDate);
        cmd.Parameters.AddWithValue("@mfg", itemGroup.TrackManufactureDate);
        
        cmd.Parameters.AddWithValue("@haz", itemGroup.IsHazardous);
        cmd.Parameters.AddWithValue("@hclass", (object?)itemGroup.HazardClass ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@un", (object?)itemGroup.UNNumber ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@pgroup", (object?)itemGroup.PackingGroup ?? DBNull.Value);
        
        cmd.Parameters.AddWithValue("@code", (object?)itemGroup.CommodityCode ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@origin", (object?)itemGroup.CountryOfOrigin ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@vel", (object?)itemGroup.VelocityClass ?? DBNull.Value);

        cmd.Parameters.AddWithValue("@user", itemGroup.LastUser);
        
        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0;
    }

    public async Task<bool> DeleteAsync(string id, string customerId)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = "DELETE FROM ITEMGROUP WHERE ITEMGROUP = @id AND CUSTID = @cust";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", id);
        cmd.Parameters.AddWithValue("@cust", customerId);
        
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
            CustomerId = reader["CUSTID"]?.ToString() ?? string.Empty,
            
            BaseUOM = reader["BASEUOM"]?.ToString() ?? "EA",
            TrackLotNumber = reader["TRACKLOTNUMBER"] != DBNull.Value && Convert.ToBoolean(reader["TRACKLOTNUMBER"]),
            TrackSerialNumber = reader["TRACKSERIALNUMBER"] != DBNull.Value && Convert.ToBoolean(reader["TRACKSERIALNUMBER"]),
            TrackExpirationDate = reader["TRACKEXPIRATIONDATE"] != DBNull.Value && Convert.ToBoolean(reader["TRACKEXPIRATIONDATE"]),
            TrackManufactureDate = reader["TRACKMANUFACTUREDATE"] != DBNull.Value && Convert.ToBoolean(reader["TRACKMANUFACTUREDATE"]),
            
            IsHazardous = reader["ISHAZARDOUS"] != DBNull.Value && Convert.ToBoolean(reader["ISHAZARDOUS"]),
            HazardClass = reader["HAZARDCLASS"]?.ToString(),
            UNNumber = reader["UNNUMBER"]?.ToString(),
            PackingGroup = reader["PACKINGGROUP"]?.ToString(),
            
            CommodityCode = reader["COMMODITYCODE"]?.ToString(),
            CountryOfOrigin = reader["COUNTRYOFORIGIN"]?.ToString(),
            VelocityClass = reader["VELOCITYCLASS"]?.ToString(),

            LastUpdate = reader["LASTUPDATE"] != DBNull.Value ? Convert.ToDateTime(reader["LASTUPDATE"]) : DateTime.Now,
            LastUser = reader["LASTUSER"]?.ToString() ?? "SYSTEM"
        };
    }
}
