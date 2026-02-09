var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<ModernWMS.Backend.Repositories.ILegacyInventoryRepository, ModernWMS.Backend.Repositories.LegacySqlInventoryRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.ILicensePlateRepository, ModernWMS.Backend.Repositories.SqlLicensePlateRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.IFacilityRepository, ModernWMS.Backend.Repositories.SqlFacilityRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.ILicensePlateRepository, ModernWMS.Backend.Repositories.LegacyOracleLicensePlateRepository>();

// Master Data Repositories
builder.Services.AddScoped<ModernWMS.Backend.Repositories.ICustomerRepository, ModernWMS.Backend.Repositories.SqlCustomerRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.IItemRepository, ModernWMS.Backend.Repositories.SqlItemRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.IItemGroupRepository, ModernWMS.Backend.Repositories.SqlItemGroupRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.IZoneRepository, ModernWMS.Backend.Repositories.SqlZoneRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.ISectionRepository, ModernWMS.Backend.Repositories.SqlSectionRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.ILocationRepository, ModernWMS.Backend.Repositories.SqlLocationRepository>();
builder.Services.AddScoped<ModernWMS.Backend.Repositories.IConsigneeRepository, ModernWMS.Backend.Repositories.SqlConsigneeRepository>();
builder.Services.AddSingleton<ModernWMS.Backend.Services.IAISuggestionCache, ModernWMS.Backend.Services.AISuggestionCache>();
builder.Services.AddScoped<ModernWMS.Backend.Services.IAIProvider, ModernWMS.Backend.Services.GoogleAIProvider>();
builder.Services.AddScoped<ModernWMS.Backend.Services.IAIOptimizationService, ModernWMS.Backend.Services.AIOptimizationService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5174")
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
app.UseAuthorization();
app.MapControllers();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
