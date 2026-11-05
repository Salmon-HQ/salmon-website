"""
Salmon fin wrapped around the phone, built and rendered headless.

    /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P blender/fin.py -- <out_dir> [white|section]

Units are millimetres. The phone stands in the XZ plane (X right, Z up) with
its screen facing -Y, toward the camera. Each ray is a curve of the fan
parameter w (0 = leading ray, on top; 1 = trailing ray, at the bottom) and
the path parameter t (0 = base on the screen, 1 = margin); the membrane is
the same function sampled between rays, so the two cannot drift apart.
See docs/fin-preproduction.md.
"""

import math
import sys

import bpy
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
OUT_DIR = args[0] if args else "/tmp"
BACKGROUND = args[1] if len(args) > 1 else "white"

# The phone: the site's CSS phone (screen 240x510 px plus a 14.7 px bezel at a
# 1440 px viewport) at 77 mm wide.
PHONE_W, PHONE_H, PHONE_T = 77.0, 154.0, 8.0
CORNER = 11.4
EDGE_X = PHONE_W / 2
WRAP_R = PHONE_T / 2 + 1.0  # half the thickness plus clearance

# The concept image's frame, 1280x1066 px, with its phone mapped onto ours:
# the phone spans px 504-776 x 215-765 there.
FRAME_PX = (1280, 1066)
MM_PER_PX = PHONE_W / 272
PHONE_CENTRE_PX = (640, 490)


def from_px(x, y):
    """A point of the concept image as (x, z) on the phone's plane."""
    return ((x - PHONE_CENTRE_PX[0]) * MM_PER_PX, (PHONE_CENTRE_PX[1] - y) * MM_PER_PX)


RAYS = 15
T_SCREEN, T_WRAP = 0.08, 0.2  # where each ray leaves the screen and finishes the wrap

# Measured on the concept image (px), converted with from_px. The base sits on
# the screen; the rays cross the screen's edge in a narrow band, then spread
# while they wrap, bulging past the phone's side, and fan out behind it.
BASE = Vector((*from_px(700, 470),))
BASE = Vector((BASE.x, -WRAP_R, BASE.y))
FRONT_Z = (from_px(0, 395)[1], from_px(0, 560)[1])  # leading, trailing ray at the screen's edge
BACK_Z = (from_px(0, 360)[1], from_px(0, 720)[1])  # the same rays on the phone's back
BULGE = 20.0  # how far the wrap stands out past the phone's side, mid-fan
# Behind the phone: the leading ray's path (the fan's visible top edge), the
# trailing ray's, and the margin they span. Points are concept px.
LEADING_PX = [(776, 360), (640, 400), (504, 440), (400, 541), (240, 667), (0, 783), (-200, 930)]
TRAILING_PX = [(776, 720), (774, 726), (772, 732), (770, 740), (768, 748), (766, 756), (764, 765)]
MARGIN_PX = [(-200, 930), (30, 1080), (280, 1045), (480, 1000), (640, 945), (680, 896), (720, 790), (764, 765)]
PEEL = 18.0  # how far the margin lifts away from the phone's back
CONE_LIFT = 5.0  # how high the fan rises off the screen before the edge


def xz(points):
    return [Vector((x, 0.0, z)) for x, z in (from_px(*p) for p in points)]


LEADING, TRAILING, MARGIN = xz(LEADING_PX), xz(TRAILING_PX), xz(MARGIN_PX)


def lerp(a, b, f):
    return a + (b - a) * f


