#!/usr/bin/env python3
"""Generate the editable Tiled dungeon map used by the Phaser runtime."""

from __future__ import annotations

from collections import deque
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public/assets/dungeon/dungeon-01.tmj"

WIDTH = 72
HEIGHT = 54
TILE_SIZE = 16

FLOOR_GID = 139
WALL_GID = 41

OBJECTS_FIRST_GID = 494
CRACKS_FIRST_GID = 710
FIRE_FIRST_GID = 830

CRATE_GIDS = [OBJECTS_FIRST_GID + value for value in (124, 125, 126, 129, 130, 131)]
BARREL_GIDS = [OBJECTS_FIRST_GID + value for value in (127, 132)]
BONE_GIDS = [OBJECTS_FIRST_GID + value for value in (89, 90)]
SACK_GIDS = [OBJECTS_FIRST_GID + value for value in (133, 134, 136, 137, 138)]
CRYSTAL_GIDS = [OBJECTS_FIRST_GID + value for value in (174, 175)]
TOMB_GIDS = [OBJECTS_FIRST_GID + value for value in (120, 121, 122)]


def empty_grid() -> list[list[int]]:
    return [[0 for _ in range(WIDTH)] for _ in range(HEIGHT)]


def flatten(grid: list[list[int]]) -> list[int]:
    return [value for row in grid for value in row]


def add_rect(cells: set[tuple[int, int]], x: int, y: int, width: int, height: int) -> None:
    for tile_y in range(y, y + height):
        for tile_x in range(x, x + width):
            cells.add((tile_x, tile_y))


ROOMS = [
    ("Entrada / Spawn", 30, 46, 12, 7),
    ("Salao Central", 25, 22, 22, 16),
    ("Cripta Principal", 27, 3, 18, 11),
    ("Capela da Cripta", 17, 4, 8, 7),
    ("Prisoes Oeste", 4, 10, 11, 13),
    ("Prisoes Leste", 16, 13, 9, 11),
    ("Armazem Norte", 52, 6, 16, 14),
    ("Armazem Sul", 53, 21, 13, 8),
    ("Catacumbas Norte", 5, 29, 10, 11),
    ("Catacumbas Leste", 17, 32, 9, 12),
    ("Ossuario", 6, 42, 11, 9),
    ("Ruinas Norte", 48, 24, 11, 7),
    ("Ruinas Principais", 47, 32, 21, 17),
    ("Camara Opcional", 62, 23, 8, 6),
]


def build_walkable() -> tuple[set[tuple[int, int]], set[tuple[int, int]]]:
    walkable: set[tuple[int, int]] = set()
    for _, x, y, width, height in ROOMS:
        add_rect(walkable, x, y, width, height)

    corridors = [
        (34, 37, 4, 10),   # entrada -> hub
        (23, 47, 8, 3),    # entrada -> catacumbas
        (23, 42, 3, 8),
        (41, 47, 7, 3),    # entrada -> ruinas
        (34, 13, 4, 10),   # hub -> cripta
        (23, 18, 3, 9),    # hub -> prisoes
        (20, 17, 5, 3),
        (23, 33, 3, 4),    # hub -> catacumbas
        (14, 32, 11, 3),
        (46, 26, 3, 3),    # hub -> ruinas norte
        (46, 23, 8, 3),    # hub -> armazem sul
        (24, 6, 4, 3),     # capela -> cripta
        (13, 11, 15, 3),   # cripta -> prisoes
        (44, 9, 9, 3),     # cripta -> armazem
        (14, 16, 3, 4),    # blocos da prisao
        (8, 22, 3, 8),     # prisao -> catacumbas
        (20, 23, 3, 10),   # prisao -> catacumbas leste
        (58, 19, 4, 3),    # armazem norte -> sul
        (56, 28, 4, 5),    # armazem -> ruinas
        (65, 28, 3, 5),    # camara opcional -> ruinas
        (14, 34, 4, 3),    # loop interno catacumbas
        (9, 39, 3, 4),
        (14, 43, 4, 3),
        (52, 30, 4, 3),    # ruinas norte -> principais
        (46, 34, 3, 4),    # hub -> ruinas principais
    ]
    for rectangle in corridors:
        add_rect(walkable, *rectangle)

    internal_walls: set[tuple[int, int]] = set()

    # Prison partitions with several door gaps.
    for y in range(11, 22):
        if y not in (14, 18):
            internal_walls.add((9, y))
    for x in range(16, 25):
        if x not in (19, 23):
            internal_walls.add((x, 18))

    # Catacomb partitions create readable bends without a frustrating maze.
    for x in range(6, 14):
        if x != 10:
            internal_walls.add((x, 34))
    for y in range(33, 43):
        if y not in (36, 40):
            internal_walls.add((21, y))
    for x in range(7, 16):
        if x not in (10, 14):
            internal_walls.add((x, 46))

    # Broken walls make the ruins less rectangular while retaining many routes.
    for y in range(34, 45):
        if y not in (37, 42):
            internal_walls.add((55, y))
    for x in range(56, 67):
        if x not in (59, 64):
            internal_walls.add((x, 42))
    for x in range(49, 55):
        if x != 52:
            internal_walls.add((x, 36))

    walkable.difference_update(internal_walls)
    return walkable, internal_walls


