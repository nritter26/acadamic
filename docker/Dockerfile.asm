FROM alpine:latest
RUN apk add --no-cache nasm binutils && adduser -D -u 1000 code
USER code
WORKDIR /code
