# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

ARG NODE_VERSION=22.13.1

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production

# Build metadata (injected via build args).
ARG BUILD_SHA
ARG BUILD_URL
ARG BUILD_TIME
ARG BUILD_IMAGE
ENV BUILD_SHA=${BUILD_SHA}
ENV BUILD_URL=${BUILD_URL}
ENV BUILD_TIME=${BUILD_TIME}
ENV BUILD_IMAGE=${BUILD_IMAGE}

WORKDIR /usr/src/app

# Download dependencies (no lockfile).
COPY package.json ./
RUN --mount=type=cache,target=/root/.npm npm install --omit=dev

# Run the application as a non-root user.
USER node

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 4000

# Run the application.
CMD npm start
