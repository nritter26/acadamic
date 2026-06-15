FROM rust:1.81-slim-bookworm AS builder

WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY crates ./crates
COPY content ./content
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/kodex-backend /app/kodex-backend
COPY --from=builder /app/content ./content
EXPOSE 3001
CMD ["/app/kodex-backend"]
