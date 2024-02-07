#!/usr/bin/env python3

import shutil
import cleanterminus

cleanterminus.clear()

shutil.copytree('client', '/srv/http/Masonry-AR/client', dirs_exist_ok=True)
shutil.copytree('server/src', '/srv/http/Masonry-AR/server/', dirs_exist_ok=True)