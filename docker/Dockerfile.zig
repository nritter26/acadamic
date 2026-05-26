FROM alpine:latest
RUN apk add --no-cache zig && adduser -D -u 1000 code
USER code
WORKDIR /code
