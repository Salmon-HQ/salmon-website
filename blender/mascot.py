"""
Salmon mascot (the logo's head, eyes and side fins) as a soft 3D figure, rendered headless.

    /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P blender/mascot.py -- <out_file> [size px] [samples]

Built from public/images/logo.svg: the head outline is filled and given a deep rounded bevel so it reads as a
moulded toy; the eye holes keep their shape and hold dark glossy inserts; the fins are thinner and swept back.
White-cream plastic, lit warm from behind so it sits on the site's orange Coming soon card. Transparent background.
"""

import math
import sys

import bpy
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
OUT = args[0] if args else "/tmp/mascot.png"
SIZE = int(args[1]) if len(args) > 1 else 1200
SAMPLES = int(args[2]) if len(args) > 2 else 128
SVG = __file__.rsplit("/blender/", 1)[0] + "/public/images/logo.svg"

TURN = math.radians(-20)  # three-quarter turn, so the bevel and depth read
TILT = math.radians(6)  # seen slightly from below


def material(name, color, roughness, subsurface=0.0, coat=0.0):
    m = bpy.data.materials.new(name)
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Subsurface Weight"].default_value = subsurface
    bsdf.inputs["Subsurface Radius"].default_value = (1.0, 0.45, 0.3)
    bsdf.inputs["Subsurface Scale"].default_value = 2.0
    bsdf.inputs["Coat Weight"].default_value = coat
    bsdf.inputs["Coat Roughness"].default_value = 0.2
    return m


def shape(obj, extrude, bevel, mat, resolution=12):
    obj.data.dimensions = "2D"
    obj.data.fill_mode = "BOTH"
    obj.data.extrude = extrude
    obj.data.bevel_depth = bevel
    obj.data.bevel_resolution = resolution
    obj.data.resolution_u = 48
    obj.data.materials.clear()
    obj.data.materials.append(mat)


