#!/usr/bin/env python3
"""Generate MicLoop app icons — microphone design on dark background."""

import os
from PIL import Image, ImageDraw, ImageFilter

ASSETS = os.path.join(os.path.dirname(__file__), "..", "assets", "images")

BG_TOP = (8, 12, 26)
BG_BOT = (0, 0, 0)
ACCENT = (10, 132, 255)
WHITE  = (255, 255, 255)


def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def draw_bg(draw, w, h):
    for y in range(h):
        draw.line([(0, y), (w, y)], fill=lerp_color(BG_TOP, BG_BOT, y / h))


def add_glow(img, cx, cy, r, blur):
    g = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse(
        [(cx - r, cy - r), (cx + r, cy + r)], fill=(*ACCENT, 45)
    )
    img.alpha_composite(g.filter(ImageFilter.GaussianBlur(blur)))


def draw_mic_full(draw, img, cx, cy_cap, s):
    """
    cx     : horizontal centre
    cy_cap : centre of the capsule body
    s      : reference side (1024 for the full icon)
    """
    k = s / 1024

    # ── Capsule — tall pill: 260 wide, 500 tall, radius=130 ──────
    cw  = int(130 * k)   # half-width
    cht = int(250 * k)   # half-height
    cap_x0, cap_y0 = cx - cw, cy_cap - cht
    cap_x1, cap_y1 = cx + cw, cy_cap + cht

    draw.rounded_rectangle(
        [(cap_x0, cap_y0), (cap_x1, cap_y1)],
        radius=cw, fill=WHITE,
    )

    # ── Grille lines — 5 lines in upper ~55 % of capsule ─────────
    gl_top   = cap_y0 + int(60 * k)
    gl_bot   = cy_cap + int(40 * k)
    n        = 5
    step     = (gl_bot - gl_top) // (n + 1)
    lh       = max(2, int(9 * k))
    inset    = int(16 * k)
    alphas   = [90, 160, 200, 160, 90]

    for i in range(n):
        ly = gl_top + (i + 1) * step
        draw.rectangle(
            [(cap_x0 + inset, ly), (cap_x1 - inset, ly + lh)],
            fill=(*ACCENT, alphas[i]),
        )

    # ── Stand pillar ──────────────────────────────────────────────
    sw       = int(20 * k)
    sil_top  = cap_y1
    sil_bot  = cap_y1 + int(170 * k)
    draw.rectangle(
        [(cx - sw // 2, sil_top), (cx + sw // 2, sil_bot)],
        fill=WHITE,
    )

    # ── Curved stand arm ─────────────────────────────────────────
    arc_r = int(160 * k)
    arc_w = int(22 * k)
    draw.arc(
        [(cx - arc_r, sil_top - arc_r), (cx + arc_r, sil_top + arc_r)],
        start=218, end=322,
        fill=WHITE, width=arc_w,
    )

    # ── Base bar ─────────────────────────────────────────────────
    bw = int(220 * k)
    bh = int(26 * k)
    draw.rounded_rectangle(
        [(cx - bw, sil_bot), (cx + bw, sil_bot + bh)],
        radius=int(13 * k), fill=WHITE,
    )

    # ── Sound waves (left & right, centred at capsule centre) ────
    wave_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    wd = ImageDraw.Draw(wave_layer)
    radii  = [int(200 * k), int(270 * k), int(340 * k)]
    alphas_w = [130, 80, 45]
    ww     = max(3, int(7 * k))

    for r, a in zip(radii, alphas_w):
        col = (*ACCENT, a)
        box = [(cx - r, cy_cap - r), (cx + r, cy_cap + r)]
        # right arcs  (−60° → +60°, PIL: 300° → 60°)
        wd.arc(box, start=300, end=60,  fill=col, width=ww)
        # left arcs   (120° → 240°)
        wd.arc(box, start=120, end=240, fill=col, width=ww)

    img.alpha_composite(wave_layer.filter(ImageFilter.GaussianBlur(int(3 * k))))


# ────────────────────────────────────────────────────────────────
# Per-asset helpers
# ────────────────────────────────────────────────────────────────

def make_icon(size, rounded=True):
    img  = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)
    draw_bg(draw, size, size)

    cx     = size // 2
    cy_cap = int(size * 0.44)

    add_glow(img, cx, cy_cap, int(310 * size / 1024), int(90 * size / 1024))

    draw = ImageDraw.Draw(img)
    draw_mic_full(draw, img, cx, cy_cap, size)

    if rounded:
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            [(0, 0), (size - 1, size - 1)],
            radius=int(size * 0.2237), fill=255,
        )
        out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        out.paste(img, mask=mask)
        return out
    return img


