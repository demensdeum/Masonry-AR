#!/usr/bin/env python3

import os
import subprocess
import cleanterminus

def run_commands():
    cleanterminus.clear()
    # os.system('npm install typescript')
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

    os.system('tsc')

if __name__ == "__main__":
    run_commands()
