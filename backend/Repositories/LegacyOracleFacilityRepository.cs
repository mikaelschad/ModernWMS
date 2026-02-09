using ModernWMS.Backend.Models;
using Oracle.ManagedDataAccess.Client;
using System.Data;

namespace ModernWMS.Backend.Repositories;

public class LegacyOracleFacilityRepository : IFacilityRepository
{
    private readonly string _connectionString;

    public LegacyOracleFacilityRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("LegacyOracleDB") ?? string.Empty;
    }

    private const string BaseSelect = @"
        SELECT FACILITY, NAME, ADDR1, ADDR2, CITY, STATE, POSTALCODE, COUNTRYCODE, PHONE, FAX, EMAIL, MANAGER, FACILITYSTATUS, 
               REMITNAME, REMITADDR1, REMITCITY, REMITSTATE, REMITPOSTALCODE, TASKLIMIT, XDOCKLOC, FACILITYGROUP,
               USE_LOCATION_CHECKDIGIT, RESTRICT_PUTAWAY, WORKSUNDAY_IN, WORKMONDAY_IN, WORKTUESDAY_IN, 
               WORKWEDNESDAY_IN, WORKTHURSDAY_IN, WORKFRIDAY_IN, WORKSATURDAY_IN,
               LASTUPDATE, LASTUSER 
        FROM FACILITY ";

    public async Task<IEnumerable<Facility>> GetAllAsync()
    {
        var facilities = new List<Facility>();
        using var conn = new OracleConnection(_connectionString);
        await conn.OpenAsync();

        string query = BaseSelect + " ORDER BY FACILITY";
        using var cmd = new OracleCommand(query, conn);
        cmd.BindByName = true;

        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            facilities.Add(MapFacility(reader));
        }
        return facilities;
    }

    public async Task<Facility?> GetByIdAsync(string id)
    {
        using var conn = new OracleConnection(_connectionString);
        await conn.OpenAsync();

        string query = BaseSelect + " WHERE FACILITY = :id";
        using var cmd = new OracleCommand(query, conn);
        cmd.BindByName = true;
        cmd.Parameters.Add("id", OracleDbType.Varchar2).Value = id;

        using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return MapFacility(reader);
        }
        return null;
    }

    public async Task<string> CreateAsync(Facility facility)
    {
        using var conn = new OracleConnection(_connectionString);
        await conn.OpenAsync();

        string query = @"INSERT INTO FACILITY (
                            FACILITY, NAME, ADDR1, ADDR2, CITY, STATE, POSTALCODE, COUNTRYCODE, PHONE, FAX, EMAIL, MANAGER, FACILITYSTATUS,
                            REMITNAME, REMITADDR1, REMITCITY, REMITSTATE, REMITPOSTALCODE, TASKLIMIT, XDOCKLOC, FACILITYGROUP,
                            USE_LOCATION_CHECKDIGIT, RESTRICT_PUTAWAY, WORKSUNDAY_IN, WORKMONDAY_IN, WORKTUESDAY_IN, 
                            WORKWEDNESDAY_IN, WORKTHURSDAY_IN, WORKFRIDAY_IN, WORKSATURDAY_IN,
                            LASTUPDATE, LASTUSER) 
                        VALUES (
                            :id, :name, :addr1, :addr2, :city, :state, :zip, :country, :phone, :fax, :email, :manager, :status,
                            :rname, :raddr1, :rcity, :rstate, :rzip, :tlimit, :xdock, :fgroup,
                            :chkdigit, :rput, :wsun, :wmon, :wtue, :wwed, :wthu, :wfri, :wsat,
                            CURRENT_DATE, :luser)";
        
        using var cmd = new OracleCommand(query, conn);
        cmd.BindByName = true;
        AddParameters(cmd, facility);
        cmd.Parameters.Add("id", OracleDbType.Varchar2).Value = facility.Id;

        await cmd.ExecuteNonQueryAsync();
        return facility.Id;
    }

    public async Task<bool> UpdateAsync(Facility facility)
    {
        using var conn = new OracleConnection(_connectionString);
        await conn.OpenAsync();

        string query = @"UPDATE FACILITY SET 
                            NAME = :name, ADDR1 = :addr1, ADDR2 = :addr2, CITY = :city, STATE = :state, 
                            POSTALCODE = :zip, COUNTRYCODE = :country, PHONE = :phone, FAX = :fax, EMAIL = :email, 
                            MANAGER = :manager, FACILITYSTATUS = :status,
                            REMITNAME = :rname, REMITADDR1 = :raddr1, REMITCITY = :rcity, REMITSTATE = :rstate, REMITPOSTALCODE = :rzip,
                            TASKLIMIT = :tlimit, XDOCKLOC = :xdock, FACILITYGROUP = :fgroup,
                            USE_LOCATION_CHECKDIGIT = :chkdigit, RESTRICT_PUTAWAY = :rput,
                            WORKSUNDAY_IN = :wsun, WORKMONDAY_IN = :wmon, WORKTUESDAY_IN = :wtue, 
                            WORKWEDNESDAY_IN = :wwed, WORKTHURSDAY_IN = :wthu, WORKFRIDAY_IN = :wfri, WORKSATURDAY_IN = :wsat,
                            LASTUPDATE = CURRENT_DATE, LASTUSER = :luser 
                         WHERE FACILITY = :id";
        
        using var cmd = new OracleCommand(query, conn);
        cmd.BindByName = true;
        AddParameters(cmd, facility);
        cmd.Parameters.Add("id", OracleDbType.Varchar2).Value = facility.Id;

        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0;
    }

    private void AddParameters(OracleCommand cmd, Facility facility)
    {
        cmd.Parameters.Add("name", OracleDbType.Varchar2).Value = (object?)facility.Name ?? DBNull.Value;
        cmd.Parameters.Add("addr1", OracleDbType.Varchar2).Value = (object?)facility.Address1 ?? DBNull.Value;
        cmd.Parameters.Add("addr2", OracleDbType.Varchar2).Value = (object?)facility.Address2 ?? DBNull.Value;
        cmd.Parameters.Add("city", OracleDbType.Varchar2).Value = (object?)facility.City ?? DBNull.Value;
        cmd.Parameters.Add("state", OracleDbType.Varchar2).Value = (object?)facility.State ?? DBNull.Value;
        cmd.Parameters.Add("zip", OracleDbType.Varchar2).Value = (object?)facility.PostalCode ?? DBNull.Value;
        cmd.Parameters.Add("country", OracleDbType.Varchar2).Value = (object?)facility.CountryCode ?? DBNull.Value;
        cmd.Parameters.Add("phone", OracleDbType.Varchar2).Value = (object?)facility.Phone ?? DBNull.Value;
        cmd.Parameters.Add("fax", OracleDbType.Varchar2).Value = (object?)facility.Fax ?? DBNull.Value;
        cmd.Parameters.Add("email", OracleDbType.Varchar2).Value = (object?)facility.Email ?? DBNull.Value;
        cmd.Parameters.Add("manager", OracleDbType.Varchar2).Value = (object?)facility.Manager ?? DBNull.Value;
        cmd.Parameters.Add("status", OracleDbType.Varchar2).Value = facility.Status;
        
        // Setup fields
        cmd.Parameters.Add("rname", OracleDbType.Varchar2).Value = (object?)facility.RemitName ?? DBNull.Value;
        cmd.Parameters.Add("raddr1", OracleDbType.Varchar2).Value = (object?)facility.RemitAddress1 ?? DBNull.Value;
        cmd.Parameters.Add("rcity", OracleDbType.Varchar2).Value = (object?)facility.RemitCity ?? DBNull.Value;
        cmd.Parameters.Add("rstate", OracleDbType.Varchar2).Value = (object?)facility.RemitState ?? DBNull.Value;
        cmd.Parameters.Add("rzip", OracleDbType.Varchar2).Value = (object?)facility.RemitPostalCode ?? DBNull.Value;
        cmd.Parameters.Add("tlimit", OracleDbType.Int32).Value = (object?)facility.TaskLimit ?? DBNull.Value;
        cmd.Parameters.Add("xdock", OracleDbType.Varchar2).Value = (object?)facility.CrossDockLocation ?? DBNull.Value;
        cmd.Parameters.Add("fgroup", OracleDbType.Varchar2).Value = (object?)facility.FacilityGroup ?? DBNull.Value;
        
        // Flags
        cmd.Parameters.Add("chkdigit", OracleDbType.Char).Value = facility.UseLocationCheckdigit ?? "N";
        cmd.Parameters.Add("rput", OracleDbType.Char).Value = facility.RestrictPutaway ?? "N";
        
        // Schedule
        cmd.Parameters.Add("wsun", OracleDbType.Char).Value = facility.WorkSundayIn ?? "N";
        cmd.Parameters.Add("wmon", OracleDbType.Char).Value = facility.WorkMondayIn ?? "Y";
        cmd.Parameters.Add("wtue", OracleDbType.Char).Value = facility.WorkTuesdayIn ?? "Y";
        cmd.Parameters.Add("wwed", OracleDbType.Char).Value = facility.WorkWednesdayIn ?? "Y";
        cmd.Parameters.Add("wthu", OracleDbType.Char).Value = facility.WorkThursdayIn ?? "Y";
        cmd.Parameters.Add("wfri", OracleDbType.Char).Value = facility.WorkFridayIn ?? "Y";
        cmd.Parameters.Add("wsat", OracleDbType.Char).Value = facility.WorkSaturdayIn ?? "N";

        cmd.Parameters.Add("luser", OracleDbType.Varchar2).Value = (object?)facility.LastUser ?? "SYSTEM";
    }

    public async Task<bool> DeleteAsync(string id)
    {
        using var conn = new OracleConnection(_connectionString);
        await conn.OpenAsync();
        string query = "UPDATE FACILITY SET FACILITYSTATUS = 'I', LASTUPDATE = CURRENT_DATE WHERE FACILITY = :id";
        using var cmd = new OracleCommand(query, conn);
        cmd.BindByName = true;
        cmd.Parameters.Add("id", OracleDbType.Varchar2).Value = id;
        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0;
    }

    private Facility MapFacility(IDataRecord reader)
    {
        return new Facility
        {
            Id = reader["FACILITY"]?.ToString() ?? string.Empty,
            Name = reader["NAME"]?.ToString(),
            Address1 = reader["ADDR1"]?.ToString(),
            Address2 = reader["ADDR2"]?.ToString(),
            City = reader["CITY"]?.ToString(),
            State = reader["STATE"]?.ToString(),
            PostalCode = reader["POSTALCODE"]?.ToString(),
            CountryCode = reader["COUNTRYCODE"]?.ToString(),
            Phone = reader["PHONE"]?.ToString(),
            Fax = reader["FAX"]?.ToString(),
            Email = reader["EMAIL"]?.ToString(),
            Manager = reader["MANAGER"]?.ToString(),
            Status = reader["FACILITYSTATUS"]?.ToString() ?? "A",
            
            RemitName = reader["REMITNAME"]?.ToString(),
            RemitAddress1 = reader["REMITADDR1"]?.ToString(),
            RemitCity = reader["REMITCITY"]?.ToString(),
            RemitState = reader["REMITSTATE"]?.ToString(),
            RemitPostalCode = reader["REMITPOSTALCODE"]?.ToString(),
            
            TaskLimit = reader["TASKLIMIT"] != DBNull.Value ? Convert.ToInt32(reader["TASKLIMIT"]) : null,
            CrossDockLocation = reader["XDOCKLOC"]?.ToString(),
            FacilityGroup = reader["FACILITYGROUP"]?.ToString(),
            
            UseLocationCheckdigit = reader["USE_LOCATION_CHECKDIGIT"]?.ToString() ?? "N",
            RestrictPutaway = reader["RESTRICT_PUTAWAY"]?.ToString() ?? "N",
            
            WorkSundayIn = reader["WORKSUNDAY_IN"]?.ToString() ?? "N",
            WorkMondayIn = reader["WORKMONDAY_IN"]?.ToString() ?? "Y",
            WorkTuesdayIn = reader["WORKTUESDAY_IN"]?.ToString() ?? "Y",
            WorkWednesdayIn = reader["WORKWEDNESDAY_IN"]?.ToString() ?? "Y",
            WorkThursdayIn = reader["WORKTHURSDAY_IN"]?.ToString() ?? "Y",
            WorkFridayIn = reader["WORKFRIDAY_IN"]?.ToString() ?? "Y",
            WorkSaturdayIn = reader["WORKSATURDAY_IN"]?.ToString() ?? "N",

            LastUpdate = Convert.ToDateTime(reader["LASTUPDATE"]),
            LastUser = reader["LASTUSER"]?.ToString()
        };
    }
}
