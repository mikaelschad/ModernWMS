using ModernWMS.Backend.Models;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Text;

namespace ModernWMS.Backend.Repositories;

public class SqlLicensePlateRepository : ILicensePlateRepository
{
    private readonly string _connectionString;

    public SqlLicensePlateRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("LegacySqlDB") ?? string.Empty;
    }

    public async Task<LicensePlate?> GetByIdAsync(string id)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        string query = "SELECT * FROM PLATE WHERE LPID = @id";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", id);

        using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return MapPlate(reader);
        }
        return null;
    }

    public async Task<IEnumerable<LicensePlate>> GetByLocationAsync(string facilityId, string location)
    {
        var plates = new List<LicensePlate>();
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        string query = "SELECT * FROM PLATE WHERE FACILITY = @facilityId AND LOCATION = @location";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@facilityId", facilityId);
        cmd.Parameters.AddWithValue("@location", location);

        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            plates.Add(MapPlate(reader));
        }
        return plates;
    }

    public async Task<IEnumerable<LicensePlate>> GetBySKUAsync(string facilityId, string sku)
    {
        var plates = new List<LicensePlate>();
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        string query = "SELECT * FROM PLATE WHERE FACILITY = @facilityId AND ITEM = @sku";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@facilityId", facilityId);
        cmd.Parameters.AddWithValue("@sku", sku);

        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            plates.Add(MapPlate(reader));
        }
        return plates;
    }

    public async Task<string> CreateAsync(LicensePlate plate)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        string query = @"INSERT INTO PLATE (LPID, ITEM, CUSTID, FACILITY, LOCATION, STATUS, QUANTITY, UNITOFMEASURE, LOTNUMBER, LASTUPDATE, LASTUSER) 
                        VALUES (@id, @sku, @cust, @fac, @loc, @stat, @qty, @uom, @lot, GETDATE(), @user)";
        
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", plate.Id);
        cmd.Parameters.AddWithValue("@sku", plate.SKU);
        cmd.Parameters.AddWithValue("@cust", (object?)plate.CustomerId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@fac", (object?)plate.FacilityId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@loc", (object?)plate.Location ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@stat", plate.Status.ToString().Substring(0, 1)); // Simplified mapping
        cmd.Parameters.AddWithValue("@qty", plate.Quantity);
        cmd.Parameters.AddWithValue("@uom", (object?)plate.UnitOfMeasure ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@lot", (object?)plate.LotNumber ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@user", (object?)plate.LastUser ?? "SYSTEM");

        await cmd.ExecuteNonQueryAsync();
        return plate.Id;
    }

    public async Task<bool> UpdateAsync(LicensePlate plate)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        string query = @"UPDATE PLATE SET ITEM = @sku, CUSTID = @cust, FACILITY = @fac, LOCATION = @loc, STATUS = @stat, QUANTITY = @qty, LASTUPDATE = GETDATE(), LASTUSER = @user WHERE LPID = @id";
        
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", plate.Id);
        cmd.Parameters.AddWithValue("@sku", plate.SKU);
        cmd.Parameters.AddWithValue("@cust", (object?)plate.CustomerId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@fac", (object?)plate.FacilityId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@loc", (object?)plate.Location ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@stat", plate.Status.ToString().Substring(0, 1));
        cmd.Parameters.AddWithValue("@qty", plate.Quantity);
        cmd.Parameters.AddWithValue("@user", (object?)plate.LastUser ?? "SYSTEM");

        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0;
    }

    public async Task<bool> MovePlateAsync(string plateId, string targetLocation, string lastUser)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        string query = "UPDATE PLATE SET LOCATION = @location, LASTUSER = @user, LASTUPDATE = GETDATE() WHERE LPID = @id";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@location", targetLocation);
        cmd.Parameters.AddWithValue("@user", lastUser);
        cmd.Parameters.AddWithValue("@id", plateId);

        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0;
    }

    public async Task<IEnumerable<LicensePlate>> SearchAsync(PlateSearchCriteria criteria)
    {
        var plates = new List<LicensePlate>();
        try {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = new StringBuilder("SELECT ");
            if (criteria.Limit.HasValue) sql.Append($"TOP {criteria.Limit.Value} ");
            sql.Append("* FROM PLATE WHERE 1=1");
            
            var cmd = new SqlCommand();
            cmd.Connection = conn;

            if (!string.IsNullOrEmpty(criteria.LPID)) {
                sql.Append(" AND LPID LIKE @lpid");
                cmd.Parameters.AddWithValue("@lpid", $"%{criteria.LPID}%");
            }
            if (!string.IsNullOrEmpty(criteria.SKU)) {
                sql.Append(" AND ITEM LIKE @sku");
                cmd.Parameters.AddWithValue("@sku", $"%{criteria.SKU}%");
            }
            if (!string.IsNullOrEmpty(criteria.CustomerId)) {
                sql.Append(" AND CUSTID = @custid");
                cmd.Parameters.AddWithValue("@custid", criteria.CustomerId);
            }
            if (!string.IsNullOrEmpty(criteria.FacilityId)) {
                sql.Append(" AND FACILITY = @facilityid");
                cmd.Parameters.AddWithValue("@facilityid", criteria.FacilityId);
            }
            if (!string.IsNullOrEmpty(criteria.Location)) {
                sql.Append(" AND LOCATION LIKE @location");
                cmd.Parameters.AddWithValue("@location", $"%{criteria.Location}%");
            }
            if (!string.IsNullOrEmpty(criteria.LotNumber)) {
                sql.Append(" AND LOTNUMBER LIKE @lot");
                cmd.Parameters.AddWithValue("@lot", $"%{criteria.LotNumber}%");
            }
            if (!string.IsNullOrEmpty(criteria.Status)) {
                sql.Append(" AND STATUS = @status");
                cmd.Parameters.AddWithValue("@status", criteria.Status);
            }

            cmd.CommandText = sql.ToString();
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                plates.Add(MapPlate(reader));
            }
        }
        catch 
        {
            // Fallback for demo if table doesn't exist
            return new List<LicensePlate>();
        }
        return plates;
    }

    public async Task<IEnumerable<string>> GetCustomersAsync(bool onlyActive = false)
    {
        var customers = new List<string>();
        try {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            string query = "SELECT DISTINCT CUSTID FROM PLATE WHERE CUSTID IS NOT NULL";
            if (onlyActive) query += " AND STATUS = 'A'";
            using var cmd = new SqlCommand(query, conn);
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync()) {
                customers.Add(reader[0].ToString() ?? string.Empty);
            }
        } catch { return new List<string> { "DEMO_CUST" }; }
        return customers;
    }

    public async Task<IEnumerable<string>> GetFacilitiesAsync(bool onlyActive = false)
    {
        var facilities = new List<string>();
        try {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
            string query = "SELECT DISTINCT FACILITY FROM PLATE WHERE FACILITY IS NOT NULL";
            if (onlyActive) query += " AND STATUS = 'A'";
            using var cmd = new SqlCommand(query, conn);
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync()) {
                facilities.Add(reader[0].ToString() ?? string.Empty);
            }
        } catch { return new List<string> { "DEMO_FAC" }; }
        return facilities;
    }

    public async Task<bool> DeleteAsync(string id, string lastUser)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        string query = "UPDATE PLATE SET STATUS = 'X', LASTUPDATE = GETDATE(), LASTUSER = @user WHERE LPID = @id";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", id);
        cmd.Parameters.AddWithValue("@user", lastUser);
        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0;
    }

    private LicensePlate MapPlate(IDataRecord reader)
    {
        return new LicensePlate
        {
            Id = reader["LPID"]?.ToString() ?? string.Empty,
            SKU = reader["ITEM"]?.ToString() ?? string.Empty,
            CustomerId = reader["CUSTID"]?.ToString(),
            FacilityId = reader["FACILITY"]?.ToString(),
            Location = reader["LOCATION"]?.ToString(),
            Status = MapStatus(reader["STATUS"]?.ToString()),
            HoldReason = reader["HOLDREASON"]?.ToString(),
            UnitOfMeasure = reader["UNITOFMEASURE"]?.ToString(),
            Quantity = Convert.ToDecimal(reader["QUANTITY"]),
            PlateType = reader["TYPE"]?.ToString(),
            SerialNumber = reader["SERIALNUMBER"]?.ToString(),
            LotNumber = reader["LOTNUMBER"]?.ToString(),
            CreationDate = reader["CREATIONDATE"] as DateTime?,
            ManufactureDate = reader["MANUFACTUREDATE"] as DateTime?,
            ExpirationDate = reader["EXPIRATIONDATE"] as DateTime?,
            PurchaseOrder = reader["PO"]?.ToString(),
            ParentLPID = reader["PARENTLPID"]?.ToString(),
            Weight = reader["WEIGHT"] != DBNull.Value ? Convert.ToDecimal(reader["WEIGHT"]) : null,
            InventoryClass = reader["INVENTORYCLASS"]?.ToString(),
            LastUpdate = Convert.ToDateTime(reader["LASTUPDATE"]),
            LastUser = reader["LASTUSER"]?.ToString()
        };
    }

    private PlateStatus MapStatus(string? status)
    {
        return status switch
        {
            "A" => PlateStatus.Active,
            "H" => PlateStatus.Hold,
            "C" => PlateStatus.Consumed,
            "X" => PlateStatus.Canceled,
            "I" => PlateStatus.InTransit,
            _ => PlateStatus.Active
        };
    }
}
