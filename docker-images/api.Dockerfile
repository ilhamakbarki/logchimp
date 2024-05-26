FROM node:16.20.2-alpine3.18 as base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.4.0 --activate
RUN apk add --no-cache curl python3 make g++ vips-dev

WORKDIR /app
COPY content ./content
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/server ./packages/server

RUN pnpm install

EXPOSE 3000
CMD [ "node", "/app/packages/server/index.js" ]
