#!/usr/bin/env python
# -*- coding: utf-8 -*-
import time
import subprocess
import traceback
import logging

while True:
    try:
        subprocess.check_call(["/opt/letsencrypt/venv/bin/letsencrypt", "certonly", "--test-cert", "--agree-tos"])
    except Exception as e:
        logging.error(traceback.format_exc())
    time.sleep(86400)