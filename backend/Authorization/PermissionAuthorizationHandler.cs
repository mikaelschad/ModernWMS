using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Controllers;
using ModernWMS.Backend.Attributes;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace ModernWMS.Backend.Authorization;

public class PermissionRequirement : IAuthorizationRequirement { }

public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public PermissionAuthorizationHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        // Admin bypass
        if (context.User.IsInRole("ADMIN"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext != null)
        {
            var endpoint = httpContext.GetEndpoint();
            
            var permissionAttribute = endpoint?.Metadata.GetMetadata<RequirePermissionAttribute>();

            if (permissionAttribute == null)
            {
                // No specific permission required by attribute, so satisfy requirement
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            var requiredPermission = $"{permissionAttribute.Entity}_{permissionAttribute.Operation}";
            
            if (context.User.HasClaim(c => c.Type == "permission" && c.Value == requiredPermission))
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }
        }
        
        return Task.CompletedTask;
    }
}
