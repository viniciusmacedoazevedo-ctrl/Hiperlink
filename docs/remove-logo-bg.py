"""
Remove o fundo branco dos logos sem alterar o desenho.

- Fundo externo (branco ligado às bordas) → transparente.
- Áreas brancas internas:
    * cercadas por cor (ex.: cadeado azul, conector amarelo) → mantidas (fazem parte do desenho);
    * cercadas por tinta neutra (miolo de letras como "o", "e", "D") → transparentes.
- Bordas suavizadas com "color to alpha" (sem serrilhado nem halo branco).
Uso: python3 docs/remove-logo-bg.py   (requer pillow e numpy)
"""
from collections import deque

import numpy as np
from PIL import Image


def dilate(m, it):
    for _ in range(it):
        n = m.copy()
        n[1:] |= m[:-1]; n[:-1] |= m[1:]; n[:, 1:] |= m[:, :-1]; n[:, :-1] |= m[:, 1:]
        m = n
    return m


def regions(mask):
    h, w = mask.shape
    lab = np.zeros((h, w), int); n = 0
    for y in range(h):
        for x in range(w):
            if mask[y, x] and not lab[y, x]:
                n += 1; q = deque([(y, x)]); lab[y, x] = n
                while q:
                    cy, cx = q.popleft()
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = n; q.append((ny, nx))
    return lab, n


def process(src, out, box, pad, resize_w=None, thr=236):
    im = Image.open(src).convert("RGBA")
    l, t, r, b = box
    im = im.crop((max(0, l - pad), max(0, t - pad), min(im.width, r + pad), min(im.height, b + pad)))
    if resize_w:
        im = im.resize((resize_w, round(im.height * resize_w / im.width)), Image.LANCZOS)
    a = np.asarray(im).astype(np.float64) / 255.0
    rgb = a[..., :3]
    light = rgb.min(axis=2) >= thr / 255.0
    lab, n = regions(light)
    h, w = light.shape
    border = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    remove = np.zeros_like(light)
    for i in range(1, n + 1):
        reg = lab == i
        if i in border:
            remove |= reg; continue
        ring = dilate(reg, 2) & ~reg & ~light
        # interior branco cercado por cor → faz parte do desenho
        if ring.any() and sat[ring].mean() > 0.25:
            continue
        remove |= reg
    edge = dilate(remove, 2) & ~remove & ~(light & ~remove)
    alpha = np.ones((h, w)); alpha[remove] = 0
    c2a = np.clip(np.max(1.0 - rgb, axis=2), 0, 1)
    alpha[edge] = c2a[edge]
    safe = np.where(alpha > 1e-6, alpha, 1)
    un = np.clip((rgb - (1 - alpha[..., None])) / safe[..., None], 0, 1)
    rgb = rgb.copy(); rgb[edge] = un[edge]
    Image.fromarray((np.dstack([rgb, alpha]) * 255).round().astype(np.uint8), "RGBA").save(out, optimize=True)
    print(out, im.size)


if __name__ == "__main__":
    process("docs/assets-originais/psg-dados-logo-pdf.png", "src/assets/logos/psg-dados-logo-transparent.png", (117, 23, 1032, 455), 16, 720)
