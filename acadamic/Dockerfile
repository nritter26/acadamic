FROM node:22-slim

# Install Docker CLI for sandbox code execution
RUN apt-get update && apt-get install -y --no-install-recommends docker.io ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build:ai

EXPOSE 3000

ENV AI_PROVIDER=keyword
ENV PORT=3000
ENV NODE_ENV=development

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npx", "tsx", "server.ts"]
