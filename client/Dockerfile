# syntax=docker/dockerfile:1

FROM node:current-bullseye-slim AS build
# ^ Build this docker image from the above base image
# Prefer lts-bullseye-slim but right now it does not have the latest npm

# Set Time Zone 
ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Read arguments passed to docker build command through --build-arg
ARG VITE_RUN_MODE=${VITE_RUN_MODE}
ARG VITE_DEV_BASE_URL=${VITE_DEV_BASE_URL}
ARG VITE_PROD_BASE_URL=${VITE_PROD_BASE_URL}
ARG VITE_ROSTER_SSO_JHU_URL=${VITE_ROSTER_SSO_JHU_URL}

WORKDIR /app
# ^ Working directory of the container

COPY [ "package.json", "yarn.lock", "./" ]
# ^ Copy the package.json and yarn.lock into WORKDIR.

RUN yarn install
# Don't use --production=true because you need the dev-dependencies.

COPY . .
# ^ Copy all the files located in the current directory to WORKDIR
# Won't copy directory/files noted in .dockerignore

RUN VITE_RUN_MODE=$VITE_RUN_MODE VITE_DEV_BASE_URL=$VITE_DEV_BASE_URL VITE_PROD_BASE_URL=$VITE_PROD_BASE_URL VITE_ROSTER_SSO_JHU_URL=$VITE_ROSTER_SSO_JHU_URL yarn build
# ^ build the app

FROM socialengine/nginx-spa:latest
# ^ socialengine/nginx-spa is a simple static ngninx server that handle 
# pushState (every request is routed to /index.html so you can use frontend routing).

WORKDIR /app
# ^ Working directory of the container

COPY --from=build /app/dist .
# ^ Copy the build artifact (dist folder) from the build image to the WORKDIR of this one

RUN chmod -R 777 .
# ^ Update access permissions on the WORKDIR of this image