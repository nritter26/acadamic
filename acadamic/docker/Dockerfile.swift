FROM swift:6.0-jammy
RUN if id -u 1000 >/dev/null 2>&1; then userdel "$(id -un 1000)"; fi && useradd -m -u 1000 code
USER code
WORKDIR /code
