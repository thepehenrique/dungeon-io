#!/usr/bin/env python3
"""Generate the editable Tiled dungeon map used by the Phaser runtime."""

from __future__ import annotations

from collections import deque
import json
from math import hypot
from pathlib import Path

from craftpix_object_catalog import (
    CRAFTPIX_PROPS,
    CRACKS_FIRST_GID,
    FIRE_FIRST_GID,
    OBJECTS_FIRST_GID,
    WALLS_FIRST_GID,
    prop_cells,
    validate_craftpix_catalog,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public/assets/dungeon/dungeon-01.tmj"

WIDTH = 84
HEIGHT = 58
TILE_SIZE = 16
SAFE_SPAWN_MIN_DISTANCE_TILES = 11

FLOOR_GID = WALLS_FIRST_GID + 138
WALL_GID = WALLS_FIRST_GID + 40

# Verified against walls_floor.png (17 columns, 16 px tiles). These are the
# architectural pieces used by the first room in the CraftPix sheet: a thin
# north wall, vertical side walls and a two-tile-high south-facing wall. Keep
# the local IDs here so changing the visual family never changes collision or
# gameplay data.
WALL_TILE = {
    "north_left": WALLS_FIRST_GID + 18,
    "north": WALLS_FIRST_GID + 19,
    "north_right": WALLS_FIRST_GID + 20,
    "west": WALLS_FIRST_GID + 35,
    "east": WALLS_FIRST_GID + 37,
    "south_left": WALLS_FIRST_GID + 52,
    "south": WALLS_FIRST_GID + 53,
    "south_right": WALLS_FIRST_GID + 54,
    "front_left": WALLS_FIRST_GID + 69,
    "front": WALLS_FIRST_GID + 70,
    "front_right": WALLS_FIRST_GID + 71,
    "front_bottom_left": WALLS_FIRST_GID + 86,
    "front_bottom": WALLS_FIRST_GID + 87,
    "front_bottom_right": WALLS_FIRST_GID + 88,
    "solid": WALL_GID,
}

# Open north/south doorway from the static door family at the bottom of
# walls_floor.png. The centre column is the passage; the side columns are the
# masonry frame. Rows are ordered from lintel to threshold.
OPEN_ARCH_STAMP = (
    (WALLS_FIRST_GID + 430, WALLS_FIRST_GID + 431, WALLS_FIRST_GID + 432),
    (WALLS_FIRST_GID + 447, WALLS_FIRST_GID + 448, WALLS_FIRST_GID + 449),
    (WALLS_FIRST_GID + 464, WALLS_FIRST_GID + 465, WALLS_FIRST_GID + 466),
)

# Door thresholds are deliberately placed only on north/south passages,
# matching the perspective supplied by the pack. (centre x, threshold y)
DOORWAYS = (
    (41, 21),  # Cripta -> Salao Central
    (41, 15),  # Cripta -> corredor
    (41, 42),  # Salao Central -> Catacumbas
    (71, 26),  # Armazem -> Arsenal Leste
    (71, 43),  # Arsenal Leste -> Ruinas Sudeste
)

CRATE_VARIANTS = (
    "crate-light-wide",
    "crate-light-front",
    "crate-dark-wide",
    "crate-dark-front",
)
BARREL_VARIANTS = ("barrel-light", "barrel-dark")
VASE_VARIANTS = (
    "vase-blue-large",
    "vase-blue-medium",
    "vase-brown-large",
    "vase-brown-medium",
    "vase-brown-small",
)
GOLD_VARIANTS = (
    "gold-flat-wide",
    "gold-pile-wide",
    "gold-pile-medium",
    "gold-pile-compact",
    "gold-scattered-wide",
    "gold-scattered-small",
    "gold-pile-small",
)
CRYSTAL_VARIANTS = ("crystal-small", "crystal-large")

# Only tall/wide cover occludes sight. Narrow crates and the current barrel
# sprites remain physical obstacles, but are low cover and do not cast long
# triangular fog shadows across the room.
VISION_BLOCKING_PROP_KEYS = (
    "crate-light-wide",
    "crate-dark-wide",
)
VISION_BLOCKING_PROP_GIDS = {
    gid
    for prop_key in VISION_BLOCKING_PROP_KEYS
    for _, _, gid in prop_cells(prop_key, 0, 0)
}


def empty_grid() -> list[list[int]]:
    return [[0 for _ in range(WIDTH)] for _ in range(HEIGHT)]


def flatten(grid: list[list[int]]) -> list[int]:
    return [value for row in grid for value in row]


def add_rect(cells: set[tuple[int, int]], x: int, y: int, width: int, height: int) -> None:
    for tile_y in range(y, y + height):
        for tile_x in range(x, x + width):
            cells.add((tile_x, tile_y))


ROOMS = [
    ("Salao Central", 31, 22, 22, 14),
    ("Cripta Principal", 33, 4, 18, 11),
    ("Prisoes", 5, 8, 18, 14),
    ("Guarita Oeste", 6, 28, 17, 10),
    ("Ruinas Oeste", 5, 43, 22, 11),
    ("Catacumbas", 33, 43, 20, 11),
    ("Armazem", 61, 6, 18, 15),
    ("Arsenal Leste", 62, 27, 17, 11),
    ("Ruinas Sudeste", 61, 44, 18, 10),
]


def build_walkable() -> tuple[set[tuple[int, int]], set[tuple[int, int]]]:
    walkable: set[tuple[int, int]] = set()
    for _, x, y, width, height in ROOMS:
        add_rect(walkable, x, y, width, height)

    # Every connector is three or five tiles wide. Rooms stay separated by
    # enough void for the south-facing wall to keep its full visual height.
    corridors = [
        (39, 15, 5, 7),    # cripta -> salao
        (23, 14, 8, 3),    # prisoes -> salao
        (23, 30, 8, 3),    # guarita -> salao
        (12, 22, 4, 6),    # prisoes -> guarita
        (13, 38, 4, 5),    # guarita -> ruinas oeste
        (27, 48, 6, 3),    # ruinas oeste -> catacumbas
        (39, 36, 5, 7),    # salao -> catacumbas
        (51, 9, 10, 3),    # cripta -> armazem
        (53, 29, 9, 3),    # salao -> arsenal
        (69, 21, 4, 6),    # armazem -> arsenal
        (69, 38, 4, 6),    # arsenal -> ruinas sudeste
        (53, 48, 8, 3),    # catacumbas -> ruinas sudeste
    ]
    for rectangle in corridors:
        add_rect(walkable, *rectangle)

    internal_walls: set[tuple[int, int]] = set()
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


def build_architecture(
    walkable: set[tuple[int, int]],
    wall_cells: set[tuple[int, int]],
) -> tuple[
    list[list[int]],
    list[list[int]],
    list[list[int]],
    set[tuple[int, int]],
]:
    """Build standing walls, front faces and open door frames."""
    walls_back = empty_grid()
    walls_front = empty_grid()
    doors = empty_grid()
    door_frame_collision: set[tuple[int, int]] = set()

    for x, y in sorted(wall_cells, key=lambda cell: (cell[1], cell[0])):
        floor_north = (x, y - 1) in walkable
        floor_south = (x, y + 1) in walkable
        floor_west = (x - 1, y) in walkable
        floor_east = (x + 1, y) in walkable

        if floor_north:
            begins = (x - 1, y - 1) not in walkable
            ends = (x + 1, y - 1) not in walkable
            tile = WALL_TILE["south"]
            if begins and not ends:
                tile = WALL_TILE["south_left"]
            elif ends and not begins:
                tile = WALL_TILE["south_right"]
            put(walls_back, x, y, tile)

            # The extra facade rows are visual overhangs. Never cover a room
            # or corridor below them.
            for offset_y, middle_key, left_key, right_key in (
                (1, "front", "front_left", "front_right"),
                (2, "front_bottom", "front_bottom_left", "front_bottom_right"),
            ):
                target = (x, y + offset_y)
                if target in walkable or target in wall_cells:
                    continue
                face_tile = WALL_TILE[middle_key]
                if begins and not ends:
                    face_tile = WALL_TILE[left_key]
                elif ends and not begins:
                    face_tile = WALL_TILE[right_key]
                put(walls_front, target[0], target[1], face_tile)
        elif floor_south:
            begins = (x - 1, y + 1) not in walkable
            ends = (x + 1, y + 1) not in walkable
            tile = WALL_TILE["north"]
            if begins and not ends:
                tile = WALL_TILE["north_left"]
            elif ends and not begins:
                tile = WALL_TILE["north_right"]
            put(walls_back, x, y, tile)
        elif floor_east:
            put(walls_back, x, y, WALL_TILE["west"])
        elif floor_west:
            put(walls_back, x, y, WALL_TILE["east"])
        else:
            put(walls_back, x, y, WALL_TILE["solid"])

    # Door art and physical access are kept separate: only the two masonry
    # uprights block movement/sight; the centre passage always remains open.
    for center_x, threshold_y in DOORWAYS:
        passage_cells = {
            (center_x, threshold_y - 1),
            (center_x, threshold_y),
        }
        assert passage_cells <= walkable, (
            f"Door passage is outside the floor at {(center_x, threshold_y)}"
        )
        origin_x = center_x - 1
        origin_y = threshold_y - 2
        for row_index, row in enumerate(OPEN_ARCH_STAMP):
            for column_index, gid in enumerate(row):
                put(doors, origin_x + column_index, origin_y + row_index, gid)

        for frame_cell in (
            (center_x - 1, threshold_y - 1),
            (center_x + 1, threshold_y - 1),
            (center_x - 1, threshold_y),
            (center_x + 1, threshold_y),
        ):
            if frame_cell in walkable:
                door_frame_collision.add(frame_cell)

    return walls_back, walls_front, doors, door_frame_collision


def put(
    grid: list[list[int]],
    x: int,
    y: int,
    gid: int,
    *,
    catalogued_prop: bool = False,
) -> None:
    if gid >= OBJECTS_FIRST_GID and not catalogued_prop:
        raise ValueError(
            "CraftPix object/effect GIDs must be placed through CRAFTPIX_PROPS"
        )
    if 0 <= x < WIDTH and 0 <= y < HEIGHT:
        grid[y][x] = gid


def add_prop(
    objects: dict[tuple[int, int], int],
    prop_key: str,
    x: int,
    y: int,
) -> None:
    assert CRAFTPIX_PROPS[prop_key].solid, (
        f"Non-solid CraftPix prop {prop_key!r} cannot be an obstacle"
    )
    for cell_x, cell_y, gid in prop_cells(prop_key, x, y):
        cell = (cell_x, cell_y)
        assert cell not in objects, f"CraftPix props overlap at {cell}"
        objects[cell] = gid


def add_barrel(
    objects: dict[tuple[int, int], int],
    x: int,
    y: int,
    variant: int = 0,
) -> None:
    add_prop(objects, BARREL_VARIANTS[variant % len(BARREL_VARIANTS)], x, y)


def add_crate(
    objects: dict[tuple[int, int], int],
    x: int,
    y: int,
    variant: int = 0,
) -> None:
    add_prop(objects, CRATE_VARIANTS[variant % len(CRATE_VARIANTS)], x, y)


def add_supply_cluster(objects: dict[tuple[int, int], int], x: int, y: int) -> None:
    add_prop(objects, "supply-cluster", x, y)


def place_prop(grid: list[list[int]], prop_key: str, x: int, y: int) -> None:
    for cell_x, cell_y, gid in prop_cells(prop_key, x, y):
        assert 0 <= cell_x < WIDTH and 0 <= cell_y < HEIGHT, (
            f"CraftPix prop {prop_key!r} outside map at {(cell_x, cell_y)}"
        )
        assert grid[cell_y][cell_x] == 0, (
            f"CraftPix prop {prop_key!r} overlaps layer at {(cell_x, cell_y)}"
        )
        put(grid, cell_x, cell_y, gid, catalogued_prop=True)


def place_fire(grid: list[list[int]], center_x: int, center_y: int) -> None:
    place_prop(grid, "fire-small", center_x - 1, center_y - 1)


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


def build_spawn_layers(
    blocked: set[tuple[int, int]],
) -> dict[str, list[dict[str, object]]]:
    player_spawns: list[dict[str, object]] = []
    enemy_spawns: list[dict[str, object]] = []
    chest_spawns: list[dict[str, object]] = []
    key_spawns: list[dict[str, object]] = []
    exit_gates: list[dict[str, object]] = []
    object_id = 1

    player_positions = [
        ("PlayerSpawn_01", 20, 35, True),  # Guarita Oeste: inicio seguro.
        ("PlayerSpawn_02", 42, 32, False),  # Salao central.
        ("PlayerSpawn_03", 42, 8, False),   # Cripta.
        ("PlayerSpawn_04", 14, 18, False),  # Prisoes.
        ("PlayerSpawn_05", 70, 16, False),  # Armazem.
        ("PlayerSpawn_06", 70, 50, False),  # Ruinas sudeste.
    ]
    for name, x, y, safe_start in player_positions:
        assert (x, y) not in blocked, f"Player spawn blocked: {name}"
        player_spawns.append(
            point_object(
                object_id,
                name,
                "PLAYER",
                x,
                y,
                [tiled_property("safeStart", safe_start, "bool")],
            )
        )
        object_id += 1

    enemy_positions = [
        ("Skeleton Cripta 1", "SKELETON_WARRIOR", 36, 7),
        ("Skeleton Cripta 2", "SKELETON_WARRIOR", 42, 11),
        ("Skeleton Cripta 3", "SKELETON_WARRIOR", 48, 7),
        ("Zombie Prisao 1", "ZOMBIE", 8, 11),
        ("Skeleton Prisao 2", "SKELETON_WARRIOR", 14, 13),
        ("Goblin Prisao 3", "GOBLIN", 20, 18),
        ("Goblin Salao 7", "GOBLIN", 45, 24),
        ("Zombie Arsenal 4", "ZOMBIE", 73, 35),
        ("Goblin Salao 1", "GOBLIN", 34, 25),
        ("Skeleton Salao 2", "SKELETON_WARRIOR", 42, 26),
        ("Goblin Salao 3", "GOBLIN", 49, 31),
        ("Zombie Salao 4", "ZOMBIE", 36, 34),
        ("Goblin Armazem 1", "GOBLIN", 64, 9),
        ("Goblin Armazem 2", "GOBLIN", 70, 12),
        ("Zombie Armazem 3", "ZOMBIE", 76, 18),
        ("Goblin Arsenal 1", "GOBLIN", 65, 30),
        ("Skeleton Arsenal 2", "SKELETON_WARRIOR", 75, 34),
        ("Skeleton Ruinas Oeste 1", "SKELETON_WARRIOR", 8, 46),
        ("Zombie Ruinas Oeste 2", "ZOMBIE", 16, 49),
        ("Goblin Ruinas Oeste 3", "GOBLIN", 24, 52),
        ("Skeleton Catacumba 1", "SKELETON_WARRIOR", 36, 46),
        ("Zombie Catacumba 2", "ZOMBIE", 48, 49),
        ("Goblin Ruinas Sudeste 1", "GOBLIN", 64, 47),
        ("Zombie Ruinas Sudeste 2", "ZOMBIE", 76, 51),
        # Additional positions preserve the encounter density of the previous
        # map while distributing it across the clearer room plan.
        ("Skeleton Cripta 4", "SKELETON_WARRIOR", 38, 6),
        ("Zombie Cripta 5", "ZOMBIE", 45, 7),
        ("Goblin Prisao 4", "GOBLIN", 9, 17),
        ("Zombie Prisao 5", "ZOMBIE", 17, 20),
        ("Goblin Armazem 6", "GOBLIN", 65, 14),
        ("Skeleton Salao 5", "SKELETON_WARRIOR", 46, 34),
        ("Goblin Salao 6", "GOBLIN", 33, 28),
        ("Goblin Armazem 4", "GOBLIN", 67, 15),
        ("Zombie Armazem 5", "ZOMBIE", 73, 9),
        ("Skeleton Arsenal 3", "SKELETON_WARRIOR", 68, 35),
        ("Zombie Ruinas Oeste 4", "ZOMBIE", 20, 52),
        ("Skeleton Catacumba 3", "SKELETON_WARRIOR", 44, 46),
    ]

    for name, enemy_type, x, y in enemy_positions:
        assert (x, y) not in blocked, f"Enemy spawn blocked: {name}"
        enemy_spawns.append(
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

    safe_spawn_positions = [
        (x, y)
        for _, x, y, safe_start in player_positions
        if safe_start
    ]
    assert safe_spawn_positions, "The map requires a safe player spawn"
    for safe_x, safe_y in safe_spawn_positions:
        nearest_enemy_distance = min(
            hypot((enemy_x + 0.5) - safe_x, (enemy_y + 0.5) - safe_y)
            for _, _, enemy_x, enemy_y in enemy_positions
        )
        assert nearest_enemy_distance > SAFE_SPAWN_MIN_DISTANCE_TILES, (
            "Safe player spawn is inside enemy detection range: "
            f"{nearest_enemy_distance:.2f} tiles"
        )

    # The current gameplay implements common chests only. Keep every new map
    # spawn compatible with that existing system; chest rarity expansion is a
    # separate gameplay feature and is intentionally outside this map redesign.
    chest_positions = [
        ("Bau Cripta", "COMMON", 48, 12),
        ("Bau Prisao", "COMMON", 7, 19),
        ("Bau Guarita", "COMMON", 20, 29),
        ("Bau Salao", "COMMON", 50, 24),
        ("Bau Armazem", "COMMON", 77, 8),
        ("Bau Arsenal", "COMMON", 76, 28),
        ("Bau Ruinas Oeste", "COMMON", 7, 52),
        ("Bau Catacumba", "COMMON", 50, 52),
        ("Bau Ruinas Sudeste", "COMMON", 76, 45),
        ("Bau Guarita Sul", "COMMON", 22, 37),
        ("Bau Salao Sul", "COMMON", 33, 35),
        ("Bau Armazem Sul", "COMMON", 62, 20),
    ]

    for name, rarity, x, y in chest_positions:
        assert (x, y) not in blocked, f"Chest spawn blocked: {name}"
        chest_spawns.append(
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

    # Invisible objective candidates. The runtime chooses exactly one only
    # when the ESCAPE phase starts; these points do not render keys in Tiled.
    key_positions = [
        ("KeySpawn_01", 35, 12),
        ("KeySpawn_02", 19, 10),
        ("KeySpawn_03", 8, 36),
        ("KeySpawn_04", 77, 19),
        ("KeySpawn_05", 25, 45),
        ("KeySpawn_06", 63, 52),
    ]
    for name, x, y in key_positions:
        assert (x, y) not in blocked, f"Key spawn blocked: {name}"
        key_spawns.append(point_object(object_id, name, "KEY", x + 0.5, y + 0.5, []))
        object_id += 1

    exit_positions = [
        ("ExitGate_01", 42, 5),   # Norte / cripta.
        ("ExitGate_02", 6, 49),   # Sudoeste / ruinas.
        ("ExitGate_03", 77, 49),  # Sudeste / ruinas.
    ]
    for name, x, y in exit_positions:
        assert (x, y) not in blocked, f"Exit gate blocked: {name}"
        exit_gates.append(point_object(object_id, name, "EXIT_GATE", x + 0.5, y + 0.5, []))
        object_id += 1

    return {
        "PlayerSpawns": player_spawns,
        "EnemySpawns": enemy_spawns,
        "ChestSpawns": chest_spawns,
        "KeySpawns": key_spawns,
        "ExitGates": exit_gates,
    }


def assert_reachable(
    walkable: set[tuple[int, int]],
    blocked: set[tuple[int, int]],
    objects: list[dict[str, object]],
) -> None:
    start = (20, 35)
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


def tile_layer(
    layer_id: int,
    name: str,
    grid: list[list[int]],
    visible: bool = True,
    *,
    blocks_vision: bool = False,
) -> dict[str, object]:
    layer: dict[str, object] = {
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
    if blocks_vision:
        layer["properties"] = [
            {"name": "blocksVision", "type": "bool", "value": True}
        ]
    return layer


def build_map() -> dict[str, object]:
    validate_craftpix_catalog()
    walkable, _ = build_walkable()
    wall_cells = surrounding_walls(walkable)

    floor = empty_grid()
    floor_details = empty_grid()
    walls_back, walls_front, doors, door_frame_collision = build_architecture(
        walkable,
        wall_cells,
    )
    wall_details = empty_grid()
    obstacles = empty_grid()
    decoration = empty_grid()
    lighting = empty_grid()
    collision = empty_grid()
    vision_blockers = empty_grid()

    for x, y in walkable:
        put(floor, x, y, FLOOR_GID)
    for x, y in wall_cells:
        put(collision, x, y, WALL_GID)
        put(vision_blockers, x, y, WALL_GID)
    for x, y in door_frame_collision:
        put(collision, x, y, WALL_GID)
        put(vision_blockers, x, y, WALL_GID)

    solid_objects: dict[tuple[int, int], int] = {}

    # The great hall is intentionally open. Four masonry pillars establish a
    # symmetric centre aisle without turning it into a storage room.
    for position in ((35, 25), (49, 25), (35, 33), (49, 33)):
        solid_objects[position] = WALL_GID

    # Crypt: a few offerings against the wall, never random warehouse clutter.
    for index, position in enumerate(((34, 5), (49, 5), (34, 13), (49, 13))):
        add_barrel(solid_objects, *position, index)

    # Prison and guard room: compact cover groups leave the middle lanes free.
    for position, variant in (
        ((6, 9), 1), ((7, 9), 1), ((20, 9), 3),
        ((7, 29), 1), ((8, 29), 3), ((20, 36), 1),
    ):
        add_crate(solid_objects, *position, variant)
    for index, position in enumerate(((6, 19), (20, 20), (19, 29))):
        add_barrel(solid_objects, *position, index)

    # Warehouse: grouped stacks along its perimeter form intentional aisles.
    for position in ((62, 7), (66, 7), (74, 7), (62, 17), (72, 17)):
        add_supply_cluster(solid_objects, *position)
    for index, position in enumerate(((66, 18), (77, 12), (76, 19))):
        add_barrel(solid_objects, *position, index)

    # Arsenal and catacombs use sparse paired cover, preserving combat space.
    for position, variant in (
        ((63, 28), 1), ((64, 28), 3), ((76, 36), 1),
        ((34, 44), 3), ((35, 44), 1), ((50, 44), 3),
    ):
        add_crate(solid_objects, *position, variant)

    # Ruin debris hugs damaged outer edges and becomes sparser toward the room.
    for position in ((6, 44), (21, 44), (62, 45), (73, 45)):
        add_supply_cluster(solid_objects, *position)
    for index, position in enumerate(((9, 46), (25, 46), (65, 47), (77, 47))):
        add_barrel(solid_objects, *position, index)

    for (x, y), gid in solid_objects.items():
        assert (x, y) in walkable, f"Obstacle outside floor: {(x, y)}"
        put(obstacles, x, y, gid, catalogued_prop=True)
        put(collision, x, y, WALL_GID)
        # Vision remains independent from collision: low cover still blocks
        # movement, while only explicitly selected large props occlude sight.
        if gid == WALL_GID or gid in VISION_BLOCKING_PROP_GIDS:
            put(vision_blockers, x, y, WALL_GID)

    # Connected strips remain a single catalog object, so future edits cannot
    # accidentally place an isolated crack fragment.
    for start_x, y in (
        (38, 12),  # crypt
        (8, 20),   # prisons
        (10, 52),  # western ruins
        (65, 52),  # southeastern ruins
    ):
        assert all((start_x + offset, y) in walkable for offset in range(8))
        place_prop(floor_details, "floor-crack-strip", start_x, y)

    # Small native floor marks give the entrance and hub a hand-built rhythm
    # without the artificial appearance of long repeated crack strips.
    floor_marks = [
        # Central hall and its four approaches
        (33, 23, 0), (39, 24, 1), (45, 23, 2), (51, 27, 3),
        (33, 30, 2), (42, 30, 3), (48, 34, 0), (41, 38, 1),
        # Crypt and prisons
        (35, 6, 1), (40, 8, 3), (46, 6, 0), (48, 13, 2),
        (7, 10, 3), (11, 15, 0), (17, 12, 2), (20, 19, 1),
        # Western guard room and ruins
        (8, 32, 1), (14, 29, 3), (20, 34, 0),
        (7, 47, 2), (13, 50, 0), (20, 46, 3), (25, 52, 1),
        # Warehouse and arsenal
        (63, 12, 2), (69, 8, 0), (74, 15, 3), (77, 10, 1),
        (64, 33, 1), (70, 29, 2), (76, 35, 0),
        # Catacombs and southeastern ruins
        (35, 48, 3), (41, 45, 1), (48, 51, 2),
        (63, 49, 0), (69, 46, 2), (75, 52, 1),
    ]
    for x, y, mark_index in floor_marks:
        if (
            (x, y) in walkable
            and (x, y) not in solid_objects
            and floor_details[y][x] == 0
        ):
            place_prop(floor_details, f"floor-mark-{mark_index}", x, y)

    # Region-specific decoration.
    decorative_objects = [
        # Crypt offerings and prison belongings stay close to walls.
        (36, 5, VASE_VARIANTS[0]), (47, 5, VASE_VARIANTS[2]),
        (45, 13, GOLD_VARIANTS[6]),
        (6, 16, VASE_VARIANTS[4]), (21, 12, VASE_VARIANTS[3]),
        # Hall accents preserve the central combat aisle.
        (32, 23, VASE_VARIANTS[1]), (51, 34, VASE_VARIANTS[2]),
        # Warehouse valuables remain beside grouped supplies.
        (63, 19, VASE_VARIANTS[0]), (75, 17, VASE_VARIANTS[3]),
        (68, 19, GOLD_VARIANTS[2]), (75, 10, GOLD_VARIANTS[6]),
        # Ruin fragments form short trails away from damaged edges.
        (10, 45, CRYSTAL_VARIANTS[0]), (12, 46, CRYSTAL_VARIANTS[1]),
        (22, 46, GOLD_VARIANTS[3]),
        (66, 47, CRYSTAL_VARIANTS[0]), (68, 48, CRYSTAL_VARIANTS[1]),
        (74, 47, GOLD_VARIANTS[5]),
    ]
    decoration_cells: set[tuple[int, int]] = set()
    for x, y, prop_key in decorative_objects:
        cells = {(cell_x, cell_y) for cell_x, cell_y, _ in prop_cells(prop_key, x, y)}
        assert cells <= walkable, f"Decoration {prop_key!r} outside floor: {cells - walkable}"
        assert not cells & set(solid_objects), (
            f"Decoration {prop_key!r} overlaps obstacle: {cells & set(solid_objects)}"
        )
        assert not cells & decoration_cells, (
            f"Decoration {prop_key!r} overlaps decoration: {cells & decoration_cells}"
        )
        place_prop(decoration, prop_key, x, y)
        decoration_cells.update(cells)

    # Wall torches use the neighboring collision cell as their anchor so the
    # flame is mounted on masonry and the halo extends into the room.
    wall_torches = (
        # important entrances and symmetric hall anchors
        (33, 21), (50, 21), (30, 25), (53, 33),
        (35, 3), (48, 3),
        # western rooms
        (7, 7), (21, 7), (5, 30), (23, 35),
        (7, 42), (25, 42),
        # eastern rooms
        (63, 5), (77, 5), (61, 34), (79, 35),
        (63, 43), (77, 43),
        # southern catacombs
        (35, 42), (51, 42),
    )
    for x, y in wall_torches:
        assert (x, y) in wall_cells, f"Torch is not mounted on a wall: {(x, y)}"
        place_fire(lighting, x, y)

    # The central fire is a freestanding brazier and visual focal point.
    place_fire(lighting, 42, 29)

    blocked = wall_cells | door_frame_collision | set(solid_objects)
    spawn_layers = build_spawn_layers(blocked)
    all_spawn_objects = [
        obj
        for objects in spawn_layers.values()
        for obj in objects
    ]
    assert_reachable(
        walkable,
        set(solid_objects) | door_frame_collision,
        all_spawn_objects,
    )

    region_objects = []
    next_region_id = len(all_spawn_objects) + 1
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
        "nextlayerid": 18,
        "nextobjectid": next_region_id,
        "layers": [
            tile_layer(1, "Floor", floor),
            tile_layer(2, "FloorDetails", floor_details),
            tile_layer(3, "WallsBack", walls_back),
            tile_layer(4, "WallDetails", wall_details),
            tile_layer(16, "Doors", doors),
            tile_layer(5, "Obstacles", obstacles),
            tile_layer(6, "Decoration", decoration),
            tile_layer(17, "WallsFront", walls_front),
            tile_layer(7, "Lighting", lighting),
            tile_layer(8, "Collision", collision, visible=False),
            tile_layer(
                15,
                "VisionBlockers",
                vision_blockers,
                visible=False,
                blocks_vision=True,
            ),
            {
                "id": 9,
                "name": "PlayerSpawns",
                "type": "objectgroup",
                "x": 0,
                "y": 0,
                "opacity": 1,
                "visible": True,
                "draworder": "topdown",
                "objects": spawn_layers["PlayerSpawns"],
            },
            {
                "id": 10,
                "name": "EnemySpawns",
                "type": "objectgroup",
                "x": 0,
                "y": 0,
                "opacity": 1,
                "visible": True,
                "draworder": "topdown",
                "objects": spawn_layers["EnemySpawns"],
            },
            {
                "id": 11,
                "name": "ChestSpawns",
                "type": "objectgroup",
                "x": 0,
                "y": 0,
                "opacity": 1,
                "visible": True,
                "draworder": "topdown",
                "objects": spawn_layers["ChestSpawns"],
            },
            {
                "id": 12,
                "name": "KeySpawns",
                "type": "objectgroup",
                "x": 0,
                "y": 0,
                "opacity": 1,
                "visible": True,
                "draworder": "topdown",
                "objects": spawn_layers["KeySpawns"],
            },
            {
                "id": 13,
                "name": "ExitGates",
                "type": "objectgroup",
                "x": 0,
                "y": 0,
                "opacity": 1,
                "visible": True,
                "draworder": "topdown",
                "objects": spawn_layers["ExitGates"],
            },
            {
                "id": 14,
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
    object_counts = {
        layer["name"]: len(layer["objects"])
        for layer in map_data["layers"]
        if layer["type"] == "objectgroup"
    }
    print(f"Generated {OUTPUT}")
    print(f"Map: {WIDTH}x{HEIGHT}; rooms: {len(ROOMS)}; objects: {object_counts}")


if __name__ == "__main__":
    main()