def inflate(obj, iterations, dome=0.0):
    bpy.context.view_layer.objects.active = obj
    for o in bpy.context.selected_objects:
        o.select_set(False)
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    remesh = obj.modifiers.new("Remesh", "REMESH")
    remesh.mode = "VOXEL"
    remesh.voxel_size = 0.7
    smooth = obj.modifiers.new("Smooth", "LAPLACIANSMOOTH")
    smooth.iterations = iterations
    smooth.lambda_factor = 2.0
    smooth.use_volume_preserve = True
    smooth.use_normalized = True
    if dome:
        cast = obj.modifiers.new("Dome", "CAST")
        cast.cast_type = "SPHERE"
        cast.factor = dome
        cast.use_x = cast.use_y = False  # bulge the face and back only, keep the outline
    obj.modifiers.new("Subsurf", "SUBSURF").levels = 1
    bpy.ops.object.shade_smooth()


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_curve.svg(filepath=SVG)
    head, fin_a, fin_b = sorted((o for o in bpy.data.objects if o.type == "CURVE"), key=lambda o: -len(o.data.splines))

    # Work in units where the head is 100 wide; the importer brings the 138 px icon in at metres/1000.
    scale = 100 / head.dimensions.x
    plastic = material("Plastic", (0.96, 0.93, 0.9), 0.32, subsurface=0.15, coat=0.35)
    ink = material("Eye", (0.012, 0.014, 0.022), 0.12, coat=1.0)

    # Eyes: a copy of the head keeps only the two eye splines, filled as dark inserts set back in the holes.
    eyes = head.copy()
    eyes.data = head.data.copy()
    bpy.context.collection.objects.link(eyes)
    assert len(head.data.splines[0].bezier_points) > 7, "spline 0 should be the head outline"
    eyes.data.splines.remove(eyes.data.splines[0])
    # The head is solid: the eyes sit on its face instead of in holes the rounding would close.
    while len(head.data.splines) > 1:
        head.data.splines.remove(head.data.splines[1])

    for obj in (head, fin_a, fin_b, eyes):
        obj.scale = (scale, scale, scale)
    bpy.context.view_layer.update()

    # Curve extrude/bevel are in local units, so divide by the scale.
    shape(head, 11 / scale, 1.5 / scale, plastic, 4)
    shape(eyes, 0, 0, ink)
    shape(fin_a, 4 / scale, 1.5 / scale, plastic, 4)
    shape(fin_b, 4 / scale, 1.5 / scale, plastic, 4)
    # Inflate: voxel-remesh the moulded blocks, then relax them so every edge rounds like a soft toy.
    for obj, iterations, dome in ((head, 40, 0.35), (fin_a, 14, 0.2), (fin_b, 14, 0.2)):
        inflate(obj, iterations, dome)

    # Centre everything on the head and stand it up facing the camera (-Y).
    bpy.context.view_layer.update()
    centre = sum((Vector(c) for c in head.bound_box), Vector()) / 8
    centre = head.matrix_world @ centre
    root = bpy.data.objects.new("Root", None)
    bpy.context.collection.objects.link(root)
    for obj in (head, fin_a, fin_b, eyes):
        obj.location -= centre
        obj.parent = root
    # The eyes are flat shapes projected onto the domed face, then given a little thickness: glossy inserts.
    eyes.location.z += 40
    bpy.context.view_layer.objects.active = eyes
    for o in bpy.context.selected_objects:
        o.select_set(False)
    eyes.select_set(True)
    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.subdivide(number_cuts=12)
    bpy.ops.object.mode_set(mode="OBJECT")
    wrap = eyes.modifiers.new("Wrap", "SHRINKWRAP")
    wrap.target = head
    wrap.wrap_method = "PROJECT"
    wrap.use_project_z = True
    wrap.use_negative_direction = True
    wrap.use_positive_direction = False
    wrap.offset = 0.15
    solid = eyes.modifiers.new("Solid", "SOLIDIFY")
    solid.thickness = 1.2
    solid.offset = 1
    eyes.modifiers.new("Subsurf", "SUBSURF").levels = 2
    bpy.ops.object.shade_smooth()
    # Fins sweep back from the head's sides.
    for fin in (fin_a, fin_b):
        bpy.context.view_layer.update()
        fc = fin.matrix_world @ (sum((Vector(c) for c in fin.bound_box), Vector()) / 8)
        side = 1 if fc.x > 0 else -1
        fin.rotation_euler.y = side * math.radians(16)
        fin.location.z -= 4
    root.rotation_euler = (math.radians(90) + TILT, 0, TURN)

    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "GPU"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for device in prefs.devices:
        device.use = True
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    scene.render.resolution_x = scene.render.resolution_y = SIZE
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.exposure = 0.7

    world = bpy.data.worlds.new("World")
    scene.world = world
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (1.0, 0.72, 0.62, 1)  # the orange card's bounce
    bg.inputs["Strength"].default_value = 0.35

    cam_data = bpy.data.cameras.new("Camera")
    cam_data.lens = 85
    camera = bpy.data.objects.new("Camera", cam_data)
    bpy.context.collection.objects.link(camera)
    camera.location = (0, -520, 0)
    camera.rotation_euler = (math.radians(90), 0, 0)
    scene.camera = camera

    for name, loc, energy, size, color in (
        ("Key", (-260, -320, 260), 2.6e6, 220, (1.0, 0.97, 0.93)),
        ("Fill", (300, -260, -60), 6e5, 300, (1.0, 0.9, 0.85)),
        ("Rim", (180, 320, 200), 3.2e6, 200, (1.0, 0.55, 0.4)),
    ):
        light = bpy.data.lights.new(name, "AREA")
        light.energy, light.size, light.color = energy, size, color
        obj = bpy.data.objects.new(name, light)
        bpy.context.collection.objects.link(obj)
        obj.location = loc
        direction = Vector((0, 0, 0)) - obj.location
        obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


build()
bpy.context.scene.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print("WROTE", OUT)
