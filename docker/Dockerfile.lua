FROM alpine:latest
RUN apk add --no-cache lua5.4 && adduser -D -u 1000 code
USER code
WORKDIR /code
