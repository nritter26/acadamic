FROM eclipse-temurin:22-jdk

RUN apt-get update && apt-get install -y curl unzip && rm -rf /var/lib/apt/lists/* && \
    curl -fsSL "https://github.com/lampepfl/dotty/releases/download/3.3.3/scala3-3.3.3.tar.gz" -o /tmp/scala3.tar.gz && \
    tar -xzf /tmp/scala3.tar.gz -C /opt && rm /tmp/scala3.tar.gz && \
    ln -s /opt/scala3-3.3.3/bin/scalac /usr/local/bin/scalac && \
    ln -s /opt/scala3-3.3.3/bin/scala /usr/local/bin/scala && \
    if id -u 1000 >/dev/null 2>&1; then userdel "$(id -un 1000)"; fi && useradd -m -u 1000 code

USER code
WORKDIR /code
RUN echo '@main def main() = println(42)' > /tmp/warmup.scala && scala /tmp/warmup.scala && rm /tmp/warmup.scala
