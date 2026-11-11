using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Api.DTOs;
using SchoolAdmission.Api.Exceptions;
using SchoolAdmission.Api.Services;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
[Route("classes")]
public class ClassesController : ControllerBase
{
    private readonly IAdmissionService _admissionService;

    public ClassesController(IAdmissionService admissionService)
    {
        _admissionService = admissionService;
    }

    [HttpPost]
    public async Task<ActionResult<ClassCreatedResponse>> CreateClass([FromBody] CreateClassRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = string.Join("; ", ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage));
            return BadRequest(new ErrorResponse(errors));
        }

        var result = await _admissionService.CreateClassAsync(request);
        return Created($"/classes/{result.Id}", result);
    }

    [HttpGet]
    public async Task<ActionResult<List<ClassResponse>>> GetClasses()
    {
        var result = await _admissionService.GetClassesAsync();
        return Ok(result);
    }

    [HttpGet("{classId}")]
    public async Task<ActionResult<ClassResponse>> GetClassById(string classId)
    {
        var result = await _admissionService.GetClassByIdAsync(classId);
        if (result == null)
        {
            return NotFound(new ErrorResponse($"Class with ID '{classId}' was not found."));
        }

        return Ok(result);
    }

    [HttpPost("{classId}/holds")]
    public async Task<ActionResult<HoldCreatedResponse>> CreateHold(
        string classId,
        [FromHeader(Name = "X-Student-Id")] string? studentId)
    {
        if (string.IsNullOrWhiteSpace(studentId))
        {
            return BadRequest(new ErrorResponse("Missing required 'X-Student-Id' header."));
        }

        var result = await _admissionService.CreateHoldAsync(classId, studentId);
        return Created($"/holds/{result.HoldId}", result);
    }
}
