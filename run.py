#!/usr/bin/env python3

import subprocess

subprocess.run('./build_deploy.py -quick', shell=True, check=True)
subprocess.run('firefox https://localhost/Masonry-AR/client/', shell=True, check=True)