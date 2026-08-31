FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NITRO_HOST=0.0.0.0
COPY --from=build /app/.output ./.output
USER node
CMD ["node", ".output/server/index.mjs"]
