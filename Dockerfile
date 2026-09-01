FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
COPY --chown=node:node --from=build /app/.output ./.output
EXPOSE 3003
USER node
CMD ["node", ".output/server/index.mjs"]
