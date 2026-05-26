FROM ubuntu:22.04 AS base

ENV DEBIAN_FRONTEND=noninteractive

# ── System packages ──
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl wget gnupg lsb-release xz-utils unzip \
    build-essential gcc g++ gdb \
    python3 python3-pip python3-venv \
    nasm \
    php-cli php-mbstring php-xml \
    ruby \
    && rm -rf /var/lib/apt/lists/*

# ── Node.js 22 ──
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# ── Go 1.23 ──
RUN curl -fsSL https://go.dev/dl/go1.23.0.linux-amd64.tar.gz \
    | tar -C /usr/local -xz \
    && ln -s /usr/local/go/bin/go /usr/local/bin/go

# ── Rust (rustup) ──
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
    | sh -s -- -y \
    && ln -s /root/.cargo/bin/rustc /usr/local/bin/rustc \
    && ln -s /root/.cargo/bin/cargo /usr/local/bin/cargo

# ── .NET SDK 8.0 + dotnet-script ──
RUN wget -q https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O /tmp/msprod.deb \
    && dpkg -i /tmp/msprod.deb \
    && rm /tmp/msprod.deb \
    && apt-get update && apt-get install -y --no-install-recommends dotnet-sdk-8.0 \
    && rm -rf /var/lib/apt/lists/* \
    && dotnet tool install -g dotnet-script

# ── Kotlin + JDK 17 (LTS) ──
RUN apt-get update && apt-get install -y --no-install-recommends openjdk-17-jdk-headless \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL https://github.com/JetBrains/kotlin/releases/download/v2.0.21/kotlin-compiler-2.0.21.zip -o /tmp/kc.zip \
    && unzip -q /tmp/kc.zip -d /opt \
    && rm /tmp/kc.zip \
    && ln -s /opt/kotlinc/bin/kotlinc /usr/local/bin/kotlinc \
    && ln -s /opt/kotlinc/bin/kotlin /usr/local/bin/kotlin

# ── Scala 3.3.3 ──
RUN curl -fsSL "https://github.com/lampepfl/dotty/releases/download/3.3.3/scala3-3.3.3.tar.gz" -o /tmp/scala3.tar.gz \
    && tar -xzf /tmp/scala3.tar.gz -C /opt \
    && rm /tmp/scala3.tar.gz \
    && ln -s /opt/scala3-3.3.3/bin/scalac /usr/local/bin/scalac \
    && ln -s /opt/scala3-3.3.3/bin/scala /usr/local/bin/scala

# ── Swift 6.0 ──
RUN curl -fsSL https://download.swift.org/swift-6.0-release/ubuntu2204/swift-6.0-RELEASE/swift-6.0-RELEASE-ubuntu22.04.tar.gz \
    | tar -C /opt -xz \
    && ln -s /opt/swift-*/usr/bin/swift /usr/local/bin/swift \
    && ln -s /opt/swift-*/usr/bin/swiftc /usr/local/bin/swiftc

# ── Zig 0.13 ──
RUN curl -fsSL https://ziglang.org/download/0.13.0/zig-linux-x86_64-0.13.0.tar.xz \
    | tar -C /opt -xJ \
    && ln -s /opt/zig-linux-x86_64-*/zig /usr/local/bin/zig

# ── Wasmtime ──
RUN curl -fsSL https://github.com/bytecodealliance/wasmtime/releases/download/v25.0.0/wasmtime-v25.0.0-x86_64-linux.tar.xz \
    | tar -C /opt -xJ \
    && ln -s /opt/wasmtime-*/wasmtime /usr/local/bin/wasmtime

# ── tsx globally ──
RUN npm install -g tsx

ENV PATH="/root/.cargo/bin:/root/.dotnet/tools:/usr/local/go/bin:${PATH}"
ENV DOTNET_ROOT=/usr/share/dotnet

# ── App source ──
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:ai

EXPOSE 3000

ENV AI_PROVIDER=keyword
ENV PORT=3000
ENV NODE_ENV=development

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npx", "tsx", "server.ts"]
