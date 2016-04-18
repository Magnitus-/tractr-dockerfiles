#!/usr/bin/env python
# -*- coding: utf-8 -*-
import time
import subprocess
import os
import traceback
import logging
import urllib2

while True:
    try:
        if os.path.isfile("/etc/letsencrypt/live/privkey.pem"):
            subprocess.check_call(["/opt/letsencrypt/venv/bin/letsencrypt", "renew", "--dry-run", "--agree-tos"])
        else:
            subprocess.check_call(["/opt/letsencrypt/venv/bin/letsencrypt", "certonly", "--test-cert", "--agree-tos"])
        if True: #Replace by check for new certificates
            try:
                req = urllib2.Request(url="http://reverse-proxy/certificates/reloading", data="")
                descriptor = urllib2.urlopen(req)
                body = str(descriptor.read())
            except Exception as e:
                logging.error("Failed to alert reverse-proxy of new certificates")
    except Exception as e:
        logging.error(traceback.format_exc())
    time.sleep(86400)