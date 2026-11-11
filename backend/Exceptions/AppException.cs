using System.Net;

namespace SchoolAdmission.Api.Exceptions;

public class AppException : Exception
{
    public HttpStatusCode StatusCode { get; }

    public AppException(string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest) 
        : base(message)
    {
        StatusCode = statusCode;
    }
}

public class NotFoundException : AppException
{
    public NotFoundException(string message) 
        : base(message, HttpStatusCode.NotFound)
    {
    }
}

public class ConflictException : AppException
{
    public ConflictException(string message) 
        : base(message, HttpStatusCode.Conflict)
    {
    }
}

public class ForbiddenException : AppException
{
    public ForbiddenException(string message) 
        : base(message, HttpStatusCode.Forbidden)
    {
    }
}

public class ValidationException : AppException
{
    public ValidationException(string message) 
        : base(message, HttpStatusCode.BadRequest)
    {
    }
}
