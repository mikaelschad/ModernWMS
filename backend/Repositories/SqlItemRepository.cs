using Microsoft.Data.SqlClient;
using ModernWMS.Backend.Models;
using System.Data;

namespace ModernWMS.Backend.Repositories;

public class SqlItemRepository : IItemRepository
{
    private readonly string _connectionString;

    public SqlItemRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("LegacySqlDB") ?? throw new InvalidOperationException("Connection string not found");
    }

    public async Task<IEnumerable<Item>> GetAllAsync()
    {
        var items = new List<Item>();
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        var query = "SELECT * FROM ITEM WHERE STATUS != 'I' ORDER BY SKU";
        using var cmd = new SqlCommand(query, conn);
        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync()) items.Add(MapItem(reader));
        return items;
    }

    public async Task<Item?> GetByIdAsync(string sku)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        var query = "SELECT * FROM ITEM WHERE SKU = @sku";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@sku", sku);
        using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync()) return MapItem(reader);
        return null;
    }

    public async Task<string> CreateAsync(Item item)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        var query = @"INSERT INTO ITEM (SKU, DESCRIPTION, UNITOFMEASURE, ITEMGROUP, CUSTID, WEIGHT, LENGTH, WIDTH, HEIGHT, STATUS, LASTUPDATE, LASTUSER) 
                     VALUES (@sku, @desc, @uom, @grp, @cust, @wgt, @len, @wid, @hgt, @status, GETDATE(), @user)";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@sku", item.SKU);
        cmd.Parameters.AddWithValue("@desc", item.Description);
        cmd.Parameters.AddWithValue("@uom", item.UnitOfMeasure);
        cmd.Parameters.AddWithValue("@grp", (object?)item.ItemGroupId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@cust", (object?)item.CustomerId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@wgt", (object?)item.Weight ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@len", (object?)item.Length ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@wid", (object?)item.Width ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@hgt", (object?)item.Height ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@status", item.Status);
        cmd.Parameters.AddWithValue("@user", "SYSTEM");
        await cmd.ExecuteNonQueryAsync();
        return item.SKU;
    }

    public async Task<bool> UpdateAsync(Item item)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        var query = @"UPDATE ITEM SET DESCRIPTION=@desc, UNITOFMEASURE=@uom, ITEMGROUP=@grp, CUSTID=@cust, WEIGHT=@wgt, LENGTH=@len, WIDTH=@wid, HEIGHT=@hgt, STATUS=@status, LASTUPDATE=GETDATE(), LASTUSER=@user WHERE SKU=@sku";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@sku", item.SKU);
        cmd.Parameters.AddWithValue("@desc", item.Description);
        cmd.Parameters.AddWithValue("@uom", item.UnitOfMeasure);
        cmd.Parameters.AddWithValue("@grp", (object?)item.ItemGroupId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@cust", (object?)item.CustomerId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@wgt", (object?)item.Weight ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@len", (object?)item.Length ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@wid", (object?)item.Width ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@hgt", (object?)item.Height ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@status", item.Status);
        cmd.Parameters.AddWithValue("@user", "SYSTEM");
        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0;
    }

    public async Task<bool> DeleteAsync(string sku)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        var query = "UPDATE ITEM SET STATUS = 'I', LASTUPDATE = GETDATE() WHERE SKU = @sku";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@sku", sku);
        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0;
    }

    private Item MapItem(IDataRecord r) => new Item
    {
        SKU = r["SKU"]?.ToString() ?? "",
        Description = r["DESCRIPTION"]?.ToString() ?? "",
        UnitOfMeasure = r["UNITOFMEASURE"]?.ToString() ?? "EA",
        ItemGroupId = r["ITEMGROUP"]?.ToString(),
        CustomerId = r["CUSTID"]?.ToString(),
        Weight = r["WEIGHT"] != DBNull.Value ? Convert.ToDecimal(r["WEIGHT"]) : null,
        Length = r["LENGTH"] != DBNull.Value ? Convert.ToDecimal(r["LENGTH"]) : null,
        Width = r["WIDTH"] != DBNull.Value ? Convert.ToDecimal(r["WIDTH"]) : null,
        Height = r["HEIGHT"] != DBNull.Value ? Convert.ToDecimal(r["HEIGHT"]) : null,
        Status = r["STATUS"]?.ToString() ?? "A",
        LastUpdate = r["LASTUPDATE"] != DBNull.Value ? Convert.ToDateTime(r["LASTUPDATE"]) : DateTime.Now,
        LastUser = r["LASTUSER"]?.ToString() ?? "SYSTEM"
    };
}
