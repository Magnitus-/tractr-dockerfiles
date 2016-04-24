#dockerfile: letsencrypt

## Overview

This script is meant to run the letsencrypt client as a composable background daemon in webroot mode.

## Status

Beta. Functional so far. Multiple domains not yet tested.

## Usage

1. Edit the DOMAIN environment variable in the docker-compose.yml file to your domain (you can put several domains by separating them with a ; character)
2. Edit the EXECUTION_DELAY environment variable in the docker-compose.yml file to represent the number of days you want to elapse between executions of the script (advisable to be more frequent than certificate renewals in case there is an error during a particular renewal)
3. Edit the RENEWAL_DELAY environment variable in the docker-compose.yml file to represent the guaranteed minimum time interval between certificate renewals
4. Edit the extra_hosts entry in the docker-compose.yml file to point to your localhost's address on docker's bridge (note that the default value should be good if you don't boot the docker daemon with a custom address range)
5. Ensure you have a reverse-proxy image ready that can (see reverse proxy example):
  - Link to the letsencrypt-server container
  - Maps requests of the ```/.well-known/acme-challenge/{path*}``` variety to the letsencrypt-server container on port 8080
  - Gets volumes from the letsencrypt-certificates container
  - Gets its certificates from the /etc/letsencrypt/live shared volume
  - Has a ```POST /certificates/reloading``` route that is accessible only by other local docker containers and which, when called, reload certificates (probably by rebooting)
6. From the project's folder, start the certificate container: docker-compose up -d certificates
7. From the project's folder, start the letsencrypt server container: docker-compose up -d server
8. Start your reverse-proxy container
9. From the project's folder, start the letsencrypt client container: docker-compose up -d client

## TODO

- Improve certificates/keys folder structure
- Create fixed docker images rather than relying on building the image each time
- Make the decision to run the client in daemon mode composable (to allow launching the client from cron)
- Make location of the webroot directory composable in client so that it can more easily be used with an existing existing production server
- Add doc to run script in cron or with existing production server

## Notes

I went with the acme-tiny client instead of the official letsencrypt client.

Trying to run the official client as non-root in a container felt like pulling teeth.

It was way easier to go from the more minimal acme-tiny client and add the extra features I needed on top.
