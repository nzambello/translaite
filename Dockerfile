# base node image
FROM node:16-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl sqlite3

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /translaite

ADD package.json .npmrc ./
RUN npm install --include=dev

# Setup production node_modules
FROM base as production-deps

WORKDIR /translaite

COPY --from=deps /translaite/node_modules /translaite/node_modules
ADD package.json .npmrc ./
RUN npm prune --omit=dev

# Build the app
FROM base as build

WORKDIR /translaite

COPY --from=deps /translaite/node_modules /translaite/node_modules

ADD prisma .
RUN npx prisma generate

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

ENV DATABASE_URL=file:/data/sqlite.db
ENV PORT="8080"
ENV NODE_ENV="production"
ENV SESSION_SECRET="${SESSION_SECRET:-8d17b3e56ceaf651e8763db9a80fc7f6}"
ENV ALLOW_USER_SIGNUP=0

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

WORKDIR /translaite

COPY --from=production-deps /translaite/node_modules /translaite/node_modules
COPY --from=build /translaite/node_modules/.prisma /translaite/node_modules/.prisma

COPY --from=build /translaite/build /translaite/build
COPY --from=build /translaite/public /translaite/public
COPY --from=build /translaite/package.json /translaite/package.json
COPY --from=build /translaite/start.sh /translaite/start.sh
COPY --from=build /translaite/prisma /translaite/prisma

RUN chmod +x start.sh

ENTRYPOINT [ "./start.sh" ]

EXPOSE 8080