def surrounding_walls(walkable: set[tuple[int, int]]) -> set[tuple[int, int]]:
    walls: set[tuple[int, int]] = set()
    for x, y in walkable:
        for offset_y in (-1, 0, 1):
            for offset_x in (-1, 0, 1):
                if offset_x == 0 and offset_y == 0:
                    continue
                candidate = (x + offset_x, y + offset_y)
                if (
                    0 <= candidate[0] < WIDTH
                    and 0 <= candidate[1] < HEIGHT
                    and candidate not in walkable
                ):
                    walls.add(candidate)
    return walls


def put(grid: list[list[int]], x: int, y: int, gid: int) -> None:
    if 0 <= x < WIDTH and 0 <= y < HEIGHT:
        grid[y][x] = gid


def place_fire(grid: list[list[int]], center_x: int, center_y: int) -> None:
    # First compact 3x3 fire frame from fire_animation.png.
    for row in range(3):
        for column in range(3):
            local_id = row * 11 + column
            put(grid, center_x + column - 1, center_y + row - 1, FIRE_FIRST_GID + local_id)


def tiled_property(name: str, value: object, property_type: str) -> dict[str, object]:
    return {"name": name, "type": property_type, "value": value}


def point_object(
    object_id: int,
    name: str,
    object_type: str,
    tile_x: float,
    tile_y: float,
    properties: list[dict[str, object]],
) -> dict[str, object]:
    return {
        "id": object_id,
        "name": name,
        "type": object_type,
        "x": tile_x * TILE_SIZE,
        "y": tile_y * TILE_SIZE,
        "width": 0,
        "height": 0,
        "rotation": 0,
        "visible": True,
        "point": True,
        "properties": properties,
    }


