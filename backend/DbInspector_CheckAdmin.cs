using System;
using Microsoft.Data.SqlClient;

namespace DbInspector
{
    class Program
    {
        static void Main(string[] args)
        {
            var connectionString = "Server=(localdb)\\mssqllocaldb;Database=ModernWMS;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;";
            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();
                Console.WriteLine("--- Checking admin user ---");
                using (var cmd = new SqlCommand("SELECT USERID, PASSWORDHASH FROM USERS WHERE USERID = 'admin'", connection))
                {
                    using (var r = cmd.ExecuteReader())
                    {
                        if (r.Read())
                        {
                            Console.WriteLine($"User: {r["USERID"]} | HasHash: {r["PASSWORDHASH"] != DBNull.Value}");
                        }
                        else
                        {
                            Console.WriteLine("Admin user not found!");
                        }
                    }
                }
            }
        }
    }
}
