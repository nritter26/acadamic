FROM mcr.microsoft.com/dotnet/sdk:8.0
RUN dotnet tool install -g dotnet-script && useradd -m -u 1000 code
ENV PATH="$PATH:/root/.dotnet/tools"
USER code
WORKDIR /code
