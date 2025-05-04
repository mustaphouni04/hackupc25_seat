FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./ 

RUN npm install

COPY . .

COPY public/ ./public/

RUN npm run build

FROM node:20-alpine

RUN npm install -g serve

WORKDIR /app

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]