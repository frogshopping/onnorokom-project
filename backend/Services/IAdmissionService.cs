using SchoolAdmission.Api.DTOs;

namespace SchoolAdmission.Api.Services;

public interface IAdmissionService
{
    Task<ClassCreatedResponse> CreateClassAsync(CreateClassRequest request);
    Task<List<ClassResponse>> GetClassesAsync();
    Task<ClassResponse?> GetClassByIdAsync(string classId);
    Task<HoldCreatedResponse> CreateHoldAsync(string classId, string studentId);
    Task<HoldDetailsResponse?> GetHoldByIdAsync(string holdId);
    Task<HoldConfirmResponse> ConfirmHoldAsync(string holdId, string studentId);
    Task<bool> CancelHoldAsync(string holdId, string studentId);
    Task<List<StudentHoldItemResponse>> GetStudentHoldsAsync(string studentId);
}
