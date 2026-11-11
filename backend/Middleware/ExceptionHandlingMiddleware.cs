using System.Net;
using System.Text.Json;
using SchoolAdmission.Api.DTOs;
using SchoolAdmission.Api.Exceptions;

namespace SchoolAdmission.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var statusCode = HttpStatusCode.InternalServerError;
        var message = "An unexpected error occurred.";

        switch (exception)
        {
            case AppException appEx:
                statusCode = appEx.StatusCode;
                message = appEx.Message;
                break;

            case BadHttpRequestException:
            case JsonException:
                statusCode = HttpStatusCode.BadRequest;
                message = "Invalid JSON or request format.";
                break;

            case ArgumentException argEx:
                statusCode = HttpStatusCode.BadRequest;
                message = argEx.Message;
                break;

            default:
                _logger.LogError(exception, "Unhandled exception encountered: {Message}", exception.Message);
                message = "An unexpected internal server error occurred.";
                break;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new ErrorResponse(message);
        var json = JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(json);
    }
}
