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


def build_fin(fin_material):
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
    membrane = bpy.data.objects.new("Membrane", mesh)
    bpy.context.collection.objects.link(membrane)
    membrane.data.materials.append(fin_material)

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
    rays.data.materials.append(fin_material)


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
    scene.cycles.samples = 96
    scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y = FRAME_PX
    scene.render.image_settings.media_type = "IMAGE"
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = True
    scene.cycles.film_transparent_glass = True

    world = bpy.data.worlds.new("World")
    scene.world = world
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (1, 1, 1, 1) if BACKGROUND == "white" else (0.05, 0.035, 0.05, 1)
    bg.inputs["Strength"].default_value = 1.0 if BACKGROUND == "white" else 0.6

    build_phone()
    build_fin(material("Clay", (0.72, 0.72, 0.72), 0.55))

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
        ("Rim", (250, 450, 200), 6e6, 300),
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
bpy.context.scene.render.filepath = f"{OUT_DIR}/fin-stage1-{BACKGROUND}.png"
bpy.ops.render.render(write_still=True)
