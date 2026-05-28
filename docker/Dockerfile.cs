FROM mcr.microsoft.com/dotnet/sdk:8.0

RUN if id -u 1000 >/dev/null 2>&1; then userdel "$(id -un 1000)"; fi && useradd -m -u 1000 code
ENV PATH="$PATH:/home/code/.dotnet/tools"
USER code
RUN dotnet tool install -g dotnet-script
WORKDIR /code
