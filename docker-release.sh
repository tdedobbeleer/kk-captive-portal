#!/usr/bin/env bash

build () {
  if ! docker build -t "${DOCKER_USER}/kk-captive-portal:${1}" .; then
    echo "Building tag ${1} failed miserably."
    exit 1
  else
    echo "Pushing tag ${1}."
    docker push "${DOCKER_USER}/kk-captive-portal:${1}"
  fi
}

DATE=$( date '+%y%m%d.%H.%M.%S' )
TAG=

echo "Pushing docker image version ${DATE} and tagging latest"

#Login
echo "${DOCKER_PASSWORD}" | docker login --username $DOCKER_USER --password-stdin

build "latest"
build "${DATE}"