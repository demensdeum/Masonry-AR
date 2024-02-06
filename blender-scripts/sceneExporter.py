import os
import bpy
import json
from json import JSONEncoder
from datetime import datetime 

class Command:
    
    @staticmethod
    def default():
        return SceneObjectCommand("NONE", 0)
    
    @staticmethod
    def fromNode(node):
        name = node.name
        components = name.split("_")
        properties = bpy.data.objects[name]   
                     
        type = properties["type"]              
        time = properties["time"]
        export_name = components[1]
        
        next_command = "NONE"
        
        if "nextCommand" in properties:
            next_command = properties["nextCommand"]        
        
        position = Vector3(
            node.location.x,
            node.location.z,
            -node.location.y
        )        
        
        rotation = Vector3(
            node.rotation_euler.x,
            node.rotation_euler.z,
            node.rotation_euler.y
        )        
        
        return Command(
                export_name,
                type, 
                time, 
                position, 
                rotation,
                next_command
                )    
    
    def __init__(
    self, 
    name, 
    type, 
    time, 
    position, 
    rotation,
    next_command
    ):
        self.name = name
        self.type = type
        self.time = time
        self.position = position
        self.rotation = rotation
        self.nextCommand = next_command
        
class SceneObjectModel:
    
    @staticmethod
    def default():
        return SceneObjectModel("NONE")
    
    def __init__(self,name):
        self.name = name

class SceneObjectTexture:
    
    @staticmethod
    def default():
        return SceneObjectTexture("NONE")
        
    def __init__(self,name):
        self.name = name

class SceneObjectControls:
    
    @staticmethod
    def default():
        return SceneObjectControls("NONE", "NONE")
        
    def __init__(self, name, startCommand):
        self.name = name
        self.startCommand = startCommand

class Vector3:
    
    @staticmethod
    def default():
        return Vector3(0,0,0)
    
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

class SceneObject:
    
    @staticmethod
    def fromNode(node):
        print(node.name)
        print(node.location)
        print(node.rotation_euler)
        
        name = node.name
        
        type = "Model"
        model_name = "None"
        is_movable = True
        controls = None

        components = name.split("_")
        
        if name.startswith("Model_") or name.startswith("Decor_"):
            type = "Model"
            export_name = components[1]
            model_name = components[2]
            if export_name == "Map" or name.startswith("Decor_"):
                is_movable = False
                
        elif name.startswith("PlayerStartPosition_"):
            type = "Entity"
            export_name = "PlayerStartPosition"
            model_name = components[1]
        
        if name == "Camera":
            type = "Camera"
        elif name == "PlayerStartPosition":
            type = "Entity"
        
        controls_name = "NONE"
        controls_start_command = "NONE"
        next_command = "NONE"
        
        properties = bpy.data.objects[name]
        
        if "controlsName" in properties:
            controls_name = properties["controlsName"]
            
        if "startCommand" in properties:
            controls_start_command = properties["startCommand"]
        
        controls = SceneObjectControls(controls_name, controls_start_command)
        
        texture = SceneObjectTexture("NONE")
        model = SceneObjectModel(model_name)
        position = Vector3(
            node.location.x,
            node.location.z,
            -node.location.y
        )
        rotation = Vector3(
            node.rotation_euler.x,
            node.rotation_euler.z,
            node.rotation_euler.y
        )
        
        change_date = int(datetime.now().timestamp())
        
        sceneObject = SceneObject(
        export_name, 
        type, 
        texture, 
        model, 
        position, 
        rotation, 
        is_movable, 
        controls,
        change_date
        )
    
        return sceneObject
    
    def __init__(
    self, 
    name, 
    type, 
    texture, 
    model, 
    position, 
    rotation, 
    is_movable, 
    controls,
    change_date
    ):
        self.name = name
        self.type = type
        self.texture = texture
        self.model = model
        self.position = position
        self.rotation = rotation
        self.isMovable = is_movable
        self.controls = controls
        self.changeDate = change_date

class SceneFormat:
    def __init__(self, name, version):
        self.name = name
        self.version = version

class Scene:
    def __init__(self, name, skybox_texture_name, physics_enabled = True):
        self.name = name
        self.format = SceneFormat("DemensDeum Digital Mage Uprising Scene File", "1.0.0.0")
        self.physicsEnabled = physics_enabled
        self.objects = dict()
        self.commands = dict()
        change_date = int(datetime.now().timestamp())
        skyboxSceneObject = SceneObject(
            "Skybox",
            "Skybox",
            SceneObjectTexture(skybox_texture_name),
            SceneObjectModel("NONE"),
            Vector3(0, 0, 0),
            Vector3(0, 0, 0),
            False,
            SceneObjectControls("NONE", "NONE"),
            change_date
        )
        self.objects["Skybox"] = skyboxSceneObject
        
    def addCommandFromNode(self, command):
        export_name = command.name.split("_")[1]
        self.commands[export_name] = Command.fromNode(node)
        
    def addSceneObjectFromNode(self, object):
        export_name = object.name.split("_")[1]
        self.objects[export_name] = SceneObject.fromNode(node)

class SceneEncoder(JSONEncoder):
        def default(self, o):
            return o.__dict__

name = "Hi-Tech Town"
skybox = "com.demensdeum.blue.field"
scene_filename = "com.demensdeum.hitech.town"        
physics_enabled = False

directory = os.path.dirname(os.path.dirname(bpy.data.filepath))

scene_file_suffix = "scene"
scene_file_extension = "json"

scene_filepath = f"{directory}{os.sep}{scene_filename}.{scene_file_suffix}.{scene_file_extension}"

print(f"directory: {directory}")
print(f"scene_filepath: {scene_filepath}")

scene = Scene(name, skybox, physics_enabled)

blender_scene = bpy.context.scene

debugC = blender_scene.collection
print(f"debugC: {debugC}")

blender_scene_objects_collection = next(c for c in blender_scene.collection.children if c.name == "SceneObjects")
blender_scene_commands_collection = next(c for c in blender_scene.collection.children if c.name == "Commands")

scene_file = open(scene_filepath, "w")

for node in blender_scene_objects_collection.all_objects:
    print(node.name)
    print(node.location)
    print(node.rotation_euler)
    
    scene.addSceneObjectFromNode(node)

for node in blender_scene_commands_collection.all_objects:
    print(node.name)
    print(node.location)
    print(node.rotation_euler)
    
    scene.addCommandFromNode(node)


scene_file.write(json.dumps(scene, indent = 4, cls = SceneEncoder))

print(scene_filepath)
print(blender_scene_objects_collection.name)

scene_file.close()