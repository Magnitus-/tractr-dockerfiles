#dockerfile: letsencrypt

## Overview

This is a reverse-proxy coupled with a letsencrypt client daemon to auto-renew TLS certificates.

It is composable in a docker-compose file.

## Status

Beta. Functional so far.

## Features

- Auto-renewing certificates. Reverse-proxy will gracefully reboot upon certificate renewal.
- Reverse-proxy will function with unencrypted http is certificates cannot be located (useful for local dev)
- Routing file well isolated from the rest of the logic and easily editable
- Reverse-proxy, as well as the letsencrypt client and server, run as a non-root user
- Reverse-proxy spawned from dump-init which makes it responsive to SIGTERM signals
- Many composable flags to fine-tune the behavio of the letsencrypt client (see letsencrypt directory)

## Usage

Take the templates and adapt them to your need. Also adapt the routing file to suit your application.

The dev template will run without the letsencrypt client or tls.

The prod template will run with a daemon letsencrypt client.
