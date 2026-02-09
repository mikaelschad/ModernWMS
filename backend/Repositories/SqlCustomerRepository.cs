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
        
        var query = @"INSERT INTO CUSTOMER (CUSTID, NAME, ADDR1, ADDR2, CITY, STATE, POSTALCODE, COUNTRY, PHONE, EMAIL, CONTACT, STATUS, LASTUPDATE, LASTUSER) 
                     VALUES (@id, @name, @addr1, @addr2, @city, @state, @postal, @country, @phone, @email, @contact, @status, GETDATE(), @user)";
        
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
        cmd.Parameters.AddWithValue("@status", customer.Status);
        cmd.Parameters.AddWithValue("@user", "SYSTEM");
        
        await cmd.ExecuteNonQueryAsync();
        return customer.Id;
    }

    public async Task<bool> UpdateAsync(Customer customer)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = @"UPDATE CUSTOMER SET NAME=@name, ADDR1=@addr1, ADDR2=@addr2, CITY=@city, STATE=@state, 
                     POSTALCODE=@postal, COUNTRY=@country, PHONE=@phone, EMAIL=@email, CONTACT=@contact, 
                     STATUS=@status, LASTUPDATE=GETDATE(), LASTUSER=@user WHERE CUSTID=@id";
        
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
        cmd.Parameters.AddWithValue("@status", customer.Status);
        cmd.Parameters.AddWithValue("@user", "SYSTEM");
        
        int affected = await cmd.ExecuteNonQueryAsync();
        return affected > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = "UPDATE CUSTOMER SET STATUS = 'I', LASTUPDATE = GETDATE() WHERE CUSTID = @id";
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
            Status = reader["STATUS"]?.ToString() ?? "A",
            LastUpdate = reader["LASTUPDATE"] != DBNull.Value ? Convert.ToDateTime(reader["LASTUPDATE"]) : DateTime.Now,
            LastUser = reader["LASTUSER"]?.ToString() ?? "SYSTEM"
        };
    }
}
