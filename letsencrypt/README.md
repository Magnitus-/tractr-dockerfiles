#dockerfile: letsencrypt

## Overview

This script is meant to run the letsencrypt client as a composable background daemon in webroot mode.

## Status

Beta. Functional so far, but incomplete.

## Usage

1. Edit the DOMAIN environment variable in the docker-compose.yml file to your domain
2. Edit the extra_hosts entry in the docker-compose.yml file to point to your localhost's address on docker's bridge (note that the default value should be good if you don't boot the docker daemon with a custom address range)
3. Ensure you have a reverse-proxy image ready that can (see reverse proxy example):
  - Link to the letsencrypt-server container
  - Maps requests of the ```/.well-known/acme-challenge/{path*}``` variety to the letsencrypt-server container on port 8080
  - Gets volumes from the letsencrypt-certificates container
  - Gets its certificates from the /etc/letsencrypt/live shared volume
  - Has a ```POST /certificates/reloading``` route that is accessible only by other local docker containers and which, when called, reload certificates (probably by rebooting)
4. From the project's folder, start the certificate container: docker-compose up -d certificates
5. From the project's folder, start the letsencrypt server container: docker-compose up -d server
6. Start your reverse-proxy container
7. From the project's folder, start the letsencrypt client container: docker-compose up -d client

## TODO

- Add frequency of checks (currently every 1d) and frequency of updates (currently every 31d) as docker-compose environment variables
- Improve certificates/keys folder structure
- Add certificates in example proxy server
- Secure certificate reload route in proxy server
- Add support for more than one domain
- Create fixed docker images rather than relying on building the image each time

## Notes

I went with the acme-tiny client instead of the official letsencrypt client.

Trying to run the official client as non-root in a container felt like pulling teeth.

It was way easier to go from the more minimal acme-tiny client and add the extra features I needed on top.
