#!/usr/bin/env bash
export DOCKER_CLI_EXPERIMENTAL=enabled

build () {
  if ! docker buildx build --push --platform linux/arm64/v8,linux/amd64 --tag "${DOCKER_USER}/kk-captive-portal:${1}" .; then
    echo "Building tag ${1} failed miserably."
    exit 1
  fi
}

DATE=$( date '+%y%m%d.%H.%M.%S' )
TAG=

echo "Pushing docker image version ${DATE} and tagging latest"

#Login
echo "${DOCKER_PASSWORD}" | docker login --username $DOCKER_USER --password-stdin

#Build for all archs
docker context create buildx-build
docker buildx create --use buildx-build

build "latest"
build "${DATE}"