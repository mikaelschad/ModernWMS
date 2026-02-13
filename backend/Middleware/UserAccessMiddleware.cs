using Microsoft.Data.SqlClient;
using System.Security.Claims;

namespace ModernWMS.Backend.Middleware
{
    public class UserAccessMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public UserAccessMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Only process authenticated requests
            if (context.User?.Identity?.IsAuthenticated == true)
            {
                var userId = context.User.FindFirst(ClaimTypes.Name)?.Value;
                
                if (!string.IsNullOrEmpty(userId))
                {
                    try
                    {
                        var accessibleFacilities = await GetUserFacilitiesAsync(userId);
                        var accessibleCustomers = await GetUserCustomersAsync(userId);
                        var permissions = await GetUserPermissionsAsync(userId);
                        
                        context.Items["AccessibleFacilities"] = accessibleFacilities;
                        context.Items["AccessibleCustomers"] = accessibleCustomers;
                        context.Items["Permissions"] = permissions;
                        context.Items["UserId"] = userId;
                    }
                    catch (Exception ex)
                    {
                        // Log error but don't block the request
                        Console.WriteLine($"Error loading user access: {ex.Message}");
                    }
                }
            }

            await _next(context);
        }

        private async Task<List<string>> GetUserFacilitiesAsync(string userId)
        {
            var facilities = new List<string>();
            var connectionString = _configuration.GetConnectionString("LegacySqlDB");

            using var conn = new SqlConnection(connectionString);
            await conn.OpenAsync();

            var query = "SELECT FACILITYID FROM USER_FACILITIES WHERE USERID = @uid";
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@uid", userId);

            using var rdr = await cmd.ExecuteReaderAsync();
            while (await rdr.ReadAsync())
            {
                facilities.Add(rdr.GetString(0));
            }

            return facilities;
        }

        private async Task<List<string>> GetUserCustomersAsync(string userId)
        {
            var customers = new List<string>();
            var connectionString = _configuration.GetConnectionString("LegacySqlDB");

            using var conn = new SqlConnection(connectionString);
            await conn.OpenAsync();

            var query = "SELECT CUSTOMERID FROM USER_CUSTOMERS WHERE USERID = @uid";
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@uid", userId);

            using var rdr = await cmd.ExecuteReaderAsync();
            while (await rdr.ReadAsync())
            {
                customers.Add(rdr.GetString(0));
            }

            return customers;
        }

        private async Task<List<string>> GetUserPermissionsAsync(string userId)
        {
            var permissions = new List<string>();
            var connectionString = _configuration.GetConnectionString("LegacySqlDB");

            using var conn = new SqlConnection(connectionString);
            await conn.OpenAsync();

            var query = @"SELECT DISTINCT rp.PERMISSIONID 
                          FROM ROLE_PERMISSIONS rp
                          JOIN USER_ROLES ur ON rp.ROLEID = ur.ROLEID
                          WHERE ur.USERID = @uid";
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@uid", userId);

            using var rdr = await cmd.ExecuteReaderAsync();
            while (await rdr.ReadAsync())
            {
                permissions.Add(rdr.GetString(0));
            }

            return permissions;
        }
    }
}
