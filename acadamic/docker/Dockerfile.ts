FROM node:22-slim
RUN userdel node && npm install -g tsx && useradd -m -u 1000 code
USER code
WORKDIR /code
