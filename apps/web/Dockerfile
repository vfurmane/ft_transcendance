FROM node:19-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /usr/src
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=web --docker

# Installer
FROM node:19-alpine AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /usr/src

COPY .gitignore .gitignore
COPY --from=builder /usr/src/out/json/ .
COPY --from=builder /usr/src/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=builder /usr/src/out/full/ .
COPY turbo.json turbo.json
RUN npx turbo run build --filter=web...

# Runner
FROM node:19-alpine AS runner
WORKDIR /usr/src

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /usr/src .

CMD ["npm", "run", "start", "--prefix", "apps/web"]