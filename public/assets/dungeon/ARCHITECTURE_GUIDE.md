# Dungeon architecture guide

The runtime map uses a 16×16 tile grid and Phaser scales it by 3 (48×48 world
pixels). The source art remains unchanged.

## Verified `walls_floor.png` local tile IDs

The tileset has 17 columns. Tiled GID is `local ID + 1` because this is the
first tileset in the map.

| Purpose | Local IDs |
| --- | --- |
| North wall | 18, 19, 20 (left, middle, right) |
| Side walls | 35, 37 (west, east) |
| South wall ledge | 52, 53, 54 (left, middle, right) |
| South wall face | 69, 70, 71 (left, middle, right) |
| South wall lower face | 86, 87, 88 (left, middle, right) |
| Open arch, top | 430, 431, 432 |
| Open arch, middle | 447, 448, 449 |
| Open arch, threshold | 464, 465, 466 |

## Layer order

1. `Floor`
2. `FloorDetails`
3. `WallsBack`
4. `WallDetails`
5. `Obstacles`
6. `Decoration`
7. `Doors`
8. `WallsFront`
9. `Lighting`
10. hidden `Collision`
11. hidden `VisionBlockers`

`WallsFront` renders above actors. Its two facade rows are visual overhangs;
collision and vision remain on the wall base. An open arch has collision only
on its stone uprights, never in the centre passage.

## Reproducing a room in Tiled

Draw floor first. Add a one-tile collision boundary around it. Use the north
family on the upper edge, side tiles on west/east, and the three south-facing
rows on the lower edge. Put the two lower rows in `WallsFront`. For a doorway,
stamp the 3×3 open arch and clear the centre column in both hidden layers.
Place props by their base cell; tall pixels may overlap upward without moving
the collision base.
