# ---------- Build stage ----------
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code including .env
COPY . .

# Ensure .env is available during build
COPY .env .env

# Build the React app
RUN npm run build

# ---------- Production stage ----------
FROM node:20-alpine AS production

# Install lightweight static server
RUN npm install -g serve

WORKDIR /app

# Copy build artifacts from build stage
COPY --from=build /app/build ./build

# Expose port for frontend
EXPOSE 3000

# Serve the React build
CMD ["serve", "-s", "build", "-l", "3000"]
