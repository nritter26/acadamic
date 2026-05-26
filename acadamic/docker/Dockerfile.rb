FROM ruby:3.2-slim
RUN useradd -m -u 1000 code
USER code
WORKDIR /code
