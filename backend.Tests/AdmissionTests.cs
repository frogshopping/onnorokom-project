using System.Net;
using System.Net.Http.Json;
using SchoolAdmission.Api.DTOs;
using Xunit;

namespace SchoolAdmission.Tests;

public class AdmissionTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AdmissionTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task ConcurrencyTest_MultipleRequests_NeverExceedsTotalSeats()
    {
        // Arrange: Create a new class with only 5 seats
        var client = _factory.CreateClient();
        var createClassResponse = await client.PostAsJsonAsync("/classes", new CreateClassRequest
        {
            Name = "Class 6 - Concurrency Test",
            TotalSeats = 5
        });

        Assert.Equal(HttpStatusCode.Created, createClassResponse.StatusCode);
        var createdClass = await createClassResponse.Content.ReadFromJsonAsync<ClassCreatedResponse>();
        Assert.NotNull(createdClass);
        var classId = createdClass.Id;

        // Act: 30 distinct students attempt to hold a seat concurrently
        const int concurrentRequests = 30;
        var tasks = new List<Task<HttpResponseMessage>>();

        for (int i = 1; i <= concurrentRequests; i++)
        {
            // Generate a valid 17-digit student ID
            var studentId = $"2015269{i:D10}";
            
            var request = new HttpRequestMessage(HttpMethod.Post, $"/classes/{classId}/holds");
            request.Headers.Add("X-Student-Id", studentId);

            // Dispatch concurrently
            tasks.Add(Task.Run(() => client.SendAsync(request)));
        }

        var responses = await Task.WhenAll(tasks);

        // Assert: Exactly 5 succeed (201 Created), remaining 25 fail (409 Conflict)
        var successCount = responses.Count(r => r.StatusCode == HttpStatusCode.Created);
        var conflictCount = responses.Count(r => r.StatusCode == HttpStatusCode.Conflict);

        Assert.Equal(5, successCount);
        Assert.Equal(25, conflictCount);

        // Verify class seat count via GET /classes/{id}
        var classCheckResponse = await client.GetAsync($"/classes/{classId}");
        Assert.Equal(HttpStatusCode.OK, classCheckResponse.StatusCode);
        var classDetails = await classCheckResponse.Content.ReadFromJsonAsync<ClassResponse>();
        Assert.NotNull(classDetails);

        Assert.Equal(5, classDetails.TotalSeats);
        Assert.Equal(5, classDetails.HeldSeats);
        Assert.Equal(0, classDetails.ConfirmedSeats);
        Assert.Equal(0, classDetails.AvailableSeats);
    }

    [Fact]
    public async Task Rule3_SameStudent_CannotHoldTwiceInSameClass()
    {
        // Arrange
        var client = _factory.CreateClient();
        var createResponse = await client.PostAsJsonAsync("/classes", new CreateClassRequest
        {
            Name = "Class 7 - Rule 3 Test",
            TotalSeats = 10
        });
        var createdClass = await createResponse.Content.ReadFromJsonAsync<ClassCreatedResponse>();
        Assert.NotNull(createdClass);

        var studentId = "20152690000000099";

        // First hold
        var req1 = new HttpRequestMessage(HttpMethod.Post, $"/classes/{createdClass.Id}/holds");
        req1.Headers.Add("X-Student-Id", studentId);
        var res1 = await client.SendAsync(req1);
        Assert.Equal(HttpStatusCode.Created, res1.StatusCode);

        // Second hold attempt by the SAME student in the SAME class
        var req2 = new HttpRequestMessage(HttpMethod.Post, $"/classes/{createdClass.Id}/holds");
        req2.Headers.Add("X-Student-Id", studentId);
        var res2 = await client.SendAsync(req2);

        // Assert: rejected with 409 Conflict
        Assert.Equal(HttpStatusCode.Conflict, res2.StatusCode);

        // Third hold attempt by the SAME student in a DIFFERENT class
        var createClass2 = await client.PostAsJsonAsync("/classes", new CreateClassRequest
        {
            Name = "Class 8 - Different Class",
            TotalSeats = 10
        });
        var createdClass2 = await createClass2.Content.ReadFromJsonAsync<ClassCreatedResponse>();
        Assert.NotNull(createdClass2);

        var req3 = new HttpRequestMessage(HttpMethod.Post, $"/classes/{createdClass2.Id}/holds");
        req3.Headers.Add("X-Student-Id", studentId);
        var res3 = await client.SendAsync(req3);

        // Assert: also rejected with 409 Conflict
        Assert.Equal(HttpStatusCode.Conflict, res3.StatusCode);
    }

    [Fact]
    public async Task Rule4And5_ConfirmHold_OwnershipAndIdempotency()
    {
        // Arrange
        var client = _factory.CreateClient();
        var createClassResponse = await client.PostAsJsonAsync("/classes", new CreateClassRequest
        {
            Name = "Class 8 - Confirm Test",
            TotalSeats = 10
        });
        var createdClass = await createClassResponse.Content.ReadFromJsonAsync<ClassCreatedResponse>();
        Assert.NotNull(createdClass);

        var studentA = "20152690000000101";
        var studentB = "20152690000000102";

        // Student A holds seat
        var holdReq = new HttpRequestMessage(HttpMethod.Post, $"/classes/{createdClass.Id}/holds");
        holdReq.Headers.Add("X-Student-Id", studentA);
        var holdRes = await client.SendAsync(holdReq);
        Assert.Equal(HttpStatusCode.Created, holdRes.StatusCode);
        var hold = await holdRes.Content.ReadFromJsonAsync<HoldCreatedResponse>();
        Assert.NotNull(hold);

        // Student B attempts to confirm Student A's hold -> 403 Forbidden
        var forbiddenReq = new HttpRequestMessage(HttpMethod.Post, $"/holds/{hold.HoldId}/confirm");
        forbiddenReq.Headers.Add("X-Student-Id", studentB);
        var forbiddenRes = await client.SendAsync(forbiddenReq);
        Assert.Equal(HttpStatusCode.Forbidden, forbiddenRes.StatusCode);

        // Student A confirms their own hold -> 200 OK
        var confirmReq1 = new HttpRequestMessage(HttpMethod.Post, $"/holds/{hold.HoldId}/confirm");
        confirmReq1.Headers.Add("X-Student-Id", studentA);
        var confirmRes1 = await client.SendAsync(confirmReq1);
        Assert.Equal(HttpStatusCode.OK, confirmRes1.StatusCode);
        var confirmResult1 = await confirmRes1.Content.ReadFromJsonAsync<HoldConfirmResponse>();
        Assert.NotNull(confirmResult1);
        Assert.Equal("CONFIRMED", confirmResult1.Status);

        // Idempotency check: Student A confirms AGAIN -> still 200 OK with CONFIRMED
        var confirmReq2 = new HttpRequestMessage(HttpMethod.Post, $"/holds/{hold.HoldId}/confirm");
        confirmReq2.Headers.Add("X-Student-Id", studentA);
        var confirmRes2 = await client.SendAsync(confirmReq2);
        Assert.Equal(HttpStatusCode.OK, confirmRes2.StatusCode);

        // Verify confirmedSeats incremented only ONCE
        var classCheck = await client.GetFromJsonAsync<ClassResponse>($"/classes/{createdClass.Id}");
        Assert.NotNull(classCheck);
        Assert.Equal(1, classCheck.ConfirmedSeats);
        Assert.Equal(0, classCheck.HeldSeats);
        Assert.Equal(9, classCheck.AvailableSeats);
    }
}
