"""런처 아이콘(남색 바탕 + 흰 체크 + 호박색 달)을 mipmap 크기별로 만듭니다."""
import sys
from PIL import Image, ImageDraw

SIZES = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
NAVY, AMBER, WHITE = (31, 58, 104), (245, 158, 11), (255, 255, 255)


def draw(size):
    s = size * 4  # 크게 그린 뒤 줄여서 테두리를 부드럽게
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=NAVY)
    # 달(초승달): 호박색 원에서 남색 원을 빼서 표현
    r = s * 0.13
    cx, cy = s * 0.74, s * 0.24
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=AMBER)
    d.ellipse([cx - r + s * 0.06, cy - r - s * 0.03, cx + r + s * 0.06, cy + r - s * 0.03], fill=NAVY)
    # 체크 표시
    w = int(s * 0.085)
    pts = [(s * 0.26, s * 0.58), (s * 0.43, s * 0.74), (s * 0.74, s * 0.46)]
    d.line(pts, fill=WHITE, width=w, joint="curve")
    for x, y in (pts[0], pts[2]):
        d.ellipse([x - w / 2, y - w / 2, x + w / 2, y + w / 2], fill=WHITE)
    return img.resize((size, size), Image.LANCZOS)


if __name__ == "__main__":
    out = sys.argv[1]
    import os
    for name, px in SIZES.items():
        os.makedirs(f"{out}/mipmap-{name}", exist_ok=True)
        draw(px).save(f"{out}/mipmap-{name}/ic_launcher.png")
    draw(512).save(f"{out}/../icon-512.png")
