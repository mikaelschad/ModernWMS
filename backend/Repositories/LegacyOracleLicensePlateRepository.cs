using ModernWMS.Backend.Models;
using Oracle.ManagedDataAccess.Client;
using System.Data;

namespace ModernWMS.Backend.Repositories;

public class LegacyOracleLicensePlateRepository : ILicensePlateRepository
{
    private readonly string _connectionString;

    public LegacyOracleLicensePlateRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("LegacyOracleDB") ?? string.Empty;
    }

    public async Task<LicensePlate?> GetByIdAsync(string id)
    {
        using var conn = new OracleConnection(_connectionString);
        await conn.OpenAsync();

        string query = "SELECT * FROM PLATE WHERE LPID = :id";
        using var cmd = new OracleCommand(query, conn);
        cmd.Parameters.Add("id", OracleDbType.Varchar2).Value = id;

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
        using var conn = new OracleConnection(_connectionString);
        await conn.OpenAsync();

        string query = "SELECT * FROM PLATE WHERE FACILITY = :facilityId AND LOCATION = :location";
        using var cmd = new OracleCommand(query, conn);
        cmd.Parameters.Add("facilityId", OracleDbType.Varchar2).Value = facilityId;
        cmd.Parameters.Add("location", OracleDbType.Varchar2).Value = location;

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
        using var conn = new OracleConnection(_connectionString);
        await conn.OpenAsync();

        string query = "SELECT * FROM PLATE WHERE FACILITY = :facilityId AND ITEM = :sku";
        using var cmd = new OracleCommand(query, conn);
        cmd.Parameters.Add("facilityId", OracleDbType.Varchar2).Value = facilityId;
        cmd.Parameters.Add("sku", OracleDbType.Varchar2).Value = sku;

        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            plates.Add(MapPlate(reader));
        }
        return plates;
    }

    public Task<string> CreateAsync(LicensePlate plate)
    {
        // Implementation for creating a new plate in legacy system
        // This is usually a complex transaction in WMS, but simplified here for skeletal integration
        return Task.FromResult(plate.Id);
    }

    public Task<bool> UpdateAsync(LicensePlate plate)
    {
        return Task.FromResult(true);
    }

    public async Task<bool> MovePlateAsync(string plateId, string targetLocation, string lastUser)
    {
        using var conn = new OracleConnection(_connectionString);
        await conn.OpenAsync();

        string query = "UPDATE PLATE SET LOCATION = :location, LASTUSER = :user, LASTUPDATE = CURRENT_DATE WHERE LPID = :id";
        using var cmd = new OracleCommand(query, conn);
        cmd.Parameters.Add("location", OracleDbType.Varchar2).Value = targetLocation;
        cmd.Parameters.Add("user", OracleDbType.Varchar2).Value = lastUser;
        cmd.Parameters.Add("id", OracleDbType.Varchar2).Value = plateId;

        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0;
    }

    public async Task<IEnumerable<LicensePlate>> SearchAsync(PlateSearchCriteria criteria)
    {
        var plates = new List<LicensePlate>();
        using var conn = new OracleConnection(_connectionString);
        await conn.OpenAsync();

        var sql = new System.Text.StringBuilder("SELECT * FROM PLATE WHERE 1=1");
        var parameters = new List<OracleParameter>();

        if (!string.IsNullOrEmpty(criteria.LPID)) {
            sql.Append(" AND LPID LIKE :lpid");
            parameters.Add(new OracleParameter("lpid", $"%{criteria.LPID}%"));
        }
        if (!string.IsNullOrEmpty(criteria.SKU)) {
            sql.Append(" AND ITEM LIKE :sku");
            parameters.Add(new OracleParameter("sku", $"%{criteria.SKU}%"));
        }
        if (!string.IsNullOrEmpty(criteria.CustomerId)) {
            sql.Append(" AND CUSTID = :custid");
            parameters.Add(new OracleParameter("custid", criteria.CustomerId));
        }
        if (!string.IsNullOrEmpty(criteria.FacilityId)) {
            sql.Append(" AND FACILITY = :facilityid");
            parameters.Add(new OracleParameter("facilityid", criteria.FacilityId));
        }
        if (!string.IsNullOrEmpty(criteria.Location)) {
            sql.Append(" AND LOCATION LIKE :location");
            parameters.Add(new OracleParameter("location", $"%{criteria.Location}%"));
        }
        if (!string.IsNullOrEmpty(criteria.LotNumber)) {
            sql.Append(" AND LOTNUMBER LIKE :lot");
            parameters.Add(new OracleParameter("lot", $"%{criteria.LotNumber}%"));
        }
        if (!string.IsNullOrEmpty(criteria.Status)) {
            sql.Append(" AND STATUS = :status");
            parameters.Add(new OracleParameter("status", criteria.Status));
        }

        if (criteria.Limit.HasValue)
        {
            sql.Append(" FETCH FIRST :limit ROWS ONLY");
            parameters.Add(new OracleParameter("limit", criteria.Limit.Value));
        }

        using var cmd = new OracleCommand(sql.ToString(), conn);
        cmd.Parameters.AddRange(parameters.ToArray());

        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            plates.Add(MapPlate(reader));
        }
        return plates;
    }

    public async Task<IEnumerable<string>> GetCustomersAsync(bool onlyActive = false)
    {
        var customers = new List<string>();
        using var conn = new OracleConnection(_connectionString);
        await conn.OpenAsync();
        string query = "SELECT DISTINCT CUSTID FROM PLATE WHERE CUSTID IS NOT NULL";
        if (onlyActive) query += " AND STATUS = 'A'";
        query += " ORDER BY CUSTID";
        using var cmd = new OracleCommand(query, conn);
        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync()) {
            customers.Add(reader[0].ToString() ?? string.Empty);
        }
        return customers;
    }

    public async Task<IEnumerable<string>> GetFacilitiesAsync(bool onlyActive = false)
    {
        var facilities = new List<string>();
        using var conn = new OracleConnection(_connectionString);
        await conn.OpenAsync();
        string query = "SELECT DISTINCT FACILITY FROM PLATE WHERE FACILITY IS NOT NULL";
        if (onlyActive) query += " AND STATUS = 'A'";
        query += " ORDER BY FACILITY";
        using var cmd = new OracleCommand(query, conn);
        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync()) {
            facilities.Add(reader[0].ToString() ?? string.Empty);
        }
        return facilities;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        using var conn = new OracleConnection(_connectionString);
        await conn.OpenAsync();
        string query = "UPDATE PLATE SET STATUS = 'X', LASTUPDATE = CURRENT_DATE WHERE LPID = :id";
        using var cmd = new OracleCommand(query, conn);
        cmd.BindByName = true;
        cmd.Parameters.Add("id", OracleDbType.Varchar2).Value = id;
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
            _ => PlateStatus.Active
        };
    }
}
