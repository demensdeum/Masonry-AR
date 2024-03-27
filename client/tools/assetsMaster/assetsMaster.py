#!/usr/bin/env python

import sys
import os
import subprocess
from pathlib import Path
import shutil


import copy
import json
import os
import tempfile
import subprocess
import shutil
import sys
from gltflib import GLTF

def png_to_jpg(source_file, output_file):
    print(source_file)
    print(output_file)
    subprocess.run(['magick', 'convert', source_file, '-quality', '75', output_file])

def copy_file(source_file, output_file):
    print(source_file)
    print(output_file)
    with open(source_file, 'rb') as f_src:
        with open(output_file, 'wb') as f_dst:
            f_dst.write(f_src.read())


def keep_same_file_if_larger(source_file, output_file):
    if os.path.getsize(output_file) > os.path.getsize(source_file):
        os.remove(output_file)
        copy_file(source_file, output_file)

def format_size(size_in_bytes):
    units = ['B', 'KB', 'MB', 'GB', 'TB']
    size = float(size_in_bytes)
    for unit in units[:-1]:
        if size < 1024.0:
            break
        size /= 1024.0

    return f"{size:.2f} {unit}"

def compress_files(source_dir, output_dir):
    files = {}

    extension_to_compressor = {
        ".png" : [".jpg", png_to_jpg],
        ".glb" : [".glb", compress_glb]
    }

    source_size = 0
    destination_size = 0

    Path(output_dir).mkdir(parents=True, exist_ok=True)
    shutil.rmtree(output_dir)
    os.makedirs(output_dir)

    for item in os.listdir(source_dir):
        source_file = os.path.join(source_dir, item)
        if os.path.isdir(source_file):
            continue        
        extension = os.path.splitext(item)[1]
        print(extension)
        if extension in extension_to_compressor:
            compressor = extension_to_compressor[extension]
            output_file = os.path.join(output_dir, os.path.splitext(item)[0] + compressor[0])
            compressor[1](source_file, output_file)
        else:
            print(f"copy {extension}")
            output_file = os.path.join(output_dir, item)
            copy_file(source_file, output_file)

        keep_same_file_if_larger(source_file, output_file)

        source_size += os.path.getsize(source_file)
        destination_size += os.path.getsize(output_file)

    return [source_size, destination_size]

def format_size(size_in_bytes):
    units = ['B', 'KB', 'MB', 'GB', 'TB']
    size = float(size_in_bytes)
    for unit in units[:-1]:
        if size < 1024.0:
            break
        size /= 1024.0

    return f"{size:.2f} {unit}"

def glb_to_gltf_extract_resources(source_filepath):
    gltf = GLTF.load(source_filepath)
    glb_resource = gltf.get_glb_resource()
    resources_filepath = os.path.join(tempfile.gettempdir(), "gltf-resources.bin")
    gltf.convert_to_file_resource(glb_resource, resources_filepath)
    gltf_filepath = os.path.join(tempfile.gettempdir(), "gltf-file.gltf")
    gltf.export(gltf_filepath)

    return {
        "gltf_filepath" : gltf_filepath,
        "resources_filepath" : resources_filepath
    }

def extract_textures(source_gltf_filepath, resources_filepath):
    output_textures = []
    f = open(source_gltf_filepath)
    gltf_file = json.load(f)
    resource = open(resources_filepath, "rb")
    for image in gltf_file["images"]:
        buffer_view = gltf_file["bufferViews"][image["bufferView"]]
        start_byte = buffer_view["byteOffset"]
        byte_length = buffer_view["byteLength"]
        if image["mimeType"] == "image/png":
            image_filename = f"gltf-temp-{image['name']}.png"
            image_filepath = os.path.join(tempfile.gettempdir(), image_filename)
            output_image_file = open(image_filepath, "wb")
            resource.seek(start_byte)    
            output_image_file.write(resource.read(byte_length))    
            output_textures.append(image_filename)
    return {
        "textures" : output_textures
    }

def compress_textures(textures):
    output_textures = {}
    for texture in textures:
        output_filename = f"{texture}.jpeg"
        source_filepath = os.path.join(tempfile.gettempdir(), texture)
        output_filepath = os.path.join(tempfile.gettempdir(), output_filename)
        print(source_filepath)
        print(output_filepath)
        subprocess.run(['magick', 'convert', source_filepath, '-quality', '75', '-resize', '512x512', output_filepath])
    return {
        "textures": output_textures
    }

