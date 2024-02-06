import bpy
import random

# Очистка сцены от предыдущих объектов
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Параметры лабиринта
width = 10  # Ширина лабиринта
height = 10  # Высота лабиринта
cell_size = 2  # Размер каждой ячейки

# Импорт текстуры
texture_path = "../com.demensdeum.floor.texture.png"  # Укажите путь к вашей текстуре
texture = bpy.data.images.load(texture_path)

# Функция для создания плоского объекта (плейна) с текстурой
def create_plane_with_texture(x, y):
    bpy.ops.mesh.primitive_plane_add(size=cell_size, enter_editmode=False, location=(x*cell_size, y*cell_size, 0))
    plane = bpy.context.object

    # Установка текстуры
    mat = bpy.data.materials.new(name="Texture Material")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    # Создание текстурного узла
    texture_node = nodes.new(type='ShaderNodeTexImage')
    texture_node.image = texture
    
    # Создание узла координат для UV-карты
    uv_node = nodes.new(type='ShaderNodeUVMap')
    uv_node.uv_map = 'UVMap'
    
    # Соединение узлов
    links = mat.node_tree.links
    links.new(texture_node.outputs['Color'], nodes['Material Output'].inputs['Surface'])
    links.new(uv_node.outputs['UV'], texture_node.inputs['Vector'])
    
    # Применение материала к объекту
    if plane.data.materials:
        plane.data.materials[0] = mat
    else:
        plane.data.materials.append(mat)

# Генерация лабиринта с текстурой
for x in range(width):
    for y in range(height):
        create_plane_with_texture(x, y)

# Установка камеры и освещения
bpy.ops.object.camera_add(location=(width*cell_size/2, height*cell_size/2, 20), rotation=(0, 0, 0))
bpy.ops.object.light_add(type='POINT', location=(width*cell_size/2, height*cell_size/2, 10))

# Установка активной камеры
for obj in bpy.context.scene.objects:
    if obj.type == 'CAMERA':
        bpy.context.scene.camera = obj

# Установка рендеринга
bpy.context.scene.render.engine = 'CYCLES'
