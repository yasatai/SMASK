"""OGPカード（public/assets/ogp.png）を生成する。

LINE・Slack・X などにURLを貼ったとき、カードの上に出る画像。
サイトのトップと同じ暗い世界（漆黒＋中央の青い靄＋星屑＋ヴィネット）の上に
会社ロゴを置く。値は app/src/components/PageAtmos.tsx の BLOBS からそのまま持ってきている。

ロゴは logo-letters.png（白抜きのマスク）と logo-mark.png（オレンジの◆）の2枚重ね。
サイトのフッターと同じ組み方で、暗い地に合わせて文字だけ明色へ置き換える。

使い方（画像を作り直したいときだけ）：
    python tools/make-ogp.py
Pillow が要る。生成物は public/assets/ogp.png（コミット済み）。
"""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont

W, H = 1200, 630                       # OGPの推奨比（1.91:1）
GROUND = (5, 6, 10)                    # --color-paper（ダーク）
INK = (230, 231, 234)                  # --color-ink
INK_SOFT = (167, 171, 180)             # --color-ink-soft

ASSETS = Path(__file__).resolve().parent.parent / "public" / "assets"
FONT_JP = Path("C:/Windows/Fonts/NotoSansJP-VF.ttf")   # サイト本文と同じ書体

# PageAtmos.tsx の BLOBS（t=0・スクロール0の瞬間）。
# a はサイト側より濃くしている：本文が上に流れる画面と違い、カードに載るのはロゴだけで、
# 同じ濃さだとサムネイルに縮んだとき靄が見えなくなる。
BLOBS = [
    dict(hex="#2f6fd6", r=0.60, ox=-0.05, oy=-0.02, ax=0.045, ay=0.030, ph=0.0, a=0.19),
    dict(hex="#17a3c9", r=0.40, ox=0.07, oy=0.05, ax=0.055, ay=0.040, ph=1.9, a=0.13),
    dict(hex="#5a3ec8", r=0.46, ox=0.02, oy=-0.09, ax=0.050, ay=0.035, ph=3.6, a=0.11),
    dict(hex="#0e3f8a", r=0.86, ox=0.00, oy=0.02, ax=0.030, ay=0.020, ph=5.1, a=0.14),
]
BLOB_GAIN = 1.7


