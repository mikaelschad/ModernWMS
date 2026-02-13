using Microsoft.Data.SqlClient;
using ModernWMS.Backend.Models;
using System.Data;

namespace ModernWMS.Backend.Repositories;

public class SqlCustomerRepository : ICustomerRepository
{
    private readonly string _connectionString;

    public SqlCustomerRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("LegacySqlDB") 
            ?? throw new InvalidOperationException("Connection string not found");
    }

    public async Task<IEnumerable<Customer>> GetAllAsync()
    {
        var customers = new List<Customer>();
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = "SELECT * FROM CUSTOMER WHERE STATUS != 'I' ORDER BY NAME";
        using var cmd = new SqlCommand(query, conn);
        using var reader = await cmd.ExecuteReaderAsync();
        
        while (await reader.ReadAsync())
        {
            customers.Add(MapCustomer(reader));
        }
        
        return customers;
    }

    public async Task<Customer?> GetByIdAsync(string id)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = "SELECT * FROM CUSTOMER WHERE CUSTID = @id";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", id);
        using var reader = await cmd.ExecuteReaderAsync();
        
        if (await reader.ReadAsync())
        {
            return MapCustomer(reader);
        }
        
        return null;
    }

    public async Task<string> CreateAsync(Customer customer)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = @"INSERT INTO CUSTOMER (
                        CUSTID, NAME, ADDR1, ADDR2, CITY, STATE, POSTALCODE, COUNTRY, PHONE, EMAIL, CONTACT, 
                        ALLOWPARTIALSHIPMENT, ALLOWOVERAGE, OVERAGETOLERANCE,
                        DEFAULTTRACKLOT, DEFAULTTRACKSERIAL, DEFAULTTRACKEXPDATE, DEFAULTTRACKMFGDATE,
                        ALLOWMIXSKU, ALLOWMIXLOT,
                        RECEIVERULE_REQUIREEXPDATE, RECEIVERULE_REQUIREMFGDATE, 
                        RECEIVERULE_LOTVALIDATIONREGEX, RECEIVERULE_SERIALVALIDATIONREGEX, RECEIVERULE_MINSHELFLIFEDAYS,
                        STATUS, LASTUPDATE, LASTUSER) 
                     VALUES (
                        @id, @name, @addr1, @addr2, @city, @state, @postal, @country, @phone, @email, @contact, 
                        @partial, @overage, @tol,
                        @lot, @serial, @exp, @mfg,
                        @mixSku, @mixLot,
                        @rrExp, @rrMfg, @rrLotRx, @rrSerRx, @rrShelf,
                        @status, GETDATE(), @user)";
        
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", customer.Id);
        cmd.Parameters.AddWithValue("@name", customer.Name);
        cmd.Parameters.AddWithValue("@addr1", (object?)customer.Address1 ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@addr2", (object?)customer.Address2 ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@city", (object?)customer.City ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@state", (object?)customer.State ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@postal", (object?)customer.PostalCode ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@country", (object?)customer.Country ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@phone", (object?)customer.Phone ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@email", (object?)customer.Email ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@contact", (object?)customer.Contact ?? DBNull.Value);
        
        cmd.Parameters.AddWithValue("@partial", customer.AllowPartialShipment);
        cmd.Parameters.AddWithValue("@overage", customer.AllowOverage);
        cmd.Parameters.AddWithValue("@tol", customer.OverageTolerance);
        
        cmd.Parameters.AddWithValue("@lot", customer.DefaultTrackLot);
        cmd.Parameters.AddWithValue("@serial", customer.DefaultTrackSerial);
        cmd.Parameters.AddWithValue("@exp", customer.DefaultTrackExpDate);
        cmd.Parameters.AddWithValue("@mfg", customer.DefaultTrackMfgDate);
        
        cmd.Parameters.AddWithValue("@mixSku", customer.AllowMixSKU);
        cmd.Parameters.AddWithValue("@mixLot", customer.AllowMixLot);

        cmd.Parameters.AddWithValue("@rrExp", customer.ReceiveRule_RequireExpDate);
        cmd.Parameters.AddWithValue("@rrMfg", customer.ReceiveRule_RequireMfgDate);
        cmd.Parameters.AddWithValue("@rrLotRx", (object?)customer.ReceiveRule_LotValidationRegex ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@rrSerRx", (object?)customer.ReceiveRule_SerialValidationRegex ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@rrShelf", customer.ReceiveRule_MinShelfLifeDays);

        cmd.Parameters.AddWithValue("@status", customer.Status);
        cmd.Parameters.AddWithValue("@user", "SYSTEM");
        
        await cmd.ExecuteNonQueryAsync();
        return customer.Id;
    }

    public async Task<bool> UpdateAsync(Customer customer)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = @"UPDATE CUSTOMER SET 
                        NAME=@name, ADDR1=@addr1, ADDR2=@addr2, CITY=@city, STATE=@state, 
                        POSTALCODE=@postal, COUNTRY=@country, PHONE=@phone, EMAIL=@email, CONTACT=@contact, 
                        ALLOWPARTIALSHIPMENT=@partial, ALLOWOVERAGE=@overage, OVERAGETOLERANCE=@tol,
                        DEFAULTTRACKLOT=@lot, DEFAULTTRACKSERIAL=@serial, DEFAULTTRACKEXPDATE=@exp, DEFAULTTRACKMFGDATE=@mfg,
                        ALLOWMIXSKU=@mixSku, ALLOWMIXLOT=@mixLot,
                        RECEIVERULE_REQUIREEXPDATE=@rrExp, RECEIVERULE_REQUIREMFGDATE=@rrMfg,
                        RECEIVERULE_LOTVALIDATIONREGEX=@rrLotRx, RECEIVERULE_SERIALVALIDATIONREGEX=@rrSerRx,
                        RECEIVERULE_MINSHELFLIFEDAYS=@rrShelf,
                        STATUS=@status, LASTUPDATE=GETDATE(), LASTUSER=@user 
                      WHERE CUSTID=@id";
        
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", customer.Id);
        cmd.Parameters.AddWithValue("@name", customer.Name);
        cmd.Parameters.AddWithValue("@addr1", (object?)customer.Address1 ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@addr2", (object?)customer.Address2 ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@city", (object?)customer.City ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@state", (object?)customer.State ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@postal", (object?)customer.PostalCode ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@country", (object?)customer.Country ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@phone", (object?)customer.Phone ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@email", (object?)customer.Email ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@contact", (object?)customer.Contact ?? DBNull.Value);
        
        cmd.Parameters.AddWithValue("@partial", customer.AllowPartialShipment);
        cmd.Parameters.AddWithValue("@overage", customer.AllowOverage);
        cmd.Parameters.AddWithValue("@tol", customer.OverageTolerance);
        
        cmd.Parameters.AddWithValue("@lot", customer.DefaultTrackLot);
        cmd.Parameters.AddWithValue("@serial", customer.DefaultTrackSerial);
        cmd.Parameters.AddWithValue("@exp", customer.DefaultTrackExpDate);
        cmd.Parameters.AddWithValue("@mfg", customer.DefaultTrackMfgDate);
        
        cmd.Parameters.AddWithValue("@mixSku", customer.AllowMixSKU);
        cmd.Parameters.AddWithValue("@mixLot", customer.AllowMixLot);

        cmd.Parameters.AddWithValue("@rrExp", customer.ReceiveRule_RequireExpDate);
        cmd.Parameters.AddWithValue("@rrMfg", customer.ReceiveRule_RequireMfgDate);
        cmd.Parameters.AddWithValue("@rrLotRx", (object?)customer.ReceiveRule_LotValidationRegex ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@rrSerRx", (object?)customer.ReceiveRule_SerialValidationRegex ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@rrShelf", customer.ReceiveRule_MinShelfLifeDays);

        cmd.Parameters.AddWithValue("@status", customer.Status);
        cmd.Parameters.AddWithValue("@user", "SYSTEM");
        
        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = "DELETE FROM CUSTOMER WHERE CUSTID = @id";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", id);
        
        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0;
    }

    private Customer MapCustomer(IDataRecord reader)
    {
        return new Customer
        {
            Id = reader["CUSTID"]?.ToString() ?? string.Empty,
            Name = reader["NAME"]?.ToString() ?? string.Empty,
            Address1 = reader["ADDR1"]?.ToString(),
            Address2 = reader["ADDR2"]?.ToString(),
            City = reader["CITY"]?.ToString(),
            State = reader["STATE"]?.ToString(),
            PostalCode = reader["POSTALCODE"]?.ToString(),
            Country = reader["COUNTRY"]?.ToString(),
            Phone = reader["PHONE"]?.ToString(),
            Email = reader["EMAIL"]?.ToString(),
            Contact = reader["CONTACT"]?.ToString(),
            
            AllowPartialShipment = reader["ALLOWPARTIALSHIPMENT"] != DBNull.Value && Convert.ToBoolean(reader["ALLOWPARTIALSHIPMENT"]),
            AllowOverage = reader["ALLOWOVERAGE"] != DBNull.Value && Convert.ToBoolean(reader["ALLOWOVERAGE"]),
            OverageTolerance = reader["OVERAGETOLERANCE"] != DBNull.Value ? Convert.ToDecimal(reader["OVERAGETOLERANCE"]) : 0,
            
            DefaultTrackLot = reader["DEFAULTTRACKLOT"] != DBNull.Value && Convert.ToBoolean(reader["DEFAULTTRACKLOT"]),
            DefaultTrackSerial = reader["DEFAULTTRACKSERIAL"] != DBNull.Value && Convert.ToBoolean(reader["DEFAULTTRACKSERIAL"]),
            DefaultTrackExpDate = reader["DEFAULTTRACKEXPDATE"] != DBNull.Value && Convert.ToBoolean(reader["DEFAULTTRACKEXPDATE"]),
            DefaultTrackMfgDate = reader["DEFAULTTRACKMFGDATE"] != DBNull.Value && Convert.ToBoolean(reader["DEFAULTTRACKMFGDATE"]),
            
            AllowMixSKU = reader["ALLOWMIXSKU"] != DBNull.Value && Convert.ToBoolean(reader["ALLOWMIXSKU"]),
            AllowMixLot = reader["ALLOWMIXLOT"] != DBNull.Value && Convert.ToBoolean(reader["ALLOWMIXLOT"]),

            ReceiveRule_RequireExpDate = reader["RECEIVERULE_REQUIREEXPDATE"] != DBNull.Value && Convert.ToBoolean(reader["RECEIVERULE_REQUIREEXPDATE"]),
            ReceiveRule_RequireMfgDate = reader["RECEIVERULE_REQUIREMFGDATE"] != DBNull.Value && Convert.ToBoolean(reader["RECEIVERULE_REQUIREMFGDATE"]),
            ReceiveRule_LotValidationRegex = reader["RECEIVERULE_LOTVALIDATIONREGEX"]?.ToString(),
            ReceiveRule_SerialValidationRegex = reader["RECEIVERULE_SERIALVALIDATIONREGEX"]?.ToString(),
            ReceiveRule_MinShelfLifeDays = reader["RECEIVERULE_MINSHELFLIFEDAYS"] != DBNull.Value ? Convert.ToInt32(reader["RECEIVERULE_MINSHELFLIFEDAYS"]) : 0,

            Status = reader["STATUS"]?.ToString() ?? "A",
            LastUpdate = reader["LASTUPDATE"] != DBNull.Value ? Convert.ToDateTime(reader["LASTUPDATE"]) : DateTime.Now,
            LastUser = reader["LASTUSER"]?.ToString() ?? "SYSTEM"
        };
    }
}
