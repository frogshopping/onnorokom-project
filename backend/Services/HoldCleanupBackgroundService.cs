using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data;

namespace SchoolAdmission.Api.Services;

public class HoldCleanupBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<HoldCleanupBackgroundService> _logger;

    public HoldCleanupBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<HoldCleanupBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("HoldCleanupBackgroundService started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var now = DateTime.UtcNow;
                var expiredCount = await dbContext.Holds
                    .Where(h => h.Status == "HELD" && h.ExpiresAt <= now)
                    .ExecuteUpdateAsync(setter => setter
                        .SetProperty(h => h.Status, "EXPIRED"),
                        stoppingToken);

                if (expiredCount > 0)
                {
                    _logger.LogInformation("Expired {Count} hold(s) automatically.", expiredCount);
                }
            }
            catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogError(ex, "Error occurred during background hold cleanup.");
            }

            try
            {
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }

        _logger.LogInformation("HoldCleanupBackgroundService stopped.");
    }
}
