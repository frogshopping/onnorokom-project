using System.Data;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data;
using SchoolAdmission.Api.Data.Entities;
using SchoolAdmission.Api.DTOs;
using SchoolAdmission.Api.Exceptions;

namespace SchoolAdmission.Api.Services;

public class AdmissionService : IAdmissionService
{
    private readonly AppDbContext _dbContext;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AdmissionService> _logger;

    public AdmissionService(
        AppDbContext dbContext,
        IConfiguration configuration,
        ILogger<AdmissionService> logger)
    {
        _dbContext = dbContext;
        _configuration = configuration;
        _logger = logger;
    }

    private int GetHoldDurationSeconds()
    {
        if (int.TryParse(_configuration["HOLD_DURATION_SECONDS"], out var envVal) && envVal > 0)
        {
            return envVal;
        }

        if (int.TryParse(_configuration["HoldDurationSeconds"], out var configVal) && configVal > 0)
        {
            return configVal;
        }

        return 600; // default 10 minutes
    }

    private static void ValidateStudentId(string? studentId)
    {
        if (string.IsNullOrWhiteSpace(studentId) || !Regex.IsMatch(studentId.Trim(), @"^\d{17}$"))
        {
            throw new ValidationException("X-Student-Id header must be a 17-digit birth registration number.");
        }
    }

    public async Task<ClassCreatedResponse> CreateClassAsync(CreateClassRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ValidationException("Class name cannot be empty.");
        }

        if (request.TotalSeats <= 0)
        {
            throw new ValidationException("Total seats must be greater than zero.");
        }

        var classEntity = new ClassEntity
        {
            Id = "c_" + Guid.NewGuid().ToString("N")[..8],
            Name = request.Name.Trim(),
            TotalSeats = request.TotalSeats,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Classes.Add(classEntity);
        await _dbContext.SaveChangesAsync();

        return new ClassCreatedResponse
        {
            Id = classEntity.Id,
            Name = classEntity.Name,
            TotalSeats = classEntity.TotalSeats
        };
    }

    public async Task<List<ClassResponse>> GetClassesAsync()
    {
        var now = DateTime.UtcNow;

        var classes = await _dbContext.Classes
            .OrderBy(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.TotalSeats,
                ConfirmedSeats = c.Holds.Count(h => h.Status == "CONFIRMED"),
                HeldSeats = c.Holds.Count(h => h.Status == "HELD" && h.ExpiresAt > now)
            })
            .ToListAsync();

