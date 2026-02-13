using ModernWMS.Backend.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace ModernWMS.Backend.Repositories;

public class SqlFacilityRepository : IFacilityRepository
{
    private readonly string _connectionString;

    public SqlFacilityRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("LegacySqlDB") ?? string.Empty;
    }

    private const string BaseSelect = @"
        SELECT FACILITY as Id, NAME, ADDR1 as Address1, ADDR2 as Address2, CITY, STATE, POSTALCODE as PostalCode, 
               COUNTRYCODE as CountryCode, PHONE, FAX, EMAIL, MANAGER, FACILITYSTATUS as Status, 
               REMITNAME as RemitName, REMITADDR1 as RemitAddress1, REMITCITY as RemitCity, REMITSTATE as RemitState, 
               REMITPOSTALCODE as RemitPostalCode, TASKLIMIT as TaskLimit, XDOCKLOC as CrossDockLocation, 
               FACILITYGROUP as FacilityGroup, USE_LOCATION_CHECKDIGIT as UseLocationCheckdigit, 
               RESTRICT_PUTAWAY as RestrictPutaway, WORKSUNDAY_IN as WorkSundayIn, WORKMONDAY_IN as WorkMondayIn, 
               WORKTUESDAY_IN as WorkTuesdayIn, WORKWEDNESDAY_IN as WorkWednesdayIn, 
               WORKTHURSDAY_IN as WorkThursdayIn, WORKFRIDAY_IN as WorkFridayIn, WORKSATURDAY_IN as WorkSaturdayIn,
               LASTUPDATE as LastUpdate, LASTUSER as LastUser 
        FROM FACILITY ";

    public async Task<IEnumerable<Facility>> GetAllAsync()
    {
        var facilities = new List<Facility>();
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        string query = BaseSelect + " ORDER BY FACILITY";
        using var cmd = new SqlCommand(query, conn);

        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            facilities.Add(MapSqlFacility(reader));
        }
        return facilities;
    }

    public async Task<Facility?> GetByIdAsync(string id)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        string query = BaseSelect + " WHERE FACILITY = @id";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", id);

        using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return MapSqlFacility(reader);
        }
        return null;
    }

    public async Task<string> CreateAsync(Facility facility)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        string query = @"INSERT INTO FACILITY (
                            FACILITY, NAME, ADDR1, ADDR2, CITY, STATE, POSTALCODE, COUNTRYCODE, PHONE, FAX, EMAIL, MANAGER, FACILITYSTATUS,
                            REMITNAME, REMITADDR1, REMITCITY, REMITSTATE, REMITPOSTALCODE, TASKLIMIT, XDOCKLOC, FACILITYGROUP,
                            USE_LOCATION_CHECKDIGIT, RESTRICT_PUTAWAY, WORKSUNDAY_IN, WORKMONDAY_IN, WORKTUESDAY_IN, 
                            WORKWEDNESDAY_IN, WORKTHURSDAY_IN, WORKFRIDAY_IN, WORKSATURDAY_IN,
                            LASTUPDATE, LASTUSER) 
                        VALUES (
                            @id, @name, @addr1, @addr2, @city, @state, @zip, @country, @phone, @fax, @email, @manager, @status,
                            @rname, @raddr1, @rcity, @rstate, @rzip, @tlimit, @xdock, @fgroup,
                            @chkdigit, @rput, @wsun, @wmon, @wtue, @wwed, @wthu, @wfri, @wsat,
                            GETDATE(), @luser)";
        
        using var cmd = new SqlCommand(query, conn);
        AddParameters(cmd, facility);
        cmd.Parameters.AddWithValue("@id", facility.Id);

        await cmd.ExecuteNonQueryAsync();
        return facility.Id;
    }

    public async Task<bool> UpdateAsync(Facility facility)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        string query = @"UPDATE FACILITY SET 
                            NAME = @name, ADDR1 = @addr1, ADDR2 = @addr2, CITY = @city, STATE = @state, 
                            POSTALCODE = @zip, COUNTRYCODE = @country, PHONE = @phone, FAX = @fax, EMAIL = @email, 
                            MANAGER = @manager, FACILITYSTATUS = @status,
                            REMITNAME = @rname, REMITADDR1 = @raddr1, REMITCITY = @rcity, REMITSTATE = @rstate, REMITPOSTALCODE = @rzip,
                            TASKLIMIT = @tlimit, XDOCKLOC = @xdock, FACILITYGROUP = @fgroup,
                            USE_LOCATION_CHECKDIGIT = @chkdigit, RESTRICT_PUTAWAY = @rput,
                            WORKSUNDAY_IN = @wsun, WORKMONDAY_IN = @wmon, WORKTUESDAY_IN = @wtue, 
                            WORKWEDNESDAY_IN = @wwed, WORKTHURSDAY_IN = @wthu, WORKFRIDAY_IN = @wfri, WORKSATURDAY_IN = @wsat,
                            LASTUPDATE = GETDATE(), LASTUSER = @luser 
                         WHERE FACILITY = @id";
        
        using var cmd = new SqlCommand(query, conn);
        AddParameters(cmd, facility);
        cmd.Parameters.AddWithValue("@id", facility.Id);

        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0;
    }

    private void AddParameters(SqlCommand cmd, Facility facility)
    {
        cmd.Parameters.AddWithValue("@name", (object?)facility.Name ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@addr1", (object?)facility.Address1 ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@addr2", (object?)facility.Address2 ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@city", (object?)facility.City ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@state", (object?)facility.State ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@zip", (object?)facility.PostalCode ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@country", (object?)facility.CountryCode ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@phone", (object?)facility.Phone ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@fax", (object?)facility.Fax ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@email", (object?)facility.Email ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@manager", (object?)facility.Manager ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@status", facility.Status);
        
        cmd.Parameters.AddWithValue("@rname", (object?)facility.RemitName ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@raddr1", (object?)facility.RemitAddress1 ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@rcity", (object?)facility.RemitCity ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@rstate", (object?)facility.RemitState ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@rzip", (object?)facility.RemitPostalCode ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@tlimit", (object?)facility.TaskLimit ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@xdock", (object?)facility.CrossDockLocation ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@fgroup", (object?)facility.FacilityGroup ?? DBNull.Value);
        
        cmd.Parameters.AddWithValue("@chkdigit", facility.UseLocationCheckdigit ?? "N");
        cmd.Parameters.AddWithValue("@rput", facility.RestrictPutaway ?? "N");
        
        cmd.Parameters.AddWithValue("@wsun", facility.WorkSundayIn ?? "N");
        cmd.Parameters.AddWithValue("@wmon", facility.WorkMondayIn ?? "Y");
        cmd.Parameters.AddWithValue("@wtue", facility.WorkTuesdayIn ?? "Y");
        cmd.Parameters.AddWithValue("@wwed", facility.WorkWednesdayIn ?? "Y");
        cmd.Parameters.AddWithValue("@wthu", facility.WorkThursdayIn ?? "Y");
        cmd.Parameters.AddWithValue("@wfri", facility.WorkFridayIn ?? "Y");
        cmd.Parameters.AddWithValue("@wsat", facility.WorkSaturdayIn ?? "N");

        cmd.Parameters.AddWithValue("@luser", (object?)facility.LastUser ?? "SYSTEM");
    }

    public async Task<bool> DeleteAsync(string id)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        string query = "DELETE FROM FACILITY WHERE FACILITY = @id";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", id);
        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0;
    }

    private Facility MapSqlFacility(IDataRecord reader)
    {
        return new Facility
        {
            Id = reader["Id"]?.ToString() ?? string.Empty,
            Name = reader["NAME"]?.ToString(),
            Address1 = reader["Address1"]?.ToString(),
            Address2 = reader["Address2"]?.ToString(),
            City = reader["CITY"]?.ToString(),
            State = reader["STATE"]?.ToString(),
            PostalCode = reader["PostalCode"]?.ToString(),
            CountryCode = reader["CountryCode"]?.ToString(),
            Phone = reader["PHONE"]?.ToString(),
            Fax = reader["FAX"]?.ToString(),
            Email = reader["EMAIL"]?.ToString(),
            Manager = reader["MANAGER"]?.ToString(),
            Status = reader["Status"]?.ToString() ?? "A",
            
            RemitName = reader["RemitName"]?.ToString(),
            RemitAddress1 = reader["RemitAddress1"]?.ToString(),
            RemitCity = reader["RemitCity"]?.ToString(),
            RemitState = reader["RemitState"]?.ToString(),
            RemitPostalCode = reader["RemitPostalCode"]?.ToString(),
            
            TaskLimit = reader["TaskLimit"] != DBNull.Value ? Convert.ToInt32(reader["TaskLimit"]) : null,
            CrossDockLocation = reader["CrossDockLocation"]?.ToString(),
            FacilityGroup = reader["FacilityGroup"]?.ToString(),
            
            UseLocationCheckdigit = reader["UseLocationCheckdigit"]?.ToString() ?? "N",
            RestrictPutaway = reader["RestrictPutaway"]?.ToString() ?? "N",
            
            WorkSundayIn = reader["WorkSundayIn"]?.ToString() ?? "N",
            WorkMondayIn = reader["WorkMondayIn"]?.ToString() ?? "Y",
            WorkTuesdayIn = reader["WorkTuesdayIn"]?.ToString() ?? "Y",
            WorkWednesdayIn = reader["WorkWednesdayIn"]?.ToString() ?? "Y",
            WorkThursdayIn = reader["WorkThursdayIn"]?.ToString() ?? "Y",
            WorkFridayIn = reader["WorkFridayIn"]?.ToString() ?? "Y",
            WorkSaturdayIn = reader["WorkSaturdayIn"]?.ToString() ?? "N",

            LastUpdate = reader["LastUpdate"] != DBNull.Value ? Convert.ToDateTime(reader["LastUpdate"]) : DateTime.Now,
            LastUser = reader["LastUser"]?.ToString()
        };
    }
}