def catmull_rom(points, f):
    """A smooth curve through the points, f in 0..1."""
    n = len(points) - 1
    i = min(int(f * n), n - 1)
    local = f * n - i
    p0 = points[max(i - 1, 0)]
    p1, p2 = points[i], points[i + 1]
    p3 = points[min(i + 2, n)]
    t2, t3 = local * local, local * local * local
    return 0.5 * (
        (2 * p1)
        + (-p0 + p2) * local
        + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2
        + (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    )


def ray_point(w, t):
    front_z = lerp(FRONT_Z[0], FRONT_Z[1], w)
    back_z = lerp(BACK_Z[0], BACK_Z[1], w)
    if t <= T_SCREEN:
        s = t / T_SCREEN
        p = BASE.lerp(Vector((EDGE_X, -WRAP_R, front_z)), s)
        # The fan rolls up into a cone off the screen, highest in its middle.
        p.y -= CONE_LIFT * math.sin(math.pi * w) * 4 * s * (1 - s)
        return p
    if t <= T_WRAP:
        phi = math.pi * (t - T_SCREEN) / (T_WRAP - T_SCREEN)
        reach = WRAP_R + BULGE * math.sin(math.pi * w)
        z = lerp(front_z, back_z, (1 - math.cos(phi)) / 2)
        return Vector((EDGE_X + reach * math.sin(phi), -WRAP_R * math.cos(phi), z))
    s = (t - T_WRAP) / (1 - T_WRAP)
    # Blend the leading and trailing paths, then bend the blend so it ends on
    # the margin: the margin bulges past the straight line between their tips.
    blend = [a.lerp(b, w) for a, b in zip(LEADING, TRAILING)]
    miss = catmull_rom(MARGIN, w) - blend[-1]
    n = len(blend) - 1
    path = [p + miss * (k / n) ** 1.5 for k, p in enumerate(blend)]
    p = catmull_rom(path, s)
    p.y = WRAP_R + PEEL * s**1.5
    return p


def material(name, color, roughness=0.5, transmission=0.0, thin=False):
    m = bpy.data.materials.new(name)
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Transmission Weight"].default_value = transmission
    bsdf.inputs["Thin Wall"].default_value = thin
    return m


def membrane_material():
    """Real pectoral colour: translucent and pale near the base, dusky toward
    the margin, the pigment gathering along the rays first."""
    # A single surface with a low IOR, not Thin Wall: Cycles counts Thin Wall
    # transmission as diffuse, so it never reaches the render's alpha and the
    # membrane comes out opaque on a transparent film.
    m = material("Membrane", (1, 1, 1), 0.08, transmission=0.95)
    nodes, links = m.node_tree.nodes, m.node_tree.links
    bsdf = nodes["Principled BSDF"]
    bsdf.inputs["IOR"].default_value = 1.1
    bsdf.inputs["Sheen Weight"].default_value = 0.15

    v = nodes.new("ShaderNodeAttribute")
    v.attribute_name = "v"
    w = nodes.new("ShaderNodeAttribute")
    w.attribute_name = "w"
    ramp = nodes.new("ShaderNodeValToRGB")
    stops = ramp.color_ramp.elements
    stops[0].color = (0.86, 0.80, 0.74, 1)
    stops[1].position = 1.0
    stops[1].color = (0.16, 0.17, 0.19, 1)
    middle = stops.new(0.55)
    middle.color = (0.52, 0.51, 0.51, 1)
    links.new(v.outputs["Fac"], ramp.inputs["Fac"])

    # Distance to the nearest ray: 0 on a ray, 1 halfway between two.
    near_ray = nodes.new("ShaderNodeMath")
    near_ray.operation = "MULTIPLY"
    near_ray.inputs[1].default_value = math.pi * (RAYS - 1)
    links.new(w.outputs["Fac"], near_ray.inputs[0])
    sine = nodes.new("ShaderNodeMath")
    sine.operation = "SINE"
    links.new(near_ray.outputs[0], sine.inputs[0])
    between = nodes.new("ShaderNodeMath")
    between.operation = "ABSOLUTE"
    links.new(sine.outputs[0], between.inputs[0])
    on_ray = nodes.new("ShaderNodeMath")
    on_ray.operation = "SUBTRACT"
    on_ray.inputs[0].default_value = 1.0
    links.new(between.outputs[0], on_ray.inputs[1])
    # Only a thin line beside each ray carries pigment.
    thin_line = nodes.new("ShaderNodeMath")
    thin_line.operation = "POWER"
    thin_line.inputs[1].default_value = 8.0
    links.new(on_ray.outputs[0], thin_line.inputs[0])
    on_ray = thin_line
    # Pigment = closeness to a ray x how far out along it.
    pigment = nodes.new("ShaderNodeMath")
    pigment.operation = "MULTIPLY"
    links.new(on_ray.outputs[0], pigment.inputs[0])
    links.new(v.outputs["Fac"], pigment.inputs[1])
    mix = nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    links.new(pigment.outputs[0], mix.inputs["Factor"])
    links.new(ramp.outputs["Color"], mix.inputs["A"])
    mix.inputs["B"].default_value = (0.35, 0.33, 0.33, 1)
    links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
    return m


def ray_material():
    """Glassy bone: denser than the membrane, so slightly darker, with a lit rim."""
    m = material("Ray", (0.42, 0.40, 0.39), 0.12, transmission=0.55)
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["IOR"].default_value = 1.45
    bsdf.inputs["Coat Weight"].default_value = 0.4
    return m


def build_phone():
    bpy.ops.mesh.primitive_cube_add(size=1)
    body = bpy.context.object
    body.name = "Phone"
    body.scale = (PHONE_W, PHONE_T, PHONE_H)
    bpy.ops.object.transform_apply(scale=True)
    # Round only the four edges that run through the thickness (along Y).
    weights = body.data.attributes.new("bevel_weight_edge", "FLOAT", "EDGE")
    for edge in body.data.edges:
        a, b = (body.data.vertices[i].co for i in edge.vertices)
        weights.data[edge.index].value = 1.0 if abs(a.x - b.x) < 1e-6 and abs(a.z - b.z) < 1e-6 else 0.0
    bevel = body.modifiers.new("Corners", "BEVEL")
    bevel.limit_method = "WEIGHT"
    bevel.width = CORNER
    bevel.segments = 12
    body.data.materials.append(material("PhoneBody", (0.012, 0.014, 0.02), 0.35))

    bpy.ops.mesh.primitive_plane_add(size=1)
    screen = bpy.context.object
    screen.name = "Screen"
    screen.rotation_euler = (math.radians(90), 0, 0)
    screen.scale = (PHONE_W - 7.4, PHONE_H - 7.4, 1)
    screen.location = (0, -PHONE_T / 2 - 0.05, 0)
    screen.data.materials.append(material("Screen", (0.01, 0.012, 0.018), 0.15))


def build_fin(membrane_mat, ray_mat):
    samples_t = 160
    columns = (RAYS - 1) * 4 + 1
    verts, faces = [], []
    for c in range(columns):
        w = c / (columns - 1)
        for k in range(samples_t):
            verts.append(ray_point(w, k / (samples_t - 1)))
    for c in range(columns - 1):
        for k in range(samples_t - 1):
            a = c * samples_t + k
            b = (c + 1) * samples_t + k
            faces.append((a, a + 1, b + 1, b))
    mesh = bpy.data.meshes.new("Membrane")
    mesh.from_pydata([tuple(v) for v in verts], [], faces)
    mesh.shade_smooth()
    # The fan parameters for the shader: w across the rays, v along them.
    for name, value in (("w", lambda i: (i // samples_t) / (columns - 1)), ("v", lambda i: (i % samples_t) / (samples_t - 1))):
        attribute = mesh.attributes.new(name, "FLOAT", "POINT")
        attribute.data.foreach_set("value", [value(i) for i in range(len(verts))])
    membrane = bpy.data.objects.new("Membrane", mesh)
    bpy.context.collection.objects.link(membrane)
    membrane.data.materials.append(membrane_mat)

    curve = bpy.data.curves.new("Rays", "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = 0.55
    curve.bevel_resolution = 3
    for i in range(RAYS):
        w = i / (RAYS - 1)
        spline = curve.splines.new("POLY")
        spline.points.add(samples_t - 1)
        for k, point in enumerate(spline.points):
            t = k / (samples_t - 1)
            point.co = (*ray_point(w, t), 1)
            point.radius = lerp(1.6, 0.25, t)
    rays = bpy.data.objects.new("Rays", curve)
    bpy.context.collection.objects.link(rays)
    rays.data.materials.append(ray_mat)


def aim(obj, target=Vector((0, 0, 0))):
    obj.rotation_euler = (target - obj.location).to_track_quat("-Z", "Y").to_euler()


def build_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "GPU"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for device in prefs.devices:
        device.use = True
    scene.cycles.samples = 256
    scene.cycles.transmission_bounces = 16
    scene.cycles.transparent_max_bounces = 24
    scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y = FRAME_PX
    scene.render.image_settings.media_type = "IMAGE"
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = True
    scene.cycles.film_transparent_glass = True
    scene.cycles.film_transparent_roughness = 0.3

    world = bpy.data.worlds.new("World")
    scene.world = world
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (1, 1, 1, 1) if BACKGROUND == "white" else (0.05, 0.035, 0.05, 1)
    bg.inputs["Strength"].default_value = 1.0 if BACKGROUND == "white" else 0.6

    build_phone()
    build_fin(membrane_material(), ray_material())

    # The camera frames exactly the concept image, so the two overlay.
    centre_x, centre_z = from_px(FRAME_PX[0] / 2, FRAME_PX[1] / 2)
    frame_w = FRAME_PX[0] * MM_PER_PX
    lens = 100.0
    distance = frame_w * lens / 36.0
    cam_data = bpy.data.cameras.new("Camera")
    cam_data.lens = lens
    cam_data.sensor_fit = "HORIZONTAL"
    cam_data.clip_end = distance * 4
    camera = bpy.data.objects.new("Camera", cam_data)
    bpy.context.collection.objects.link(camera)
    camera.location = (centre_x, -distance, centre_z)
    camera.rotation_euler = (math.radians(90), 0, 0)
    scene.camera = camera

    for name, location, energy, size in (
        ("Key", (-300, -500, 350), 9e6, 400),
        ("Rim", (150, 600, 50), 1.4e7, 400),
        ("Fill", (400, -400, -200), 2.5e6, 500),
    ):
        light = bpy.data.lights.new(name, "AREA")
        light.energy = energy
        light.size = size
        obj = bpy.data.objects.new(name, light)
        bpy.context.collection.objects.link(obj)
        obj.location = location
        aim(obj, Vector((-60, 0, -20)))


def count_inside_phone(samples=200):
    """Fin points inside the phone's box: anything above 0 is a collision."""
    inside = 0
    for i in range(samples):
        for k in range(samples):
            p = ray_point(i / (samples - 1), k / (samples - 1))
            inside += abs(p.x) < EDGE_X and abs(p.y) < PHONE_T / 2 and abs(p.z) < PHONE_H / 2
    return inside


print(f"FIN CHECK points inside the phone: {count_inside_phone()}")
build_scene()
bpy.context.scene.render.filepath = f"{OUT_DIR}/fin-{BACKGROUND}.png"
bpy.ops.render.render(write_still=True)
