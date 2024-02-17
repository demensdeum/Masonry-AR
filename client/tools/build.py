#!/usr/bin/env python3

import os
import shutil
import subprocess
import cleanterminus
import glob
import os

def cleanDirectory(path):
    files = glob.glob(f"{path}/*.*")
    for f in files:
        try:
            os.remove(f)
        except:
            shutil.rmtree(f)

def run_commands():
    cleanDirectory("src-preprocessed")
    cleanDirectory("build")
    cleanterminus.clear()
    os.environ["PATH"] += os.pathsep + os.path.join('.', 'node_modules', '.bin')
    preprocessor_path = os.path.join('.', 'tools', 'preprocessor', 'preprocessor.py')
    src_path = os.path.join('.', 'src')
    src_preprocessed_path = os.path.join('.', 'src-preprocessed')
    rules_path = os.path.join('.', 'tools', 'preprocessor', 'rules.json')

    try:
        subprocess.run(['python', preprocessor_path, src_path, src_preprocessed_path, rules_path], check=True)
    except subprocess.CalledProcessError as e:
        print(f"An error occurred! Exit code: {e.returncode}")
        exit(e.returncode)

    subprocess.run('tsc', shell=True, check=True)
    shutil.copytree('external-libs', 'build', dirs_exist_ok=True)

if __name__ == "__main__":
    run_commands()
