#!/usr/bin/env python3

import subprocess
import cleanterminus

cleanterminus.clean()

subprocess.run('./vendor/bin/phan', shell=True, check=True)
