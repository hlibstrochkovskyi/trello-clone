# --- STAGE 1: BUILD ---
# Use Node.js 18 (as recommended in your dependencies)
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy all other frontend code
COPY . .

# Build React application into static files (into /dist folder)
RUN npm run build

# --- STAGE 2: RUN ---
# Use Nginx (lightweight web server) to serve files
FROM nginx:1.25-alpine

# Copy built files from STAGE 1 (/app/dist) to Nginx folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our proxy configuration (we'll create it in Step 2)
# This configuration tells Nginx: "Send all requests to /api to the backend"
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80