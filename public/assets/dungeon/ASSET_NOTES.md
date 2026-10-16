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

The generator preserves `Gameplay`, creates enemies from regional budgets
(36 in catacombs and 14 Goblins in the connected den), and converts the existing
chest/key/player markers. Runtime player, key and portal candidates are derived
from reachable free catacomb floor; enemy relocation preserves each region.
See [the map guide](ARCHITECTURE_GUIDE.md) for authoring and validation details.

Original visual layers are preserved as `Floor`, `Water`, `Walls`, `Details`,
`Props`, `Doors`, `Fire` and `Traps`. `Collision`, `Gameplay` and
`VisionBlockers` stay hidden. `Fire` uses additive blending in Phaser.
Solid CraftPix props receive generated collision at their ground-contact cells;
their upper visual tiles remain non-physical and they do not block vision.

The source PNG files are unchanged. `Composicao.png` contains integral
compositions made from the original CraftPix pieces, including 3×3 portals and
complete multi-tile props.

## Supplied Goblin Den assets

The two new sheets were supplied by the user; no third-party provenance or
license is inferred for them. Originals are preserved in
`assets-source/goblin-den/`, outside the published directory. The panorama was
a composition reference. Prepared `goblin-cave-16x16.png` and
`goblin-props-16x16.png` use explicit crops and nearest-neighbor, with a
`goblin-prefabs.json` manifest. Rebuild using
`python3 scripts/prepare_goblin_den_assets.py` (requires Pillow).
The source now contains 15 rooms and is 120 × 58 despite its historical filename.
