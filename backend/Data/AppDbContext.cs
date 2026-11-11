using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data.Entities;

namespace SchoolAdmission.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<ClassEntity> Classes => Set<ClassEntity>();
    public DbSet<HoldEntity> Holds => Set<HoldEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ClassEntity>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(200);
            entity.Property(c => c.TotalSeats).IsRequired();
            entity.Property(c => c.CreatedAt).HasDefaultValueSql("NOW()");
        });

        modelBuilder.Entity<HoldEntity>(entity =>
        {
            entity.HasKey(h => h.Id);
            entity.Property(h => h.StudentId).IsRequired().HasMaxLength(32);
            entity.Property(h => h.Status).IsRequired().HasMaxLength(32);
            entity.Property(h => h.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(h => h.Class)
                .WithMany(c => c.Holds)
                .HasForeignKey(h => h.ClassId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(h => new { h.ClassId, h.Status, h.ExpiresAt });
            entity.HasIndex(h => new { h.ClassId, h.StudentId });
            entity.HasIndex(h => h.StudentId);
        });
    }
}
