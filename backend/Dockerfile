# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["SchoolAdmission.Api.csproj", "./"]
RUN dotnet restore "./SchoolAdmission.Api.csproj"

COPY . .
RUN dotnet publish "SchoolAdmission.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "SchoolAdmission.Api.dll"]
