# CraftPix dungeon assets

Runtime assets adapted from **Free 2D Top-Down Pixel Dungeon Asset Pack**:

https://craftpix.net/freebies/free-2d-top-down-pixel-dungeon-asset-pack/

License terms:

https://craftpix.net/file-licenses/

The original PSD files, promotional images and coupons are intentionally not included.
The `dungeon-01.tmj` file is an original, finite 72×54 exploration map built with
the pack's floor, wall, object, crack and fire tiles. It contains 14 named regions,
multiple routes and loops, collision-aware obstacles, enemy/chest spawn points and
a hidden `Regions` object layer to make navigation inside Tiled easier.

The tilesets are embedded in the `.tmj`; this project does not use external `.tsx`
files. Original PNG files remain unchanged.

Gameplay points are organized into the `PlayerSpawns`, `EnemySpawns`,
`ChestSpawns`, `KeySpawns` and `ExitGates` object layers. Phaser currently uses
`PlayerSpawn_01` as the deterministic start point. The other player/key/gate
points prepare the map for a future random spawn and extraction loop; they do not
implement that gameplay by themselves.

Torch composites live on the dedicated `Lighting` tile layer. Phaser keeps that
layer bright with additive blending while applying the configured ambient tint to
the remaining environment layers.

## CraftPix object proportions

`scripts/craftpix_object_catalog.py` is the authoritative catalog for every
CraftPix prop placed by the map generator. Many drawings in `Objects.png` cross
tile boundaries even though the atlas itself uses a 16×16 grid. Crates, barrels,
tombs, bones, vases, gold piles and crystals must therefore be placed through a
complete catalog composition instead of by copying a single local tile id.

Each catalog entry declares its tileset, complete tile matrix, visual direction
and whether it is a solid obstacle. Coordinates passed to the generator refer to
the top-left cell of that matrix. Wide/front and light/dark variants are separate
entries so their footprint is explicit.

When adding a future CraftPix prop:

1. inspect every neighboring atlas cell occupied by the drawing;
2. add the complete matrix to `CRAFTPIX_PROPS`;
3. set its visual direction and collision behavior;
4. place it with `add_prop` (solid) or `place_prop` (visual only);
5. regenerate the map and keep the catalog validation passing.

The generator rejects malformed catalog entries, invalid local tile ids,
overlapping composites, props outside the map and decorations that cross walls or
obstacles. Animated gameplay entities such as the interactive chest keep their
frame crop in their corresponding runtime animation module because they are not
static Tiled props.

Run `python3 scripts/generate_dungeon_map.py` from the project root to regenerate
the deterministic map layout. The resulting `.tmj` remains fully editable in Tiled.
