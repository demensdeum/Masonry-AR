#!/usr/bin/env python3

import os
import shutil
import subprocess
import cleanterminus
import glob
import os
import sys

def cleanDirectory(path):
    files = glob.glob(f"{path}/*.*")
    for f in files:
        try:
            os.remove(f)
        except:
            shutil.rmtree(f)

def run_commands():
    print("Clean...")
    cleanDirectory("src-preprocessed")
    cleanDirectory("build")
    cleanterminus.clear()
    os.environ["PATH"] += os.pathsep + os.path.join('.', 'node_modules', '.bin')
    print("Preprocessor...")
    preprocessor_path = os.path.join('.', 'tools', 'preprocessor', 'preprocessor.py')
    src_path = os.path.join('.', 'src')
    src_preprocessed_path = os.path.join('.', 'src-preprocessed')
    rules_path = os.path.join('.', 'tools', 'preprocessor', 'rules.json')

    try:
        subprocess.run(['python', preprocessor_path, src_path, src_preprocessed_path, rules_path], check=True)
    except subprocess.CalledProcessError as e:
        print(f"An error occurred! Exit code: {e.returncode}")
        exit(e.returncode)

    print("TypeScript...")
    subprocess.run('tsc', shell=True, check=True)
    shutil.copytree('external-libs', 'build', dirs_exist_ok=True)

    compress_resources = "-quick" in sys.argv == False

    if compress_resources:
        print("Resources compress...")        
        assets_master_path = os.path.join('.', 'tools', 'assetsMaster', 'assetsMaster.py')
        assets_src_path = os.path.join('.', 'assets-src')
        assets_output_path = os.path.join('.', 'assets')

        try:
            subprocess.run(['python', assets_master_path, assets_src_path, assets_output_path], check=True)
        except subprocess.CalledProcessError as e:
            print(f"An error occurred! Exit code: {e.returncode}")
            exit(e.returncode)    

if __name__ == "__main__":
    run_commands()
