FROM node:22-slim
RUN useradd -m -u 1000 code
USER code
WORKDIR /code
