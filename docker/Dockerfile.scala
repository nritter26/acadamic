FROM eclipse-temurin:22-jdk

# 1. Install system utilities, Scala 3.3.3, AND Coursier CLI with explicit valid URLs
RUN apt-get update && apt-get install -y curl unzip && rm -rf /var/lib/apt/lists/* && \
    curl -sL "https://github.com" -o /tmp/scala3.tar.gz && \
    tar -xzf /tmp/scala3.tar.gz -C /opt && rm /tmp/scala3.tar.gz && \
    ln -s /opt/scala3-3.3.3/bin/scalac /usr/local/bin/scalac && \
    ln -s /opt/scala3-3.3.3/bin/scala /usr/local/bin/scala && \
    curl -fLo /usr/local/bin/cs https://github.com && \
    chmod +x /usr/local/bin/cs

# 2. Pre-download dependencies cleanly into a flat system directory
RUN mkdir -p /opt/scala-libs && \
    COURSIER_CACHE=/tmp/cs-cache cs fetch \
    org.typelevel::cats-core:2.10.0 \
    io.circe::circe-core:0.14.6 \
    --default=true > /tmp/libs.txt && \
    while read -r file; do cp "$file" /opt/scala-libs/; done < /tmp/libs.txt && \
    rm -rf /tmp/cs-cache /tmp/libs.txt

# 3. Create the user and explicitly set up a writable /code directory
RUN if id -u 1000 >/dev/null 2>&1; then userdel "$(id -un 1000)"; fi && \
    useradd -m -u 1000 code && \
    mkdir -p /code && \
    chown -R code:code /code /opt/scala-libs

USER code
WORKDIR /code

