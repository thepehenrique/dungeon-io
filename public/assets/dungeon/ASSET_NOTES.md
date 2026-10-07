# CraftPix dungeon assets

Runtime assets adapted from **Free 2D Top-Down Pixel Dungeon Asset Pack**:

https://craftpix.net/freebies/free-2d-top-down-pixel-dungeon-asset-pack/

License terms:

https://craftpix.net/file-licenses/

The original PSD files, promotional images and coupons are intentionally not included.
The `dungeon-01.tmj` file is an original, finite 84×58 exploration map built with
the pack's floor, wall, object, crack and fire tiles. It contains nine deliberate
architectural regions, multiple routes and loops, collision-aware obstacles,
enemy/chest spawn points and a hidden `Regions` object layer to make navigation
inside Tiled easier.

Its structural layout is organized around a large central hall with a crypt to
the north, prisons and a guard room to the west, warehouse and arsenal rooms to
the east, ruins in both lower wings and catacombs to the south. Rooms are kept
apart by true negative space and connected by consistent three/five-tile
corridors. The west, east and southern branches form alternate loops instead of
one continuous floor mass.

Walls use separate `WallsBack` and `WallsFront` layers. North/side edges establish
the room outline, while south walls add a ledge plus two rows of vertical face.
Open arches are stamped into selected north/south thresholds and keep only their
stone uprights collidable. See `ARCHITECTURE_GUIDE.md` for verified local tile IDs
and the exact Tiled construction pattern.

The tilesets are embedded in the `.tmj`; this project does not use external `.tsx`
files. Original PNG files remain unchanged.

Gameplay points are organized into the `PlayerSpawns`, `EnemySpawns`,
`ChestSpawns`, `KeySpawns` and `ExitGates` object layers. Phaser currently uses
one valid `PlayerSpawns` point and one `ExitGates` point at random when each run
starts. The run objective system chooses one `KeySpawns` point only when the
escape phase begins. Adding valid points to those layers automatically expands
the runtime choices without requiring hardcoded TypeScript coordinates.

The gameplay object layers remain available for runtime compatibility and are
independent from the visual reference used to shape the rooms and corridors.
`KeySpawns` contains invisible candidate points used by the run objective system;
the map itself contains no decorative or permanently visible key tiles.

Torch composites live on the dedicated `Lighting` tile layer. Phaser keeps that
layer bright with additive blending while applying the configured ambient tint to
the remaining environment layers.

## CraftPix object proportions

`scripts/craftpix_object_catalog.py` is the authoritative catalog for every
CraftPix prop placed by the map generator. Many drawings in `Objects.png` cross
tile boundaries even though the atlas itself uses a 16×16 grid. Crates, barrels,
tombs, vases, gold piles and crystals must therefore be placed through a complete
catalog composition instead of by copying a single local tile id.

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
