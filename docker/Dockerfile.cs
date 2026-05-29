FROM mcr.microsoft.com/dotnet/sdk:8.0

RUN if id -u 1000 >/dev/null 2>&1; then userdel "$(id -un 1000)"; fi && useradd -m -u 1000 code
USER code
RUN mkdir -p /home/code/proj && cd /home/code/proj && dotnet new console --force --no-restore 2>/dev/null && dotnet restore 2>/dev/null && rm -rf bin
WORKDIR /code
