#!/usr/bin/env python3
"""Prepare the supplied irregular sheets; never overwrites the originals.

Requires Pillow. Coordinates are source pixels, sizes are 16px tile footprints.
The manifest makes multi-tile prefabs reproducible and usable in Tiled.
"""
import json
from pathlib import Path
from collections import deque
from PIL import Image

ASSETS = Path(__file__).resolve().parents[1] / 'public/assets/dungeon'
ORIGINALS = Path(__file__).resolve().parents[1] / 'assets-source/goblin-den'


def main():
    cave = Image.open(ORIGINALS / 'goblin-cave-source.png').convert('RGBA')
    props = Image.open(ORIGINALS / 'goblin-props-source.png').convert('RGBA')
    atlas = Image.new('RGBA', (128, 32))
    boxes = [(420, 52, 516, 148), (300, 52, 396, 148),
             (806, 50, 902, 146), (420, 70, 516, 166),
             (418, 322, 525, 429), (300, 322, 407, 429),
             (430, 196, 510, 276), (690, 196, 770, 276)]
    for i, box in enumerate(boxes):
        tile = cave.crop(box).resize((16, 16), Image.Resampling.NEAREST)
        atlas.paste(tile, (i * 16, 0))
    # Alternate textures using exact rotations (no filtering).
    for i in range(8):
        atlas.paste(atlas.crop((i*16, 0, i*16+16, 16)).transpose(Image.Transpose.ROTATE_180), (i*16, 16))
    atlas.save(ASSETS / 'goblin-cave-16x16.png', optimize=True)

    definitions = [
        ('tent', (14,160,215,309),4,3,True),
        ('tent_large',(220,162,444,318),4,3,True),
        ('crate',(937,311,1008,404),2,2,True),
        ('barrel',(274,424,354,508),2,2,True),
        ('sacks',(14,397,138,447),2,1,False),
        ('table',(720,607,867,706),3,2,True),
        ('campfire',(135,631,245,737),2,2,False),
        ('brazier',(270,508,351,635),1,2,True),
        ('palisade',(838,8,981,130),3,3,True),
        ('banner',(803,422,906,599),2,3,True),
        ('mushrooms',(1029,830,1149,908),2,1,False),
        ('rock',(17,732,110,883),2,3,True),
        ('bones',(945,1003,1057,1065),2,1,False),
        ('puddle',(394,1133,493,1238),2,2,False),
        ('arch',(274,12,427,166),3,3,False),
    ]
    atlas = Image.new('RGBA', (256, 256))
    manifest = {}
    cursor_x = cursor_y = row_height = 0
    for name, box, w, h, solid in definitions:
        crop = props.crop(box)
        # Keep the principal connected object, removing fragments of neighbours.
        alpha = crop.getchannel('A')
        remaining = {(x,y) for y in range(crop.height) for x in range(crop.width) if alpha.getpixel((x,y)) > 80}
        components = []
        while remaining:
            start = remaining.pop()
            component, queue = {start}, deque([start])
            while queue:
                x,y = queue.popleft()
                for p in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
                    if p in remaining:
                        remaining.remove(p); component.add(p); queue.append(p)
            components.append(component)
        main_component = max(components, key=len)
        mask = Image.new('L', crop.size)
        for p in main_component:
            mask.putpixel(p, alpha.getpixel(p))
        crop.putalpha(mask)
        crop = crop.crop(crop.getbbox())
        crop.thumbnail((w*16, h*16), Image.Resampling.NEAREST)
        prefab = Image.new('RGBA', (w*16,h*16))
        prefab.paste(crop, ((w*16-crop.width)//2,h*16-crop.height))
        if cursor_x + w > 16:
            cursor_x = 0; cursor_y += row_height; row_height = 0
        atlas.paste(prefab, (cursor_x*16,cursor_y*16))
        manifest[name] = dict(x=cursor_x,y=cursor_y,width=w,height=h,solid=solid,sourceCrop=box)
        cursor_x += w; row_height = max(row_height,h)
    atlas.save(ASSETS / 'goblin-props-16x16.png', optimize=True)
    (ASSETS / 'goblin-prefabs.json').write_text(json.dumps(manifest, indent=2)+'\n')
    print('Prepared 16px cave atlas and 15 multi-tile goblin prefabs (nearest-neighbor).')


if __name__ == '__main__':
    main()
