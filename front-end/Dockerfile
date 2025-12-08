# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

ARG NODE_VERSION=22.13.1

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine as base

# Set working directory for all build stages.
WORKDIR /usr/src/app


################################################################################
# Create a stage for installing production dependecies.
FROM base as deps

# Download dependencies (no lockfile).
COPY package.json ./
RUN --mount=type=cache,target=/root/.npm npm install --omit=dev

################################################################################
# Create a stage for building the application.
FROM deps as build

# Build metadata (injected via build args).
ARG REACT_APP_BUILD_SHA
ARG REACT_APP_BUILD_URL
ARG REACT_APP_BUILD_TIME
ENV REACT_APP_BUILD_SHA=${REACT_APP_BUILD_SHA}
ENV REACT_APP_BUILD_URL=${REACT_APP_BUILD_URL}
ENV REACT_APP_BUILD_TIME=${REACT_APP_BUILD_TIME}

# Copy the rest of the source files into the image.
COPY . .
# Run the build script.
RUN npm run build

################################################################################
# Post-build

# 2. For Nginx setup
FROM nginx:alpine

# Copy config nginx
# COPY --from=build /app/.nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf
# WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
# RUN rm -rf ./*

# Copy static assets from builder stage
# COPY --from=build /app/build .
COPY --from=build /usr/src/app/build /usr/share/nginx/html

EXPOSE 80

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]
