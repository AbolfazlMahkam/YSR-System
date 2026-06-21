# BUILD CONTEXT = repo ROOT (the single root package-lock.json must be visible).
# Build:  docker build -f apps/backend/Dockerfile -t ysr-backend .
#
# Why root context: there is exactly ONE lockfile (root package-lock.json), and it
# is workspace-hoisted. A reproducible `npm ci` must run against that root lockfile,
# so every workspace package.json manifest is copied before install.

############################################################
# 1) deps — full install (incl. devDeps: @nestjs/cli, typescript) for building
############################################################
FROM node:22-alpine AS deps
WORKDIR /app
# Root manifests + every workspace manifest (required for npm ci to validate the lock)
COPY package.json package-lock.json ./
COPY apps/backend/package.json                 apps/backend/package.json
COPY apps/frontend/package.json                apps/frontend/package.json
COPY packages/ui/package.json                  packages/ui/package.json
COPY packages/eslint-config/package.json       packages/eslint-config/package.json
COPY packages/typescript-config/package.json   packages/typescript-config/package.json
RUN npm ci

############################################################
# 2) build — compile backend TS -> apps/backend/dist (includes dist/migrations)
############################################################
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend ./apps/backend
# Hoisted deps at the workspace root...
COPY --from=deps /app/node_modules ./node_modules
# ...plus any NON-hoisted deps npm nested under the workspace (e.g. @nestjs/cli,
# whose `nest` bin lands in apps/backend/node_modules/.bin when it can't hoist).
# Copied AFTER the source so it is not clobbered by the `COPY apps/backend` above.
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
RUN npm run build --workspace=backend

############################################################
# 3) prod-deps — reproducible runtime-only tree from the SAME lockfile
############################################################
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json                 apps/backend/package.json
COPY apps/frontend/package.json                apps/frontend/package.json
COPY packages/ui/package.json                  packages/ui/package.json
COPY packages/eslint-config/package.json       packages/eslint-config/package.json
COPY packages/typescript-config/package.json   packages/typescript-config/package.json
RUN npm ci --omit=dev && npm cache clean --force

############################################################
# 4) runtime — minimal, non-root
############################################################
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
# WORKDIR is the app dir: `node dist/main` -> dist/main.js, and the backend serves
# express.static(process.cwd()+'/uploads'), so cwd MUST be /app/apps/backend.
WORKDIR /app/apps/backend
# dumb-init => correct PID1 signal handling (clean TypeORM pool shutdown on `docker stop`)
RUN apk add --no-cache dumb-init
# Hoisted prod node_modules live at the workspace root (/app/node_modules); Node
# resolves upward from /app/apps/backend, so copy the root tree.
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build     /app/apps/backend/dist         ./dist
COPY --from=build     /app/apps/backend/package.json ./package.json
# uploads dir must exist and be writable by the non-root `node` user BEFORE the
# named volume mounts onto it — a Docker named volume inherits the ownership of
# its mountpoint directory the first time it is created.
RUN mkdir -p ./uploads && chown -R node:node /app
USER node
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
# migrationsRun:true applies migrations at boot — NO separate migration step.
CMD ["node", "dist/main"]
