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
SCALE = int(args[2]) if len(args) > 2 else 100  # resolution %, 200 for the site's 2x

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


def math_node(nodes, operation, a=None, b=None):
    node = nodes.new("ShaderNodeMath")
    node.operation = operation
    for i, value in enumerate((a, b)):
        if isinstance(value, (int, float)):
            node.inputs[i].default_value = value
    return node


def melanophores(nodes, links, v_socket):
    """Pigment cells: dark specks about 1 mm apart, isotropic on the fin's
    surface, varying in size, rarer near the base and denser toward the
    margin. Returns a 0..1 coverage socket."""
    coords = nodes.new("ShaderNodeTexCoord")
    cells = nodes.new("ShaderNodeTexVoronoi")
    cells.voronoi_dimensions = "3D"
    cells.inputs["Scale"].default_value = 0.8  # the scene is in mm
    links.new(coords.outputs["Object"], cells.inputs["Vector"])
    # Each cell's own random size, scaled up as the fin darkens outward.
    size = math_node(nodes, "MULTIPLY")
    links.new(cells.outputs["Color"], size.inputs[0])
    reach = nodes.new("ShaderNodeMapRange")
    reach.inputs["To Min"].default_value = 0.05
    reach.inputs["To Max"].default_value = 0.42
    links.new(v_socket, reach.inputs["Value"])
    links.new(reach.outputs["Result"], size.inputs[1])
    # Soft edge: full pigment well inside the radius, none outside it.
    inside = math_node(nodes, "SUBTRACT")
    links.new(size.outputs[0], inside.inputs[0])
    links.new(cells.outputs["Distance"], inside.inputs[1])
    soft = nodes.new("ShaderNodeMapRange")
    soft.inputs["From Min"].default_value = 0.0
    soft.inputs["From Max"].default_value = 0.06
    links.new(inside.outputs[0], soft.inputs["Value"])
    return soft.outputs["Result"]


