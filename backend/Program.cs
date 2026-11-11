using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data;
using SchoolAdmission.Api.Middleware;
using SchoolAdmission.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.Never;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Database configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=postgres;Port=5432;Database=school_admission;Username=postgres;Password=postgrespassword";

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorCodesToAdd: null);
    });
});

// Application Services
builder.Services.AddScoped<IAdmissionService, AdmissionService>();
builder.Services.AddHostedService<HoldCleanupBackgroundService>();

var app = builder.Build();

// Auto-create database schema on startup with retries
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    var retries = 10;
    while (retries > 0)
    {
        try
        {
            logger.LogInformation("Attempting to connect to PostgreSQL database and ensure schema...");
            await db.Database.EnsureCreatedAsync();
            logger.LogInformation("Database connected and schema initialized successfully.");
            break;
        }
        catch (Exception ex)
        {
            retries--;
            logger.LogWarning(ex, "Database not ready yet. Retrying in 3 seconds... ({Retries} left)", retries);
            if (retries == 0)
            {
                logger.LogError(ex, "Failed to connect to the database after several attempts.");
                throw;
            }
            await Task.Delay(3000);
        }
    }
}

// Exception handling middleware (first in pipeline)
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Configure HTTP request pipeline
if (app.Environment.IsDevelopment() || true) // enable Swagger in container for easy inspection
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.MapControllers();

app.Run();

// Required for WebApplicationFactory in integration tests
public partial class Program { }