def build_objects(blocked: set[tuple[int, int]]) -> list[dict[str, object]]:
    objects: list[dict[str, object]] = []
    object_id = 1

    objects.append(point_object(object_id, "PlayerSpawn", "PLAYER", 36, 49, []))
    object_id += 1

    enemy_positions = [
        # Hub
        ("Goblin Hub Oeste", "GOBLIN", 29, 27),
        ("Skeleton Hub Norte", "SKELETON_WARRIOR", 36, 25),
        ("Goblin Hub Leste", "GOBLIN", 43, 31),
        ("Zombie Hub Sul", "ZOMBIE", 34, 35),
        # Crypt and chapel
        ("Skeleton Cripta 1", "SKELETON_WARRIOR", 30, 6),
        ("Skeleton Cripta 2", "SKELETON_WARRIOR", 36, 7),
        ("Skeleton Cripta 3", "SKELETON_WARRIOR", 41, 11),
        ("Skeleton Capela 1", "SKELETON_WARRIOR", 19, 6),
        ("Skeleton Capela 2", "SKELETON_WARRIOR", 22, 9),
        # Prisons
        ("Zombie Prisao 1", "ZOMBIE", 6, 13),
        ("Skeleton Prisao 2", "SKELETON_WARRIOR", 12, 16),
        ("Goblin Prisao 3", "GOBLIN", 6, 21),
        ("Zombie Prisao 4", "ZOMBIE", 18, 15),
        ("Skeleton Prisao 5", "SKELETON_WARRIOR", 22, 21),
        # Storage
        ("Goblin Armazem 1", "GOBLIN", 55, 9),
        ("Goblin Armazem 2", "GOBLIN", 63, 8),
        ("Zombie Armazem 3", "ZOMBIE", 60, 15),
        ("Goblin Armazem 4", "GOBLIN", 66, 17),
        ("Goblin Armazem Sul 1", "GOBLIN", 56, 24),
        ("Skeleton Armazem Sul 2", "SKELETON_WARRIOR", 62, 27),
        # Catacombs
        ("Skeleton Catacumba 1", "SKELETON_WARRIOR", 7, 31),
        ("Zombie Catacumba 2", "ZOMBIE", 12, 37),
        ("Skeleton Catacumba 3", "SKELETON_WARRIOR", 18, 34),
        ("Skeleton Catacumba 4", "SKELETON_WARRIOR", 24, 39),
        ("Zombie Ossuario 1", "ZOMBIE", 8, 44),
        ("Skeleton Ossuario 2", "SKELETON_WARRIOR", 14, 49),
        # Ruins
        ("Goblin Ruinas Norte 1", "GOBLIN", 50, 27),
        ("Skeleton Ruinas Norte 2", "SKELETON_WARRIOR", 57, 29),
        ("Goblin Ruinas 1", "GOBLIN", 49, 34),
        ("Zombie Ruinas 2", "ZOMBIE", 52, 40),
        ("Goblin Ruinas 3", "GOBLIN", 60, 34),
        ("Skeleton Ruinas 4", "SKELETON_WARRIOR", 65, 38),
        ("Zombie Ruinas 5", "ZOMBIE", 58, 46),
        ("Goblin Ruinas 6", "GOBLIN", 66, 47),
        # Optional chamber
        ("Skeleton Camara 1", "SKELETON_WARRIOR", 64, 25),
        ("Zombie Camara 2", "ZOMBIE", 68, 27),
    ]

    for name, enemy_type, x, y in enemy_positions:
        assert (x, y) not in blocked, f"Enemy spawn blocked: {name}"
        objects.append(
            point_object(
                object_id,
                name,
                "ENEMY",
                x + 0.5,
                y + 0.5,
                [
                    tiled_property("enemyType", enemy_type, "string"),
                    tiled_property("level", 1, "int"),
                ],
            )
        )
        object_id += 1

    # The current gameplay implements common chests only. Keep every new map
    # spawn compatible with that existing system; chest rarity expansion is a
    # separate gameplay feature and is intentionally outside this map redesign.
    chest_positions = [
        ("Bau Capela", "COMMON", 18, 5),
        ("Bau Cripta", "COMMON", 42, 5),
        ("Bau Prisao Oeste", "COMMON", 5, 11),
        ("Bau Prisao Leste", "COMMON", 23, 14),
        ("Bau Armazem Norte", "COMMON", 66, 7),
        ("Bau Armazem Sul", "COMMON", 64, 22),
        ("Bau Catacumba Norte", "COMMON", 6, 38),
        ("Bau Catacumba Leste", "COMMON", 24, 42),
        ("Bau Ossuario", "COMMON", 7, 49),
        ("Bau Ruinas Norte", "COMMON", 49, 25),
        ("Bau Ruinas", "COMMON", 67, 33),
        ("Bau Camara Opcional", "COMMON", 68, 24),
    ]

    for name, rarity, x, y in chest_positions:
        assert (x, y) not in blocked, f"Chest spawn blocked: {name}"
        objects.append(
            point_object(
                object_id,
                name,
                "CHEST",
                x + 0.5,
                y + 0.5,
                [tiled_property("rarity", rarity, "string")],
            )
        )
        object_id += 1

    return objects


