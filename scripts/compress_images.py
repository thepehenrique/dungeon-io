#!/usr/bin/env python3
"""Convert large game textures to lossless WebP. Requires Pillow 10.2+."""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public/assets"
MINIMUM_SIZE = 100 * 1024


def main() -> None:
    # Keep the original PNG tilesets and previews used by the Tiled workflow.
    sources = sorted(
        path for path in ASSETS.rglob("*.png")
        if "dungeon" not in path.relative_to(ASSETS).parts
        and path.stat().st_size >= MINIMUM_SIZE
    )
    references = [
        *ROOT.joinpath("src").rglob("*.ts"),
        *ROOT.joinpath("src").rglob("*.css"),
        *ASSETS.rglob("*.md"),
    ]
    replacements: dict[str, str] = {}
    originals: list[Path] = []
    before = after = 0
    for source in sources:
        target = source.with_suffix(".webp")
        if target.exists():
            raise FileExistsError(f"Refusing to overwrite {target}")
        with Image.open(source) as image:
            rgba = image.convert("RGBA")
            encoded = BytesIO()
            image.save(encoded, format="WEBP", lossless=True, exact=True, method=6)
            data = encoded.getvalue()
            with Image.open(BytesIO(data)) as decoded:
                if decoded.size != image.size or decoded.convert("RGBA").tobytes() != rgba.tobytes():
                    raise ValueError(f"Pixel verification failed for {source}")
        original_size = source.stat().st_size
        if len(data) >= original_size:
            continue
        target.write_bytes(data)
        originals.append(source)
        replacements[source.name] = target.name
        before += original_size
        after += len(data)
        print(f"{source.relative_to(ROOT)}: {original_size:,} -> {len(data):,} bytes", flush=True)

    # Keep frame dimensions, asset keys and all runtime references intact.
    for path in references:
        original = path.read_text()
        updated = original
        for old, new in replacements.items():
            updated = updated.replace(old, new)
        if updated != original:
            path.write_text(updated)
    for source in originals:
        source.unlink()
    if before:
        print(f"Converted {len(originals)} images; saved {(before - after) / 1024**2:.2f} MiB ({1 - after / before:.1%}).")
    else:
        print("No large PNG textures need conversion.")


if __name__ == "__main__":
    main()
