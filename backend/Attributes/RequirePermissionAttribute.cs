using Microsoft.AspNetCore.Authorization;

namespace ModernWMS.Backend.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class RequirePermissionAttribute : AuthorizeAttribute
{
    public string Entity { get; }
    public string Operation { get; }

    public RequirePermissionAttribute(string entity, string operation)
    {
        Entity = entity;
        Operation = operation;
        Policy = "RequirePermission"; // We'll use a dynamic policy provider or a single policy that checks this requirement
    }
}