def assert_reachable(
    walkable: set[tuple[int, int]],
    blocked: set[tuple[int, int]],
    objects: list[dict[str, object]],
) -> None:
    start = (36, 49)
    traversable = walkable - blocked
    queue: deque[tuple[int, int]] = deque([start])
    visited = {start}

    while queue:
        x, y = queue.popleft()
        for candidate in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if candidate in traversable and candidate not in visited:
                visited.add(candidate)
                queue.append(candidate)

    for obj in objects:
        cell = (int(float(obj["x"]) // TILE_SIZE), int(float(obj["y"]) // TILE_SIZE))
        assert cell in visited, f"Unreachable object: {obj['name']} at {cell}"

    for name, x, y, width, height in ROOMS:
        center = (x + width // 2, y + height // 2)
        if center not in traversable:
            candidates = [
                cell
                for cell in traversable
                if x <= cell[0] < x + width and y <= cell[1] < y + height
            ]
            assert candidates, f"Room has no walkable cell: {name}"
            center = candidates[0]
        assert center in visited, f"Unreachable room: {name}"


def tile_layer(layer_id: int, name: str, grid: list[list[int]], visible: bool = True) -> dict[str, object]:
    return {
        "id": layer_id,
        "name": name,
        "type": "tilelayer",
        "width": WIDTH,
        "height": HEIGHT,
        "x": 0,
        "y": 0,
        "opacity": 1,
        "visible": visible,
        "data": flatten(grid),
    }


def build_map() -> dict[str, object]:
    walkable, _ = build_walkable()
    wall_cells = surrounding_walls(walkable)

    floor = empty_grid()
    floor_details = empty_grid()
    walls = empty_grid()
    wall_details = empty_grid()
    obstacles = empty_grid()
    decoration = empty_grid()
    collision = empty_grid()

    for x, y in walkable:
        put(floor, x, y, FLOOR_GID)
    for x, y in wall_cells:
        put(walls, x, y, WALL_GID)
        put(collision, x, y, WALL_GID)

    solid_objects: dict[tuple[int, int], int] = {}

    # Central hall pillars and cover.
    for position in ((29, 26), (42, 26), (29, 34), (42, 34)):
        solid_objects[position] = OBJECTS_FIRST_GID + 127
    for index, position in enumerate(((34, 28), (38, 31), (32, 34), (40, 24))):
        solid_objects[position] = CRATE_GIDS[index % len(CRATE_GIDS)]

    # Crypt tombs and cover.
    for start_x, y in ((29, 7), (37, 10), (18, 7)):
        for offset, gid in enumerate(TOMB_GIDS):
            solid_objects[(start_x + offset, y)] = gid
    for position in ((32, 11), (40, 5)):
        solid_objects[position] = BARREL_GIDS[0]

    # Storage stacks leave several navigable lanes.
    storage_positions = [
        (54, 8), (56, 8), (59, 8), (62, 11), (65, 12), (54, 16),
        (58, 17), (63, 17), (55, 23), (58, 25), (61, 23), (63, 26),
    ]
    for index, position in enumerate(storage_positions):
        pool = CRATE_GIDS if index % 3 else BARREL_GIDS
        solid_objects[position] = pool[index % len(pool)]

    # Catacomb and ossuary obstacles.
    for index, position in enumerate(((7, 36), (13, 31), (18, 38), (23, 35), (9, 48), (15, 44))):
        solid_objects[position] = BARREL_GIDS[index % len(BARREL_GIDS)]

    # Broken ruins and scattered cover.
    for index, position in enumerate(((50, 35), (53, 44), (58, 37), (62, 40), (65, 45), (49, 46))):
        solid_objects[position] = (CRATE_GIDS + BARREL_GIDS)[index % 8]

    for (x, y), gid in solid_objects.items():
        assert (x, y) in walkable, f"Obstacle outside floor: {(x, y)}"
        put(obstacles, x, y, gid)
        put(collision, x, y, WALL_GID)

    # Connected eight-tile strips from decorative_cracks_floor.png. The source
    # atlas is compositional, so its pieces must remain adjacent.
    for start_x, y in (
        (31, 29),  # central hall
        (29, 12),  # crypt
        (56, 14),  # storage
        (6, 37),   # catacombs
        (58, 45),  # ruins
        (32, 50),  # entrance
    ):
        for offset in range(8):
            position = (start_x + offset, y)
            if position in walkable:
                put(
                    floor_details,
                    position[0],
                    position[1],
                    CRACKS_FIRST_GID + 88 + offset,
                )

    # Region-specific decoration.
    decorative_objects = [
        # bones in crypt/catacombs
        (28, 5, BONE_GIDS[0]), (34, 9, BONE_GIDS[1]), (43, 12, BONE_GIDS[0]),
        (6, 32, BONE_GIDS[1]), (12, 38, BONE_GIDS[0]), (19, 41, BONE_GIDS[1]),
        (8, 45, BONE_GIDS[0]), (13, 43, BONE_GIDS[1]),
        # sacks in storage
        (53, 12, SACK_GIDS[0]), (57, 13, SACK_GIDS[2]), (64, 9, SACK_GIDS[3]),
        (60, 22, SACK_GIDS[1]), (65, 27, SACK_GIDS[4]),
        # crystals and rubble accents in ruins
        (49, 39, CRYSTAL_GIDS[0]), (63, 35, CRYSTAL_GIDS[1]),
    ]
    for x, y, gid in decorative_objects:
        if (x, y) in walkable and (x, y) not in solid_objects:
            put(decoration, x, y, gid)

    for x, y in ((31, 22), (41, 22), (27, 31), (45, 31), (29, 4), (43, 4), (53, 6), (67, 18), (48, 32), (67, 47)):
        place_fire(decoration, x, y)

    # Barred details identify the prison without closing its routes.
    for x, y, local_id in ((9, 12, 456), (9, 16, 457), (17, 18, 456), (21, 18, 457)):
        put(wall_details, x, y, 1 + local_id)

    blocked = wall_cells | set(solid_objects)
    objects = build_objects(blocked)
    assert_reachable(walkable, set(solid_objects), objects)

    region_objects = []
    next_region_id = len(objects) + 1
    for name, x, y, width, height in ROOMS:
        region_objects.append(
            {
                "id": next_region_id,
                "name": name,
                "type": "REGION",
                "x": x * TILE_SIZE,
                "y": y * TILE_SIZE,
                "width": width * TILE_SIZE,
                "height": height * TILE_SIZE,
                "rotation": 0,
                "visible": True,
            }
        )
        next_region_id += 1

    return {
        "type": "map",
        "version": "1.10",
        "tiledversion": "1.10.2",
        "orientation": "orthogonal",
        "renderorder": "right-down",
        "width": WIDTH,
        "height": HEIGHT,
        "tilewidth": TILE_SIZE,
        "tileheight": TILE_SIZE,
        "infinite": False,
        "backgroundcolor": "#08090d",
        "nextlayerid": 10,
        "nextobjectid": next_region_id,
        "layers": [
            tile_layer(1, "Floor", floor),
            tile_layer(2, "FloorDetails", floor_details),
            tile_layer(3, "Walls", walls),
            tile_layer(4, "WallDetails", wall_details),
            tile_layer(5, "Obstacles", obstacles),
            tile_layer(6, "Decoration", decoration),
            tile_layer(7, "Collision", collision, visible=False),
            {
                "id": 8,
                "name": "SpawnPoints",
                "type": "objectgroup",
                "x": 0,
                "y": 0,
                "opacity": 1,
                "visible": True,
                "draworder": "topdown",
                "objects": objects,
            },
            {
                "id": 9,
                "name": "Regions",
                "type": "objectgroup",
                "x": 0,
                "y": 0,
                "opacity": 1,
                "visible": False,
                "draworder": "topdown",
                "objects": region_objects,
            },
        ],
        "tilesets": [
            {
                "firstgid": 1,
                "name": "walls_floor",
                "tilewidth": 16,
                "tileheight": 16,
                "tilecount": 493,
                "columns": 17,
                "margin": 0,
                "spacing": 0,
                "image": "walls_floor.png",
                "imagewidth": 272,
                "imageheight": 464,
            },
            {
                "firstgid": OBJECTS_FIRST_GID,
                "name": "Objects",
                "tilewidth": 16,
                "tileheight": 16,
                "tilecount": 216,
                "columns": 24,
                "margin": 0,
                "spacing": 0,
                "image": "Objects.png",
                "imagewidth": 384,
                "imageheight": 144,
            },
            {
                "firstgid": CRACKS_FIRST_GID,
                "name": "decorative_cracks_floor",
                "tilewidth": 16,
                "tileheight": 16,
                "tilecount": 120,
                "columns": 8,
                "margin": 0,
                "spacing": 0,
                "image": "decorative_cracks_floor.png",
                "imagewidth": 128,
                "imageheight": 240,
            },
            {
                "firstgid": FIRE_FIRST_GID,
                "name": "fire_animation",
                "tilewidth": 16,
                "tileheight": 16,
                "tilecount": 198,
                "columns": 11,
                "margin": 0,
                "spacing": 0,
                "image": "fire_animation.png",
                "imagewidth": 176,
                "imageheight": 288,
            },
        ],
    }


def main() -> None:
    map_data = build_map()
    OUTPUT.write_text(json.dumps(map_data, ensure_ascii=False, indent=2) + "\n")
    spawn_objects = map_data["layers"][7]["objects"]
    enemies = sum(1 for obj in spawn_objects if obj["type"] == "ENEMY")
    chests = sum(1 for obj in spawn_objects if obj["type"] == "CHEST")
    print(f"Generated {OUTPUT}")
    print(f"Map: {WIDTH}x{HEIGHT}; rooms: {len(ROOMS)}; enemies: {enemies}; chests: {chests}")


if __name__ == "__main__":
    main()
