FROM php:8.3-cli-alpine
RUN adduser -D -u 1000 code
USER code
WORKDIR /code
