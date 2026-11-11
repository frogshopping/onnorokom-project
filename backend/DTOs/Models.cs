using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SchoolAdmission.Api.DTOs;

public class CreateClassRequest
{
    [Required(ErrorMessage = "Class name is required.")]
    [StringLength(200, MinimumLength = 1, ErrorMessage = "Class name must be between 1 and 200 characters.")]
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Total seats is required.")]
    [Range(1, 100000, ErrorMessage = "Total seats must be at least 1.")]
    [JsonPropertyName("totalSeats")]
    public int TotalSeats { get; set; }
}

public class ClassCreatedResponse
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("totalSeats")]
    public int TotalSeats { get; set; }
}

public class ClassResponse
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("totalSeats")]
    public int TotalSeats { get; set; }

    [JsonPropertyName("heldSeats")]
    public int HeldSeats { get; set; }

    [JsonPropertyName("confirmedSeats")]
    public int ConfirmedSeats { get; set; }

    [JsonPropertyName("availableSeats")]
    public int AvailableSeats { get; set; }
}

public class HoldCreatedResponse
{
    [JsonPropertyName("holdId")]
    public string HoldId { get; set; } = string.Empty;

    [JsonPropertyName("classId")]
    public string ClassId { get; set; } = string.Empty;

    [JsonPropertyName("studentId")]
    public string StudentId { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = "HELD";

    [JsonPropertyName("expiresAt")]
    public DateTime ExpiresAt { get; set; }
}

public class HoldDetailsResponse
{
    [JsonPropertyName("holdId")]
    public string HoldId { get; set; } = string.Empty;

    [JsonPropertyName("classId")]
    public string ClassId { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("expiresAt")]
    public DateTime ExpiresAt { get; set; }
}

public class HoldConfirmResponse
{
    [JsonPropertyName("holdId")]
    public string HoldId { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = "CONFIRMED";
}

public class StudentHoldItemResponse
{
    [JsonPropertyName("holdId")]
    public string HoldId { get; set; } = string.Empty;

    [JsonPropertyName("classId")]
    public string ClassId { get; set; } = string.Empty;

    [JsonPropertyName("className")]
    public string ClassName { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("expiresAt")]
    public DateTime ExpiresAt { get; set; }
}

public class ErrorResponse
{
    [JsonPropertyName("error")]
    public string Error { get; set; } = string.Empty;

    public ErrorResponse() { }

    public ErrorResponse(string error)
    {
        Error = error;
    }
}
