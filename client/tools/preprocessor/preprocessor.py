# -*- coding: utf-8 -*-

import os
import sys
import json
import re

def load_rules(file_path):
    with open(file_path, 'r') as rules_file:
        return json.load(rules_file)

def process_file(input_file, output_file, rules):
    with open(input_file, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    with open(output_file, 'w', encoding='utf-8') as file:
        for line in lines:
            new_line = line
            for pattern, replacement in rules.items():
                new_line = re.sub(re.escape(pattern), replacement, new_line)
                if line != new_line:
                    print(f"Was: {line}\nBecome: {new_line}\noutput_file: {output_file}")
            file.write(new_line)

def process_files_in_folder(input_folder, output_folder, rules, silent_mode=True):
    for filename in os.listdir(input_folder):
        if filename.endswith(".ts"):
            input_file = os.path.join(input_folder, filename)
            output_file = os.path.join(output_folder, filename)
            process_file(input_file, output_file, rules)
            if not silent_mode:
                print(f"File {filename} processed and saved in {output_folder}.")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python script.py /path/to/input/folder /path/to/output/folder /path/to/rules.json [silent_mode]")
        sys.exit(1)

    input_folder = sys.argv[1]
    output_folder = sys.argv[2]
    rules_file_path = sys.argv[3]

    for root, dirs, files in os.walk(output_folder):
        for file in files:
            try:
                os.remove(os.path.join(root, file))
            except Exception as error:
                print("Preprocessor clean error: " + error)

    silent_mode = True
    if len(sys.argv) == 5:
        silent_mode = sys.argv[4].lower() == 'true'

    if not os.path.exists(input_folder):
        print(f"The specified folder {input_folder} does not exist.")
        sys.exit(1)

    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    if not os.path.exists(rules_file_path):
        print(f"The specified rules file {rules_file_path} does not exist.")
        sys.exit(1)

    rules = load_rules(rules_file_path)

    process_files_in_folder(input_folder, output_folder, rules, silent_mode)
