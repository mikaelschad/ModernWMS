using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace DbInspector
{
    class ErrorCapturer
    {
        static async Task Main(string[] args)
        {
            using var client = new HttpClient();
            var content = new StringContent("\"INSERT INTO ITEMGROUP (ITEMGROUP, CUSTID, DESCRIPTION, STATUS, LASTUPDATE, LASTUSER) VALUES ('REPRO_TEST', 'NON_EXISTENT_CUST', 'Repro Test', 'A', GETDATE(), 'SYSTEM')\"", Encoding.UTF8, "application/json");
            var response = await client.PostAsync("http://localhost:5017/api/Debug/query", content);
            var result = await response.Content.ReadAsStringAsync();
            Console.WriteLine(result);
        }
    }
}
