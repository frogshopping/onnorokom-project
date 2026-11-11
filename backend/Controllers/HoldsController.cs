using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Api.DTOs;
using SchoolAdmission.Api.Services;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
[Route("holds")]
public class HoldsController : ControllerBase
{
    private readonly IAdmissionService _admissionService;

    public HoldsController(IAdmissionService admissionService)
    {
        _admissionService = admissionService;
    }

    [HttpGet("{holdId}")]
    public async Task<ActionResult<HoldDetailsResponse>> GetHold(string holdId)
    {
        var result = await _admissionService.GetHoldByIdAsync(holdId);
        if (result == null)
        {
            return NotFound(new ErrorResponse($"Hold with ID '{holdId}' was not found."));
        }

        return Ok(result);
    }

    [HttpPost("{holdId}/confirm")]
    public async Task<ActionResult<HoldConfirmResponse>> ConfirmHold(
        string holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentId)
    {
        if (string.IsNullOrWhiteSpace(studentId))
        {
            return BadRequest(new ErrorResponse("Missing required 'X-Student-Id' header."));
        }

        var result = await _admissionService.ConfirmHoldAsync(holdId, studentId);
        return Ok(result);
    }

    [HttpDelete("{holdId}")]
    public async Task<IActionResult> CancelHold(
        string holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentId)
    {
        if (string.IsNullOrWhiteSpace(studentId))
        {
            return BadRequest(new ErrorResponse("Missing required 'X-Student-Id' header."));
        }

        await _admissionService.CancelHoldAsync(holdId, studentId);
        return NoContent();
    }
}
