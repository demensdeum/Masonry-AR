#!/usr/bin/env python3

import shutil
import cleanterminus
import subprocess
import os
import sys
from pathlib import Path

cleanterminus.clear()
os.chdir("client")
print("Building client...")
commandLine = "tools/build.py"
if "-quick" in sys.argv:
    commandLine = "tools/build.py -quick"
subprocess.run(commandLine, shell=True, check=True)
os.chdir("..")

os.chdir("server")
print("Building server...")
subprocess.run('tools/build.py', shell=True, check=True)
os.chdir("..")

cleanterminus.clear()
print("Deploying...")

docker_image_flag_file = Path('/DockerImage')

if docker_image_flag_file.exists():
    print("Official Docker image, deploying...")
    shutil.copytree('client', '/var/www/html/Masonry-AR/client', dirs_exist_ok=True)
    shutil.copytree('server/src', '/var/www/html/Masonry-AR/server/', dirs_exist_ok=True)    
else:
    print("Not official docker image, deploying...")
    try:
        shutil.rmtree('/srv/http/Masonry-AR')
    except:
        pass
    shutil.copytree('client', '/srv/http/Masonry-AR/client/0', dirs_exist_ok=True)
    shutil.copyfile('client/tools/cacheBuster/index.php', '/srv/http/Masonry-AR/client/index.php')
    shutil.copytree('server/src', '/srv/http/Masonry-AR/server/', dirs_exist_ok=True)