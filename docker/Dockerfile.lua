FROM alpine:latest
RUN apk add --no-cache lua5.4 inotify-tools && adduser -D -u 1000 code
USER code
WORKDIR /code
