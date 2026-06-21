# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm install

# Copy all files
COPY . .

# Build app
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Only copy necessary files
COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]