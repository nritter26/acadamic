FROM swift:6.0-jammy-slim
RUN useradd -m -u 1000 code
USER code
WORKDIR /code
