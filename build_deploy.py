#!/usr/bin/env python3

import shutil
import cleanterminus
import subprocess
import os

os.chdir("client")
subprocess.run('tools/build.py', shell=True, check=True)
os.chdir("..")

os.chdir("server")
subprocess.run('tools/build.py', shell=True, check=True)
os.chdir("..")

cleanterminus.clear()

shutil.rmtree('/srv/http/Masonry-AR')
shutil.copytree('client', '/srv/http/Masonry-AR/client', dirs_exist_ok=True)
shutil.copytree('server/src', '/srv/http/Masonry-AR/server/', dirs_exist_ok=True)