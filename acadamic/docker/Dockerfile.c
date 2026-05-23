FROM gcc:13-bookworm
RUN useradd -m -u 1000 code
USER code
WORKDIR /code
