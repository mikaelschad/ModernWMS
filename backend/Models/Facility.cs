namespace ModernWMS.Backend.Models;

public class Facility
{
    public Facility() { }

    public string Id { get; set; } = string.Empty; // FACILITY (PK)
    public string? Name { get; set; }
    public string? Address1 { get; set; } // ADDR1
    public string? Address2 { get; set; } // ADDR2
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? CountryCode { get; set; }
    public string? Phone { get; set; }
    public string? Fax { get; set; }
    public string? Email { get; set; }
    public string? Manager { get; set; }
    public string Status { get; set; } = "A"; // FACILITYSTATUS
    
    // Setup Fields from SYNAPSE Documentation/Schema
    public string? RemitName { get; set; }
    public string? RemitAddress1 { get; set; }
    public string? RemitCity { get; set; }
    public string? RemitState { get; set; }
    public string? RemitPostalCode { get; set; }
    
    public int? TaskLimit { get; set; }
    public string? CrossDockLocation { get; set; } // XDOCKLOC
    public string? FacilityGroup { get; set; }
    
    // Operating Flags
    public string UseLocationCheckdigit { get; set; } = "N"; // CHAR(1)
    public string RestrictPutaway { get; set; } = "N"; 
    
    // Work Schedule (Inbound)
    public string WorkSundayIn { get; set; } = "N";
    public string WorkMondayIn { get; set; } = "Y";
    public string WorkTuesdayIn { get; set; } = "Y";
    public string WorkWednesdayIn { get; set; } = "Y";
    public string WorkThursdayIn { get; set; } = "Y";
    public string WorkFridayIn { get; set; } = "Y";
    public string WorkSaturdayIn { get; set; } = "N";

    public DateTime LastUpdate { get; set; } = DateTime.Now;
    public string? LastUser { get; set; }
}
