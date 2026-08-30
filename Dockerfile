# syntax=docker/dockerfile:1

FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ARG NUXT_PUBLIC_API_URL=http://localhost:3001/api
ARG NUXT_PUBLIC_HELPDESK_URL=http://localhost:3002
ARG NUXT_API_URL=http://host.docker.internal:3001/api
ENV NUXT_PUBLIC_API_URL=$NUXT_PUBLIC_API_URL
ENV NUXT_PUBLIC_HELPDESK_URL=$NUXT_PUBLIC_HELPDESK_URL
ENV NUXT_API_URL=$NUXT_API_URL
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3003
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3003
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json
EXPOSE 3003
USER node
CMD ["node", ".output/server/index.mjs"]
