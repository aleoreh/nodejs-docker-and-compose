FROM node:16-alpine AS builder

WORKDIR /usr/share/nginx/html

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ #

FROM nginx:latest AS production

WORKDIR /usr/share/nginx/html

COPY --from=builder /usr/share/nginx/html/build ./
