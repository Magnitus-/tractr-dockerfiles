#!/usr/bin/env python
# -*- coding: utf-8 -*-
import time
import subprocess
import os
import traceback
import logging

while True:
    try:
        if os.path.isfile("/etc/letsencrypt/live/privkey.pem"):
            subprocess.check_call(["/opt/letsencrypt/venv/bin/letsencrypt", "renew", "--dry-run", "--agree-tos", "--webroot", "--webroot-path", "/var/www/html/letsencrypt"])
        else:
            subprocess.check_call(["/opt/letsencrypt/venv/bin/letsencrypt", "certonly", "--test-cert", "--agree-tos", "--standalone", "--standalone-supported-challenges", "http-01"])
    except Exception as e:
        logging.error(traceback.format_exc())
    time.sleep(86400)