def rgb(h: str) -> tuple[int, int, int]:
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def blob_sprite(color: tuple[int, int, int], size: int = 256) -> Image.Image:
    """PageAtmos の makeBlob と同じ濃度カーブ（0 / .28 / .58 / 1 → 1.0 / .6 / .24 / 0）"""
    stops = [(0.0, 1.0), (0.28, 0.6), (0.58, 0.24), (1.0, 0.0)]
    lut = []
    for i in range(size // 2 + 2):
        t = min(i / (size / 2), 1.0)
        for (t0, a0), (t1, a1) in zip(stops, stops[1:]):
            if t0 <= t <= t1:
                k = 0 if t1 == t0 else (t - t0) / (t1 - t0)
                lut.append(a0 + (a1 - a0) * k)
                break
        else:
            lut.append(0.0)

    img = Image.new("L", (size, size), 0)
    px = img.load()
    c = size / 2
    for y in range(size):
        for x in range(size):
            d = math.hypot(x - c, y - c)
            px[x, y] = int(255 * lut[min(int(d), len(lut) - 1)])
    return Image.merge("RGB", [Image.new("L", (size, size), v) for v in color]), img


def build_background() -> Image.Image:
    base = Image.new("RGB", (W, H), GROUND)
    small = min(W, H)

    for b in BLOBS:
        color_img, mask = blob_sprite(rgb(b["hex"]))
        cx = W * 0.5 + W * b["ox"] + math.sin(b["ph"]) * W * b["ax"]
        cy = H * 0.46 + H * b["oy"] + math.cos(b["ph"] * 0.84) * H * b["ay"]
        R = small * b["r"]
        n = max(2, int(R * 2))
        alpha = min(1.0, b["a"] * BLOB_GAIN)

        layer = Image.new("RGB", (W, H), (0, 0, 0))
        m = mask.resize((n, n), Image.LANCZOS).point(lambda v, a=alpha: int(v * a))
        tinted = Image.new("RGB", (n, n), rgb(b["hex"]))
        layer.paste(tinted, (int(cx - R), int(cy - R)), m)
        base = ImageChops.add(base, layer)          # サイト側の globalCompositeOperation="lighter"

    # 星屑。乱数は固定シードにして、作り直しても同じ絵が出るようにする
    rnd = random.Random(20260818)
    dust = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dd = ImageDraw.Draw(dust)
    for _ in range(int(W * H / 9000)):
        x, y = rnd.uniform(0, W), rnd.uniform(0, H)
        r = 0.5 + rnd.random() * 1.5
        a = int(255 * (0.12 + rnd.random() * 0.6) * 0.8)
        dd.ellipse([x - r, y - r, x + r, y + r], fill=(223, 232, 255, a))
    base = Image.alpha_composite(base.convert("RGBA"), dust).convert("RGB")

    # ヴィネット（.page-atmos::after と同じ：中心34%まで素通し、72%で.55、端で不透明）
    vig = Image.new("L", (W, H), 0)
    vp = vig.load()
    for y in range(H):
        for x in range(W):
            d = math.hypot((x - W * 0.5) / (W * 0.72), (y - H * 0.48) / (H * 0.74)) * 2
            if d <= 0.34:
                v = 0.0
            elif d <= 0.72:
                v = 0.55 * (d - 0.34) / (0.72 - 0.34)
            else:
                v = 0.55 + 0.45 * min(1.0, (d - 0.72) / 0.28)
            vp[x, y] = int(255 * v)
    return Image.composite(Image.new("RGB", (W, H), GROUND), base, vig)


def build_logo(target_w: int) -> Image.Image:
    """文字は明色へ置換、◆は元のオレンジのまま。2枚の外接矩形の和で切り出す。"""
    letters = Image.open(ASSETS / "logo-letters.png").convert("RGBA")
    mark = Image.open(ASSETS / "logo-mark.png").convert("RGBA")

    lb, mb = letters.split()[3].getbbox(), mark.split()[3].getbbox()
    box = (min(lb[0], mb[0]), min(lb[1], mb[1]), max(lb[2], mb[2]), max(lb[3], mb[3]))

    tinted = Image.new("RGBA", letters.size, INK + (0,))
    tinted.putalpha(letters.split()[3])
    logo = Image.alpha_composite(tinted, mark).crop(box)

    w, h = logo.size
    return logo.resize((target_w, round(h * target_w / w)), Image.LANCZOS)


def draw_tagline(img: Image.Image, text: str, y: int, size: int, color, tracking: float) -> None:
    """PILは字送りを持たないので1文字ずつ置く（サイトの letter-spacing 相当）"""
    font = ImageFont.truetype(str(FONT_JP), size)
    d = ImageDraw.Draw(img)
    widths = [d.textlength(ch, font=font) for ch in text]
    total = sum(widths) + tracking * size * (len(text) - 1)
    x = (W - total) / 2
    for ch, w in zip(text, widths):
        d.text((x, y), ch, font=font, fill=color)
        x += w + tracking * size


def main() -> None:
    img = build_background()

    # ロゴ・和文・英字の3つでひと塊。塊の中心が画面中央（y=315）に来るよう置く
    logo = build_logo(560)
    img.paste(logo, ((W - logo.width) // 2, 250 - logo.height // 2), logo)

    draw_tagline(img, "価値を見極め、かたちにする", y=345, size=40, color=INK, tracking=0.12)
    draw_tagline(img, "WEB CONTENT PRODUCTION", y=434, size=19, color=INK_SOFT, tracking=0.30)

    out = ASSETS / "ogp.png"
    img.save(out, "PNG", optimize=True)
    print(f"{out}  {img.size}  {out.stat().st_size / 1024:.0f}KB")


if __name__ == "__main__":
    main()
