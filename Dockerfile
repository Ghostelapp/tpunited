FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY apps ./apps
COPY packages ./packages
COPY deployments ./deployments
CMD ["node", "apps/indexer/indexer.mjs"]
