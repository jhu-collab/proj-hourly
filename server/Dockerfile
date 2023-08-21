# syntax=docker/dockerfile:1

FROM node:current-bullseye-slim 
# ^ Build this docker image from the above base image
# Prefer lts-bullseye-slim but right now it does not have the latest npm

# Set Time Zone 
ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Read arguments passed to docker build command through --build-arg
ARG TARGET
ARG DATABASE_URL
ARG JWT_SECRET
ARG EMAIL_HOST
ARG EMAIL
ARG EMAIL_PASSWORD
ARG DEBUG
ARG NODE_ENV
ARG JHU_SSO_URL
ARG SP_NAME
ARG BASE_URL
ARG CERT
ARG PBK
ARG PVK
ARG HOURLY_API_KEY
ARG DB_PORT=$DB_PORT

# Set environment variables
ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET=$JWT_SECRET
ENV EMAIL_HOST=$EMAIL_HOST
ENV EMAIL=$EMAIL
ENV EMAIL_PASSWORD=$EMAIL_PASSWORD
ENV DEBUG=$DEBUG
ENV NODE_ENV=$NODE_ENV
ENV JHU_SSO_URL=$JHU_SSO_URL
ENV SP_NAME=$SP_NAME
ENV BASE_URL=$BASE_URL
ENV CERT=$CERT
ENV PBK=$PBK
ENV PVK = $PVK
ENV HOURLY_API_KEY=$HOURLY_API_KEY
ENV DB_PORT=$DB_PORT
# We set the ARG as ENV because the app needs it during runtime as well as build time

WORKDIR /app
# ^ Working directory of the container

COPY [ "package.json", "yarn.lock", "./" ]
# ^ Copy the package.json and yarn.lock into WORKDIR.

RUN if [ "$TARGET" = "production" ] ; then yarn install --production=true ; else yarn install ; fi
# Don't install dev-dependencies if in production

COPY . .
# ^ Copy all the files located in the current directory to WORKDIR
# Won't copy directory/files noted in .dockerignore

RUN yarn prisma generate --schema=./prisma/schema.prisma
# ^ Generates assets like Prisma Client based on the generator and data model 

# RUN if [ "$TARGET" = "production" ] ; then DATABASE_URL=$DATABASE_URL npx prisma migrate deploy ; else DATABASE_URL=$DATABASE_URL npx prisma migrate reset --force ; fi
RUN DATABASE_URL=$DATABASE_URL && npx prisma migrate deploy

# ^ Apply migrations 

EXPOSE 5050
# ^ The container listens on the specified network ports at runtime.
# EXPOSE does not actually publish the port. It functions as a type of documentation;
# you must make sure the app listens on this port.

CMD [ "yarn", "start" ]
# ^ same as running "yarn start" in your terminal 