        return classes.Select(c => new ClassResponse
        {
            Id = c.Id,
            Name = c.Name,
            TotalSeats = c.TotalSeats,
            HeldSeats = c.HeldSeats,
            ConfirmedSeats = c.ConfirmedSeats,
            AvailableSeats = Math.Max(0, c.TotalSeats - (c.HeldSeats + c.ConfirmedSeats))
        }).ToList();
    }

    public async Task<ClassResponse?> GetClassByIdAsync(string classId)
    {
        var now = DateTime.UtcNow;

        var c = await _dbContext.Classes
            .Where(x => x.Id == classId)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.TotalSeats,
                ConfirmedSeats = c.Holds.Count(h => h.Status == "CONFIRMED"),
                HeldSeats = c.Holds.Count(h => h.Status == "HELD" && h.ExpiresAt > now)
            })
            .FirstOrDefaultAsync();

        if (c == null)
        {
            return null;
        }

        return new ClassResponse
        {
            Id = c.Id,
            Name = c.Name,
            TotalSeats = c.TotalSeats,
            HeldSeats = c.HeldSeats,
            ConfirmedSeats = c.ConfirmedSeats,
            AvailableSeats = Math.Max(0, c.TotalSeats - (c.HeldSeats + c.ConfirmedSeats))
        };
    }

    public async Task<HoldCreatedResponse> CreateHoldAsync(string classId, string studentId)
    {
        ValidateStudentId(studentId);
        studentId = studentId.Trim();

        var strategy = _dbContext.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _dbContext.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
            try
            {
                // Concurrency control: Lock the Class record with FOR UPDATE when running on PostgreSQL
                ClassEntity? classEntity;
                if (_dbContext.Database.IsNpgsql())
                {
                    classEntity = await _dbContext.Classes
                        .FromSqlInterpolated($"SELECT * FROM \"Classes\" WHERE \"Id\" = {classId} FOR UPDATE")
                        .FirstOrDefaultAsync();
                }
                else
                {
                    classEntity = await _dbContext.Classes.FirstOrDefaultAsync(c => c.Id == classId);
                }

                if (classEntity == null)
                {
                    throw new NotFoundException($"Class with ID '{classId}' was not found.");
                }

                var now = DateTime.UtcNow;

                // Rule 3: Single active application or confirmed admission per student per class
                var existingActiveCount = await _dbContext.Holds.CountAsync(h =>
                    h.ClassId == classId &&
                    h.StudentId == studentId &&
                    (h.Status == "CONFIRMED" || (h.Status == "HELD" && h.ExpiresAt > now)));

                if (existingActiveCount > 0)
                {
                    throw new ConflictException("Student already has an active hold or confirmed admission in this class.");
                }

                // Check seat availability (Rule 1)
                var confirmedSeats = await _dbContext.Holds.CountAsync(h =>
                    h.ClassId == classId &&
                    h.Status == "CONFIRMED");

                var heldSeats = await _dbContext.Holds.CountAsync(h =>
                    h.ClassId == classId &&
                    h.Status == "HELD" &&
                    h.ExpiresAt > now);

                if (confirmedSeats + heldSeats >= classEntity.TotalSeats)
                {
                    throw new ConflictException("No seats available for this class.");
                }

                // Create the hold
                var durationSeconds = GetHoldDurationSeconds();
                var hold = new HoldEntity
                {
                    Id = "h_" + Guid.NewGuid().ToString("N")[..8],
                    ClassId = classId,
                    StudentId = studentId,
                    Status = "HELD",
                    CreatedAt = now,
                    ExpiresAt = now.AddSeconds(durationSeconds)
                };

                _dbContext.Holds.Add(hold);
                await _dbContext.SaveChangesAsync();

                await transaction.CommitAsync();

                return new HoldCreatedResponse
                {
                    HoldId = hold.Id,
                    ClassId = hold.ClassId,
                    StudentId = hold.StudentId,
                    Status = "HELD",
                    ExpiresAt = hold.ExpiresAt
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }

    public async Task<HoldDetailsResponse?> GetHoldByIdAsync(string holdId)
    {
        var hold = await _dbContext.Holds
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == holdId);

        if (hold == null)
        {
            return null;
        }

        var status = hold.Status;
        if (status == "HELD" && hold.ExpiresAt <= DateTime.UtcNow)
        {
            status = "EXPIRED";
        }

        return new HoldDetailsResponse
        {
            HoldId = hold.Id,
            ClassId = hold.ClassId,
            Status = status,
            ExpiresAt = hold.ExpiresAt
        };
    }

    public async Task<HoldConfirmResponse> ConfirmHoldAsync(string holdId, string studentId)
    {
        ValidateStudentId(studentId);
        studentId = studentId.Trim();

        var strategy = _dbContext.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _dbContext.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
            try
            {
                HoldEntity? hold;
                if (_dbContext.Database.IsNpgsql())
                {
                    hold = await _dbContext.Holds
                        .FromSqlInterpolated($"SELECT * FROM \"Holds\" WHERE \"Id\" = {holdId} FOR UPDATE")
                        .FirstOrDefaultAsync();
                }
                else
                {
                    hold = await _dbContext.Holds.FirstOrDefaultAsync(h => h.Id == holdId);
                }

                if (hold == null)
                {
                    throw new NotFoundException($"Hold with ID '{holdId}' was not found.");
                }

                // Rule 4: Only student themselves can confirm
                if (hold.StudentId != studentId)
                {
                    throw new ForbiddenException("You are not authorized to confirm this hold.");
                }

                // Rule 5: Idempotent confirmation
                if (hold.Status == "CONFIRMED")
                {
                    return new HoldConfirmResponse
                    {
                        HoldId = hold.Id,
                        Status = "CONFIRMED"
                    };
                }

                if (hold.Status == "CANCELLED")
                {
                    throw new ConflictException("Hold has been cancelled and cannot be confirmed.");
                }

                var now = DateTime.UtcNow;
                if (hold.Status == "EXPIRED" || (hold.Status == "HELD" && hold.ExpiresAt <= now))
                {
                    hold.Status = "EXPIRED";
                    await _dbContext.SaveChangesAsync();
                    await transaction.CommitAsync();
                    throw new ConflictException("Hold has expired and cannot be confirmed.");
                }

                // Confirm the hold
                hold.Status = "CONFIRMED";
                hold.ConfirmedAt = now;
                await _dbContext.SaveChangesAsync();

                await transaction.CommitAsync();

                return new HoldConfirmResponse
                {
                    HoldId = hold.Id,
                    Status = "CONFIRMED"
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }

    public async Task<bool> CancelHoldAsync(string holdId, string studentId)
    {
        ValidateStudentId(studentId);
        studentId = studentId.Trim();

        var hold = await _dbContext.Holds.FirstOrDefaultAsync(h => h.Id == holdId);
        if (hold == null)
        {
            throw new NotFoundException($"Hold with ID '{holdId}' was not found.");
        }

        if (hold.StudentId != studentId)
        {
            throw new ForbiddenException("You are not authorized to cancel this hold.");
        }

        if (hold.Status == "CONFIRMED")
        {
            throw new ConflictException("Confirmed admissions cannot be cancelled.");
        }

        if (hold.Status != "CANCELLED")
        {
            hold.Status = "CANCELLED";
            await _dbContext.SaveChangesAsync();
        }

        return true;
    }

    public async Task<List<StudentHoldItemResponse>> GetStudentHoldsAsync(string studentId)
    {
        ValidateStudentId(studentId);
        studentId = studentId.Trim();

        var now = DateTime.UtcNow;

        var holds = await _dbContext.Holds
            .Include(h => h.Class)
            .Where(h => h.StudentId == studentId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return holds.Select(h =>
        {
            var status = h.Status;
            if (status == "HELD" && h.ExpiresAt <= now)
            {
                status = "EXPIRED";
            }

            return new StudentHoldItemResponse
            {
                HoldId = h.Id,
                ClassId = h.ClassId,
                ClassName = h.Class?.Name ?? string.Empty,
                Status = status,
                ExpiresAt = h.ExpiresAt
            };
        }).ToList();
    }
}