def make_adaptive_icon(size):
    img  = Image.new("RGBA", (size, size), (*BG_TOP, 255))
    draw = ImageDraw.Draw(img)

    cx     = size // 2
    cy_cap = int(size * 0.44)

    add_glow(img, cx, cy_cap, int(310 * size / 1024), int(90 * size / 1024))

    draw = ImageDraw.Draw(img)
    draw_mic_full(draw, img, cx, cy_cap, size)
    return img


def make_splash(w, h):
    img  = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)
    draw_bg(draw, w, h)

    s      = min(w, h)
    cx, cy = w // 2, h // 2

    add_glow(img, cx, cy, int(360 * s / 1024), int(110 * s / 1024))
    draw = ImageDraw.Draw(img)
    draw_mic_full(draw, img, cx, cy, s)
    return img


def make_notification_icon(size):
    """White mic on transparent background."""
    img  = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    k    = size / 96
    cx   = size // 2
    cy   = int(size * 0.40)

    cw = int(14 * k)
    ch = int(26 * k)
    draw.rounded_rectangle([(cx - cw, cy - ch), (cx + cw, cy + ch)], radius=cw, fill=WHITE)

    sw      = max(2, int(3 * k))
    sil_bot = cy + ch + int(14 * k)
    draw.rectangle([(cx - sw, cy + ch), (cx + sw, sil_bot)], fill=WHITE)

    ar = int(14 * k)
    draw.arc([(cx - ar, cy + ch - ar), (cx + ar, cy + ch + ar)],
             start=218, end=322, fill=WHITE, width=max(2, int(3 * k)))

    bw = int(20 * k)
    draw.rounded_rectangle(
        [(cx - bw, sil_bot), (cx + bw, sil_bot + max(2, int(3 * k)))],
        radius=2, fill=WHITE,
    )
    return img


def make_favicon(size):
    img  = Image.new("RGBA", (size, size), (*BG_TOP, 255))
    draw = ImageDraw.Draw(img)
    k    = size / 64
    cx   = size // 2
    cy   = int(size * 0.40)

    cw = int(10 * k)
    ch = int(19 * k)
    draw.rounded_rectangle([(cx - cw, cy - ch), (cx + cw, cy + ch)], radius=cw, fill=WHITE)

    sw      = max(1, int(2 * k))
    sil_bot = cy + ch + int(10 * k)
    draw.rectangle([(cx - sw, cy + ch), (cx + sw, sil_bot)], fill=WHITE)

    ar = int(10 * k)
    draw.arc([(cx - ar, cy + ch - ar), (cx + ar, cy + ch + ar)],
             start=218, end=322, fill=WHITE, width=max(1, int(2 * k)))

    bw = int(14 * k)
    draw.rounded_rectangle(
        [(cx - bw, sil_bot), (cx + bw, sil_bot + max(1, int(2 * k)))],
        radius=1, fill=WHITE,
    )
    return img


# ────────────────────────────────────────────────────────────────
os.makedirs(ASSETS, exist_ok=True)

print("icon.png …")
make_icon(1024).save(os.path.join(ASSETS, "icon.png"))

print("adaptive-icon.png …")
make_adaptive_icon(1024).save(os.path.join(ASSETS, "adaptive-icon.png"))

print("splash.png …")
make_splash(2048, 2048).save(os.path.join(ASSETS, "splash.png"))

print("notification-icon.png …")
make_notification_icon(96).save(os.path.join(ASSETS, "notification-icon.png"))

print("favicon.png …")
make_favicon(64).save(os.path.join(ASSETS, "favicon.png"))

print("Done!")
