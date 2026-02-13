using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Threading.RateLimiting;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ModernWMS API", Version = "v1" });
    
    // Add JWT Authentication support in Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

builder.Services.AddScoped<ModernWMS.Backend.Repositories.ILegacyInventoryRepository, ModernWMS.Backend.Repositories.LegacySqlInventoryRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.ILicensePlateRepository, ModernWMS.Backend.Repositories.SqlLicensePlateRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.IFacilityRepository, ModernWMS.Backend.Repositories.SqlFacilityRepository>();
// builder.Services.AddScoped<ModernWMS.Backend.Repositories.ILicensePlateRepository, ModernWMS.Backend.Repositories.LegacyOracleLicensePlateRepository>();

// Master Data Repositories
builder.Services.AddScoped<ModernWMS.Backend.Repositories.ICustomerRepository, ModernWMS.Backend.Repositories.SqlCustomerRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.IItemRepository, ModernWMS.Backend.Repositories.SqlItemRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.IItemGroupRepository, ModernWMS.Backend.Repositories.SqlItemGroupRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.IZoneRepository, ModernWMS.Backend.Repositories.SqlZoneRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.ISectionRepository, ModernWMS.Backend.Repositories.SqlSectionRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.ILocationRepository, ModernWMS.Backend.Repositories.SqlLocationRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.IConsigneeRepository, ModernWMS.Backend.Repositories.SqlConsigneeRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.IUserRepository, ModernWMS.Backend.Repositories.SqlUserRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.IRoleRepository, ModernWMS.Backend.Repositories.SqlRoleRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.IAuditRepository, ModernWMS.Backend.Repositories.SqlAuditRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.ILocationTypeRepository, ModernWMS.Backend.Repositories.SqlLocationTypeRepository>();
builder.Services.AddSingleton<ModernWMS.Backend.Services.IAISuggestionCache, ModernWMS.Backend.Services.AISuggestionCache>();
builder.Services.AddScoped<ModernWMS.Backend.Services.IAIProvider, ModernWMS.Backend.Services.GoogleAIProvider>();
builder.Services.AddScoped<ModernWMS.Backend.Services.IAIOptimizationService, ModernWMS.Backend.Services.AIOptimizationService>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.IItemAliasRepository, ModernWMS.Backend.Repositories.SqlItemAliasRepository>();

// Password Security
builder.Services.AddHttpContextAccessor();
builder.Services.Configure<ModernWMS.Backend.Models.PasswordPolicy>(builder.Configuration.GetSection("Security:PasswordPolicy"));
builder.Services.AddScoped<ModernWMS.Backend.Services.IPasswordService, ModernWMS.Backend.Services.PasswordService>();

// Authorization
builder.Services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, ModernWMS.Backend.Authorization.PermissionAuthorizationHandler>();
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequirePermission", policy =>
    {
        policy.Requirements.Add(new ModernWMS.Backend.Authorization.PermissionRequirement());
    });
});

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.User.Identity?.Name ?? httpContext.Request.Headers.Host.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        await context.HttpContext.Response.WriteAsync("Too many requests. Please try again later.", token);
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Disabled for local development to avoid redirect issues
app.UseCors("AllowFrontend");

// Security Headers
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});

app.UseRateLimiter();
app.UseAuthentication();
app.UseMiddleware<ModernWMS.Backend.Middleware.UserAccessMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
