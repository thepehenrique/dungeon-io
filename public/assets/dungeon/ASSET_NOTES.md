# CraftPix dungeon assets

Runtime assets come from **Free 2D Top-Down Pixel Dungeon Asset Pack**:

https://craftpix.net/freebies/free-2d-top-down-pixel-dungeon-asset-pack/

License terms:

https://craftpix.net/file-licenses/

`catacumbas-84x58-source.tmj` is the editable source map supplied for the
Catacumbas layout. It uses a 16×16 orthogonal grid and contains 11 rooms,
alternate routes, a secret passage, water, traps, doors, props and collision.
Keep every referenced PNG in this directory when opening the source in Tiled.

`dungeon-01.tmj` is the generated runtime version. Running
`python3 scripts/generate_dungeon_map.py` copies the visual architecture and
adds the object layers expected by Phaser:

- `PlayerSpawns`
- `EnemySpawns`
- `ChestSpawns`
- `KeySpawns`
- `ExitGates`
- `Regions`
- `VisionBlockers`

The importer preserves the original `Gameplay` layer for editing, creates 36
enemy points across the nine combat rooms, converts the three chest markers,
and uses the supplied key and player start. It also creates nine validated exit
door candidates, one per combat room; the game randomly chooses one on each
run. Every candidate has enough clear, reachable floor for the full door art
and its approach, without overlapping runtime entities or blocked visual
layers. The Vestibulo remains a safe starting room, with no enemy inside the
configured 11-tile safety radius.

Original visual layers are preserved as `Floor`, `Water`, `Walls`, `Details`,
`Props`, `Doors`, `Fire` and `Traps`. `Collision`, `Gameplay` and
`VisionBlockers` stay hidden. `Fire` uses additive blending in Phaser.
Solid CraftPix props receive generated collision at their ground-contact cells;
their upper visual tiles remain non-physical and they do not block vision.

The source PNG files are unchanged. `Composicao.png` contains integral
compositions made from the original CraftPix pieces, including 3×3 portals and
complete multi-tile props.
