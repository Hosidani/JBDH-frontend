# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set build-time arguments
ARG VITE_MODE=production
# Build the app (Vite will read from .env files based on mode)
RUN npm run build -- --mode ${VITE_MODE}

# Production stage
FROM nginx:alpine

# Copy built app from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration as envsubst template
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80
