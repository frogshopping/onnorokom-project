using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchoolAdmission.Api.Data.Entities;

[Table("Holds")]
public class HoldEntity
{
    [Key]
    [MaxLength(64)]
    public string Id { get; set; } = string.Empty;

    [Required]
    [MaxLength(64)]
    public string ClassId { get; set; } = string.Empty;

    [ForeignKey(nameof(ClassId))]
    public virtual ClassEntity? Class { get; set; }

    [Required]
    [MaxLength(32)]
    public string StudentId { get; set; } = string.Empty;

    [Required]
    [MaxLength(32)]
    public string Status { get; set; } = "HELD"; // HELD, CONFIRMED, EXPIRED, CANCELLED

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime ExpiresAt { get; set; }

    public DateTime? ConfirmedAt { get; set; }
}
