FROM alpine:latest
RUN apk add --no-cache bash && adduser -D -u 1000 code
USER code
WORKDIR /code
