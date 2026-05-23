FROM rust:1.78-slim
RUN useradd -m -u 1000 code
USER code
WORKDIR /code
