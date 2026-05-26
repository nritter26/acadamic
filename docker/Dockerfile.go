FROM golang:1.23-alpine
RUN adduser -D -u 1000 code
USER code
WORKDIR /code
