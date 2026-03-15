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
ARG VITE_API_URL=""

# Build the app
# If VITE_API_URL is provided, use it. Otherwise, Vite reads from .env files
RUN if [ -n "$VITE_API_URL" ]; then \
      VITE_API_URL="$VITE_API_URL" npm run build -- --mode ${VITE_MODE}; \
    else \
      npm run build -- --mode ${VITE_MODE}; \
    fi

# Production stage
FROM nginx:alpine

# Copy built app from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