def membrane_material():
    """Real pectoral colour, pigment pushed so it reads on the dark section:
    translucent and pale near the base, dusky and denser toward the margin.
    The dusk is made of melanophores, the surface carries fine collagen
    striations along the rays, and iridophores give a faint thin-film sheen."""
    # A single surface with a low IOR, not Thin Wall: Cycles counts Thin Wall
    # transmission as diffuse, so it never reaches the render's alpha and the
    # membrane comes out opaque on a transparent film.
    m = material("Membrane", (1, 1, 1), 0.08, transmission=0.95)
    nodes, links = m.node_tree.nodes, m.node_tree.links
    bsdf = nodes["Principled BSDF"]
    bsdf.inputs["IOR"].default_value = 1.1
    bsdf.inputs["Sheen Weight"].default_value = 0.15
    bsdf.inputs["Thin Film Thickness"].default_value = 320
    bsdf.inputs["Thin Film IOR"].default_value = 1.33

    v = nodes.new("ShaderNodeAttribute")
    v.attribute_name = "v"
    w = nodes.new("ShaderNodeAttribute")
    w.attribute_name = "w"
    ramp = nodes.new("ShaderNodeValToRGB")
    stops = ramp.color_ramp.elements
    stops[0].color = (0.88, 0.79, 0.74, 1)  # the pale, faintly fleshy base
    stops[1].position = 1.0
    stops[1].color = (0.09, 0.095, 0.10, 1)
    # The visible part of the fan sits between v 0.2 and 0.7, so the dusk starts early.
    for position, grey in ((0.3, 0.36), (0.7, 0.16)):
        stops.new(position).color = (grey, grey, grey * 1.04, 1)
    links.new(v.outputs["Fac"], ramp.inputs["Fac"])

    pigment = melanophores(nodes, links, v.outputs["Fac"])
    speckled = nodes.new("ShaderNodeMix")
    speckled.data_type = "RGBA"
    speckled.blend_type = "MIX"
    speckled.inputs["B"].default_value = (0.02, 0.018, 0.018, 1)
    links.new(pigment, speckled.inputs["Factor"])
    links.new(ramp.outputs["Color"], speckled.inputs["A"])
    links.new(speckled.outputs["Result"], bsdf.inputs["Base Color"])

    # Pigment also blocks light: clear near the base, denser toward the
    # margin, and each speck nearly opaque.
    # The base is fleshy and nearly opaque, the membrane clears right after
    # it, then darkens toward the margin.
    density = nodes.new("ShaderNodeValToRGB")
    clear = density.color_ramp.elements
    clear[0].color = (0.45, 0.45, 0.45, 1)
    clear[1].position = 1.0
    clear[1].color = (0.5, 0.5, 0.5, 1)
    for position, value in ((0.14, 0.88), (0.35, 0.9)):
        clear.new(position).color = (value, value, value, 1)
    links.new(v.outputs["Fac"], density.inputs["Fac"])
    blocked = math_node(nodes, "MULTIPLY", None, 0.6)
    links.new(pigment, blocked.inputs[0])
    transmission = math_node(nodes, "SUBTRACT")
    links.new(density.outputs["Color"], transmission.inputs[0])
    links.new(blocked.outputs[0], transmission.inputs[1])
    links.new(transmission.outputs[0], bsdf.inputs["Transmission Weight"])

    # Collagen striations running with the rays: a fine ridge every few
    # tenths of a millimetre across the fan, felt only in the highlights.
    across = math_node(nodes, "MULTIPLY", None, 2 * math.pi * 900)
    links.new(w.outputs["Fac"], across.inputs[0])
    ridges = math_node(nodes, "SINE")
    links.new(across.outputs[0], ridges.inputs[0])
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.08
    bump.inputs["Distance"].default_value = 0.02
    links.new(ridges.outputs[0], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return m


def ray_material():
    """Glassy bone: denser than the membrane, so slightly darker, with a lit
    rim and the same faint iridophore sheen."""
    m = material("Ray", (0.62, 0.60, 0.58), 0.06, transmission=0.8)
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["IOR"].default_value = 1.45
    bsdf.inputs["Coat Weight"].default_value = 0.5
    bsdf.inputs["Thin Film Thickness"].default_value = 320
    bsdf.inputs["Thin Film IOR"].default_value = 1.33
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


SAMPLES_T = 400
BRANCH_T = (0.55, 0.78)  # where the rays fork, then fork again
BRANCH_SPREAD = 0.2  # how much of t a fork takes to open
JOINTS = 75  # segment joints along the distal part, about 4 mm apart
MEMBRANE_END = 0.975  # the membrane stops short of the ray tips
FIBRES = 3  # actinotrichia past each tip


def smoothstep(edge0, edge1, x):
    f = min(max((x - edge0) / (edge1 - edge0), 0.0), 1.0)
    return f * f * (3 - 2 * f)


def jitter(n):
    """A stable pseudo-random number in 0..1 for an integer."""
    return math.modf(math.sin(n * 12.9898) * 43758.5453)[0] % 1.0


def fan_normal(w, t, eps=1e-3):
    a = ray_point(min(w + eps, 1), t) - ray_point(max(w - eps, 0), t)
    b = ray_point(w, min(t + eps, 1)) - ray_point(w, max(t - eps, 0))
    return a.cross(b).normalized()


def build_membrane(material):
    """The membrane, ending in a scallop between the ray tips and bowing into
    small pleats between the rays where they crowd together near the base."""
    dw = 1 / (RAYS - 1)
    columns = (RAYS - 1) * 24 + 1  # six columns between neighbouring tips, so the scallops round
    verts, faces, ws, vs = [], [], [], []
    for c in range(columns):
        w = c / (columns - 1)
        # The finest tips sit on a grid dw/4 apart, offset by dw/8.
        notch = math.cos(math.pi * w / (dw / 4)) ** 2  # round scallops, not teeth
        end = MEMBRANE_END - (0.008 + 0.01 * jitter(c)) * notch
        pleat_between = abs(math.sin(math.pi * w / dw))
        for k in range(SAMPLES_T):
            t = end * k / (SAMPLES_T - 1)
            p = ray_point(w, t)
            pleat = 0.7 * (1 - smoothstep(0.1, 0.3, t)) * pleat_between
            if pleat > 1e-4:
                p = p + fan_normal(w, t) * pleat
            verts.append(p)
            ws.append(w)
            vs.append(t)
    for c in range(columns - 1):
        for k in range(SAMPLES_T - 1):
            a = c * SAMPLES_T + k
            b = (c + 1) * SAMPLES_T + k
            faces.append((a, a + 1, b + 1, b))
    mesh = bpy.data.meshes.new("Membrane")
    mesh.from_pydata([tuple(v) for v in verts], [], faces)
    mesh.shade_smooth()
    # The fan parameters for the shader: w across the rays, v along them.
    for name, values in (("w", ws), ("v", vs)):
        attribute = mesh.attributes.new(name, "FLOAT", "POINT")
        attribute.data.foreach_set("value", values)
    obj = bpy.data.objects.new("Membrane", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)


def add_strand(curve, w_of_t, t0, t1, radius_of_t):
    steps = max(int((t1 - t0) * SAMPLES_T), 2)
    spline = curve.splines.new("POLY")
    spline.points.add(steps)
    for k, point in enumerate(spline.points):
        t = t0 + (t1 - t0) * k / steps
        point.co = (*ray_point(w_of_t(t), t), 1)
        point.radius = radius_of_t(t)


def build_rays(material):
    """Lepidotrichia: smooth and stiff at the base, jointed and tapering
    distally, forking twice (all but the leading ray), each tip a little
    longer or shorter than its neighbour, with a fringe of fibres past it."""
    dw = 1 / (RAYS - 1)
    rays = bpy.data.curves.new("Rays", "CURVE")
    rays.dimensions = "3D"
    rays.bevel_depth = 0.6
    rays.bevel_resolution = 3
    fibres = bpy.data.curves.new("Fibres", "CURVE")
    fibres.dimensions = "3D"
    fibres.bevel_depth = 0.06
    fibres.bevel_resolution = 1

    def radius(t, level):
        taper = lerp(0.85, 0.42, t) * (1.0, 0.85, 0.72)[level]
        if t > 0.45:  # a joint narrows the ray a little every few mm
            phase = math.modf(t * JOINTS)[0] - 0.5
            taper *= 1 - 0.22 * math.exp(-((phase / 0.07) ** 2))
        return taper

    def opening(t, at):
        return smoothstep(at, at + BRANCH_SPREAD * (1 - at), t)

    tip = 0
    for i in range(RAYS):
        w0 = i / (RAYS - 1)
        if i == 0:  # the leading ray is unbranched
            end = 1 - 0.02 * jitter(tip)
            add_strand(rays, lambda t, w0=w0: w0, 0, end, lambda t: radius(t, 0))
            tips = [(lambda t, w0=w0: w0, end, 0)]
            tip += 1
        else:
            add_strand(rays, lambda t, w0=w0: w0, 0, BRANCH_T[0], lambda t: radius(t, 0))
            tips = []
            for side in (-1, 1):
                w1 = lambda t, w0=w0, side=side: min(w0 + side * dw / 4 * opening(t, BRANCH_T[0]), 1)
                add_strand(rays, w1, BRANCH_T[0], BRANCH_T[1], lambda t: radius(t, 1))
                for side2 in (-1, 1):
                    w2 = lambda t, w1=w1, side2=side2: min(w1(t) + side2 * dw / 8 * opening(t, BRANCH_T[1]), 1)
                    end = 1 - 0.035 * jitter(tip)
                    add_strand(rays, w2, BRANCH_T[1], end, lambda t: radius(t, 2))
                    tips.append((w2, end, 2))
                    tip += 1
        # Actinotrichia: hair-fine fibres fanning a touch past each tip.
        for w_tip, end, _ in tips:
            for f in range(FIBRES):
                spread = (f - (FIBRES - 1) / 2) * dw / 60
                add_strand(
                    fibres,
                    lambda t, w_tip=w_tip, spread=spread, end=end: min(max(w_tip(t) + spread * smoothstep(end - 0.05, end, t), 0), 1),
                    end - 0.05,
                    min(end + 0.012, 1),
                    lambda t: 1.0,
                )
    for curve in (rays, fibres):
        obj = bpy.data.objects.new(curve.name, curve)
        bpy.context.collection.objects.link(obj)
        obj.data.materials.append(material)
    print(f"FIN rays: {tip} tips")


def build_fin(membrane_mat, ray_mat):
    build_membrane(membrane_mat)
    build_rays(ray_mat)


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
    scene.render.resolution_percentage = SCALE
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
        ("Key", (-300, -500, 350), 4.5e6, 400),
        ("Rim", (150, 600, 50), 1.4e7, 400),
    ):
        light = bpy.data.lights.new(name, "AREA")
        light.energy = energy
        light.size = size
        obj = bpy.data.objects.new(name, light)
        bpy.context.collection.objects.link(obj)
        obj.location = location
        aim(obj, Vector((-60, 0, -20)))
        # Light the fin without showing the lamp itself through the membrane;
        # its reflections stay, they are the glassy highlights.
        obj.visible_camera = False
        obj.visible_transmission = False


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
bpy.context.scene.render.filepath = f"{OUT_DIR}/fin-{BACKGROUND}-{SCALE}.png"
bpy.ops.render.render(write_still=True)
