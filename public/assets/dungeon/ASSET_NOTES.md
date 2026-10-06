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

Run `python3 scripts/generate_dungeon_map.py` from the project root to regenerate
the deterministic map layout. The resulting `.tmj` remains fully editable in Tiled.