def glft_to_glb(gltf_filepath, destination_filepath):
    output_glb = GLTF.load(gltf_filepath)
    output_glb.export(destination_filepath)    

def update_resources(gltf_filepath, source_resources_filepath, textures, destination_resources_filepath, output_gltf_filepath):
    print(gltf_filepath)
    print(source_resources_filepath)
    print(destination_resources_filepath)

    f = open(gltf_filepath)
    gltf_file = json.load(f)

    with open(source_resources_filepath, 'rb') as source_resources_file:
        resources_data = bytearray(source_resources_file.read())

    for index, image in enumerate(gltf_file["images"]):

        image_name = image["name"]
        image_buffer_index = image["bufferView"]

        buffer_view = gltf_file["bufferViews"][image_buffer_index]
        image_byte_offset = int(buffer_view["byteOffset"])

        image_filepath = os.path.join(tempfile.gettempdir(), f"gltf-temp-{image_name}.png.jpeg")

        with open(image_filepath, 'rb') as image_file:
            compressed_image_data = bytearray(image_file.read())

        compressed_image_data_length = len(compressed_image_data)

        padding_byte = 0x20
        need_padding_bytes_length = 4 - compressed_image_data_length % 4
        print(f"need_padding_bytes_length: {need_padding_bytes_length}")
        for i in range(need_padding_bytes_length):
            compressed_image_data.append(0x20)

        compressed_image_data_length = len(compressed_image_data)
        end_byte = image_byte_offset + compressed_image_data_length
        resources_data[image_byte_offset : end_byte] = compressed_image_data

        original_buffer_byte_start = buffer_view["byteOffset"]
        original_buffer_length = buffer_view["byteLength"] - buffer_view["byteLength"] % 4

        image["mimeType"] = "image/jpeg"

        bytes_difference = original_buffer_length - compressed_image_data_length

        unused_byte_start = end_byte - 1
        unused_byte_end = unused_byte_start + bytes_difference

        del resources_data[unused_byte_start : unused_byte_end]

        for updating_buffer in gltf_file["bufferViews"]:
            if updating_buffer["byteOffset"] == buffer_view["byteOffset"]:
                updating_buffer["byteLength"] = compressed_image_data_length
                print("pass changed bufferView")
                pass
            elif updating_buffer["byteOffset"] > unused_byte_end:
                updating_buffer["byteOffset"] = updating_buffer["byteOffset"] - bytes_difference
                if updating_buffer["byteOffset"] % 4 != 0:
                    print(f"{updating_buffer['byteOffset']}")
                    print(f"{updating_buffer['byteOffset'] % 4}")
            else:
                print(f"pass bufferView - {updating_buffer['byteOffset']}")

        print(f"image: {image_name} - {format_size(compressed_image_data_length)} replacement_data_length % 4 = {compressed_image_data_length % 4}")

    gltf_file["buffers"][0]["uri"] = "gltf-resources.bin.output.bin"

    with open(output_gltf_filepath, 'w') as output_gltf_file:
        json.dump(gltf_file, output_gltf_file)

    with open(destination_resources_filepath, 'wb') as destination_resources_file:
        destination_resources_file.write(resources_data)

    gltf_file["buffers"][0]["byteLength"] = os.path.getsize("/tmp/gltf-resources.bin.output.bin")        
    

def process_glb(source_filepath, destination_filepath = "", only_extract_textures = False):
    print(source_filepath)
    print(destination_filepath)

    glb_extract_result = glb_to_gltf_extract_resources(source_filepath)
    gltf_filepath = glb_extract_result["gltf_filepath"]
    extract_textures_result = extract_textures(gltf_filepath, glb_extract_result["resources_filepath"])
    if only_extract_textures:
        exit(0)
    textures = extract_textures_result["textures"]
    compress_textures_result = compress_textures(textures)
    resources_filepath = glb_extract_result["resources_filepath"]
    output_gltf_filepath = f"{glb_extract_result['gltf_filepath']}.output.gltf"
    output_resources_filepath = f"{resources_filepath}.output.bin"
    update_resources(glb_extract_result["gltf_filepath"], resources_filepath, textures, output_resources_filepath, output_gltf_filepath)
    glft_to_glb(output_gltf_filepath, destination_filepath)


def compress_glb(source_file, output_file):
    process_glb(source_file, output_file)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python assetsMaster.py assets-source assets-destination")
        sys.exit(1)

    input_folder = sys.argv[1]
    output_folder = sys.argv[2]

    result = compress_files(input_folder, output_folder)
    print(f"{format_size(result[0])} -> {format_size(result[1])}")