using System;
using Microsoft.Data.SqlClient;

namespace DbInspector
{
    class UserInspector
    {
        static void Main(string[] args)
        {
            var connectionString = "Server=(localdb)\\mssqllocaldb;Database=ModernWMS;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;";
            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();
                Console.WriteLine("--- USERS ---");
                using (var cmd = new SqlCommand("SELECT USERID, NAME, PASSWORDHASH FROM USERS", connection))
                {
                    using (var r = cmd.ExecuteReader())
                    {
                        while (r.Read())
                        {
                            Console.WriteLine($"User: {r["USERID"]} | Name: {r["NAME"]} | Hash: {r["PASSWORDHASH"]}");
                        }
                    }
                }
            }
        }
    }
}
