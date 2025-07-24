# Stage 1: Build Angular app
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Install Angular CLI globally
RUN npm install -g @angular/cli@17

# Copy source code
COPY . .

# Build the Angular app in production mode
RUN ng build --configuration production

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular files to Nginx HTML directory
COPY --from=build /app/dist/client/browser/ /usr/share/nginx/html/

# Set proper permissions for Nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Copy custom Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]