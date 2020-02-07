# see hooks/build and hooks/.config
ARG BASE_IMAGE_PREFIX
FROM ${BASE_IMAGE_PREFIX}alpine

# see hooks/post_checkout
ARG ARCH
COPY qemu-${ARCH}-static /usr/bin

LABEL maintainer="Reza Saeedi <reza.saeedi@mail.um.ac.ir>"

RUN apk add --update --no-cache npm curl

FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

EXPOSE 4000
CMD ["npm", "start"]
