#!/usr/bin/env python3
"""Generate the editable Tiled dungeon map used by the Phaser runtime."""

from __future__ import annotations

from collections import deque
import json
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

WIDTH = 72
HEIGHT = 54
TILE_SIZE = 16

FLOOR_GID = WALLS_FIRST_GID + 138
WALL_GID = WALLS_FIRST_GID + 40

CRATE_VARIANTS = (
    "crate-light-wide",
    "crate-light-front",
    "crate-dark-wide",
    "crate-dark-front",
)
BARREL_VARIANTS = ("barrel-light", "barrel-dark")
BONE_VARIANTS = ("bones-left", "bones-right")
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


def add_tomb(objects: dict[tuple[int, int], int], x: int, y: int) -> None:
    add_prop(objects, "tomb-stone", x, y)


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
        ("PlayerSpawn_01", 36, 49),  # Entrada; active spawn used by Phaser today.
        ("PlayerSpawn_02", 38, 34),  # Salao central.
        ("PlayerSpawn_03", 35, 5),   # Cripta.
        ("PlayerSpawn_04", 11, 20),  # Prisoes.
        ("PlayerSpawn_05", 60, 10),  # Armazem.
        ("PlayerSpawn_06", 61, 46),  # Ruinas.
    ]
    for name, x, y in player_positions:
        assert (x, y) not in blocked, f"Player spawn blocked: {name}"
        player_spawns.append(point_object(object_id, name, "PLAYER", x, y, []))
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

    key_positions = [
        ("KeySpawn_01", 20, 8),
        ("KeySpawn_02", 40, 12),
        ("KeySpawn_03", 7, 18),
        ("KeySpawn_04", 65, 15),
        ("KeySpawn_05", 23, 40),
        ("KeySpawn_06", 59, 44),
    ]
    for name, x, y in key_positions:
        assert (x, y) not in blocked, f"Key spawn blocked: {name}"
        key_spawns.append(point_object(object_id, name, "KEY", x + 0.5, y + 0.5, []))
        object_id += 1

    exit_positions = [
        ("ExitGate_01", 17, 5),   # Noroeste / capela.
        ("ExitGate_02", 67, 7),   # Nordeste / armazem.
        ("ExitGate_03", 6, 49),   # Sudoeste / ossuario.
        ("ExitGate_04", 66, 45),  # Sudeste / ruinas.
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
    validate_craftpix_catalog()
    walkable, _ = build_walkable()
    wall_cells = surrounding_walls(walkable)

    floor = empty_grid()
    floor_details = empty_grid()
    walls = empty_grid()
    wall_details = empty_grid()
    obstacles = empty_grid()
    decoration = empty_grid()
    lighting = empty_grid()
    collision = empty_grid()

    for x, y in walkable:
        put(floor, x, y, FLOOR_GID)
    for x, y in wall_cells:
        put(walls, x, y, WALL_GID)
        put(collision, x, y, WALL_GID)

    solid_objects: dict[tuple[int, int], int] = {}

    # Central hall: paired stone-column tiles create real pillars and four
    # readable lanes through the room instead of placeholder barrels.
    for x, y in ((30, 25), (41, 25), (30, 33), (41, 33)):
        add_prop(solid_objects, "stone-column", x, y)

    # A compact fire shrine anchors the hub while leaving circulation on every
    # side. Its collision also turns the landmark into useful combat cover.
    for x, y in (
        (35, 29), (36, 29), (37, 29),
        (35, 30), (36, 30), (37, 30),
        (35, 31), (36, 31), (37, 31),
    ):
        solid_objects[(x, y)] = WALL_GID

    hub_crates = (
        ((34, 28), 1),
        ((38, 31), 0),
        ((32, 34), 2),
        ((40, 24), 3),
    )
    for position, variant in hub_crates:
        add_crate(solid_objects, *position, variant)

    # Entrance props frame the room without closing its north, west or east
    # exits, nor the clear space around PlayerSpawn_01.
    add_crate(solid_objects, 31, 51, 1)
    add_barrel(solid_objects, 40, 51)

    # Crypt tombs and cover.
    for start_x, y in ((29, 7), (37, 10), (18, 7)):
        add_tomb(solid_objects, start_x, y)
    for index, (x, y) in enumerate(((32, 11), (40, 5))):
        add_barrel(solid_objects, x, y, index)

    # Prison cover reinforces narrow encounters without sealing the cell doors
    # or either route back toward the hub and catacombs.
    prison_positions = [
        (5, 15), (7, 20), (11, 12), (12, 20),
        (17, 14), (19, 20), (23, 16), (23, 22),
    ]
    for index, position in enumerate(prison_positions):
        if index % 3 == 0:
            add_barrel(solid_objects, *position, index)
        else:
            add_crate(solid_objects, *position, 1 + (index % 2) * 2)

    # Storage stacks leave several navigable lanes.
    storage_positions = [
        (54, 8), (56, 8), (59, 8), (62, 11), (65, 12), (54, 16),
        (58, 17), (63, 17), (55, 23), (58, 25), (61, 23), (63, 26),
    ]
    for index, position in enumerate(storage_positions):
        if index % 3 == 0:
            add_barrel(solid_objects, *position, index)
        else:
            add_crate(solid_objects, *position, 1 + (index % 2) * 2)

    # Catacomb and ossuary obstacles.
    for index, position in enumerate((
        (7, 36), (13, 31), (18, 38), (23, 35), (9, 48), (15, 44),
        (6, 30), (10, 39), (18, 42), (24, 33), (7, 43), (15, 49),
    )):
        add_barrel(solid_objects, *position, index)

    # Broken ruins and scattered cover.
    ruin_positions = (
        (50, 34), (53, 44), (58, 37), (62, 40), (64, 44), (49, 46),
        (48, 38), (52, 33), (57, 35), (61, 47), (66, 35), (67, 44),
    )
    for index, position in enumerate(ruin_positions):
        if index in (1, 4, 8, 10):
            add_prop(solid_objects, "stone-column", *position)
        else:
            # Narrow orientations fit the irregular ruin floor without
            # spilling into its broken walls.
            add_crate(solid_objects, *position, 1 + (index % 2) * 2)

    for (x, y), gid in solid_objects.items():
        assert (x, y) in walkable, f"Obstacle outside floor: {(x, y)}"
        put(obstacles, x, y, gid, catalogued_prop=True)
        put(collision, x, y, WALL_GID)

    # Connected strips remain a single catalog object, so future edits cannot
    # accidentally place an isolated crack fragment.
    for start_x, y in (
        (29, 12),  # crypt
        (56, 14),  # storage
        (6, 37),   # catacombs
        (58, 45),  # ruins
    ):
        assert all((start_x + offset, y) in walkable for offset in range(8))
        place_prop(floor_details, "floor-crack-strip", start_x, y)

    # Small native floor marks give the entrance and hub a hand-built rhythm
    # without the artificial appearance of long repeated crack strips.
    floor_marks = [
        # Central hall
        (27, 24, 0), (33, 23, 1), (39, 23, 2), (44, 25, 3),
        (27, 29, 2), (32, 30, 3), (40, 29, 0), (44, 34, 1),
        (27, 36, 3), (33, 36, 0), (39, 35, 1), (45, 37, 2),
        # Entrance / spawn
        (31, 47, 2), (34, 48, 0), (38, 47, 3), (41, 49, 1),
        (32, 52, 1), (36, 51, 3), (39, 52, 0),
        # Crypt and chapel
        (18, 5, 0), (22, 7, 2), (28, 4, 1), (33, 6, 3),
        (39, 8, 0), (43, 12, 2), (30, 11, 1),
        # Prisons
        (5, 12, 3), (7, 17, 0), (11, 14, 2), (13, 21, 1),
        (17, 16, 0), (20, 14, 3), (22, 19, 1),
        # Storage wings
        (53, 7, 1), (57, 10, 3), (61, 7, 0), (66, 14, 2),
        (54, 18, 3), (59, 16, 1), (63, 19, 0),
        (54, 22, 2), (58, 24, 0), (62, 26, 3), (65, 23, 1),
        # Catacombs and ossuary
        (5, 31, 2), (10, 30, 0), (13, 37, 3), (7, 39, 1),
        (18, 33, 1), (20, 38, 2), (24, 41, 0),
        (6, 44, 3), (11, 47, 1), (15, 43, 2),
        # Ruins and optional chamber
        (49, 25, 0), (54, 27, 2), (58, 29, 3),
        (48, 33, 1), (51, 39, 3), (56, 46, 0), (60, 36, 2),
        (63, 43, 1), (67, 48, 3), (64, 24, 2), (68, 27, 0),
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
        # entrance supplies and small accents
        (30, 47, VASE_VARIANTS[0]), (41, 47, VASE_VARIANTS[2]),
        (33, 51, BONE_VARIANTS[0]), (39, 50, VASE_VARIANTS[1]),
        # central hall edge dressing leaves its combat lanes open
        (26, 23, VASE_VARIANTS[3]), (45, 23, VASE_VARIANTS[0]),
        (27, 35, BONE_VARIANTS[1]), (44, 36, VASE_VARIANTS[4]),
        # bones in crypt/catacombs
        (28, 5, BONE_VARIANTS[0]), (34, 9, BONE_VARIANTS[1]), (43, 12, BONE_VARIANTS[0]),
        (6, 32, BONE_VARIANTS[1]), (12, 38, BONE_VARIANTS[0]), (19, 41, BONE_VARIANTS[1]),
        (8, 44, BONE_VARIANTS[0]), (13, 43, BONE_VARIANTS[1]),
        # prison debris and sparse valuables
        (5, 18, BONE_VARIANTS[0]), (12, 13, VASE_VARIANTS[4]),
        (18, 22, BONE_VARIANTS[1]), (22, 14, GOLD_VARIANTS[2]),
        # storage pottery, loose gold and supplies
        (53, 12, VASE_VARIANTS[0]), (57, 13, VASE_VARIANTS[2]), (64, 9, VASE_VARIANTS[3]),
        (60, 22, VASE_VARIANTS[1]), (65, 27, VASE_VARIANTS[4]),
        (55, 18, GOLD_VARIANTS[2]), (61, 12, GOLD_VARIANTS[6]), (63, 24, GOLD_VARIANTS[0]),
        # crystals and rubble accents in ruins
        (49, 39, CRYSTAL_VARIANTS[0]), (63, 35, CRYSTAL_VARIANTS[1]),
        (54, 34, CRYSTAL_VARIANTS[1]), (66, 43, CRYSTAL_VARIANTS[0]),
        (50, 47, GOLD_VARIANTS[3]), (64, 47, GOLD_VARIANTS[1]),
        # optional chamber reward dressing
        (66, 25, VASE_VARIANTS[0]), (69, 25, GOLD_VARIANTS[6]),
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
        (31, 21), (41, 21), (24, 31), (47, 31),
        (31, 45), (41, 45),
        (29, 2), (43, 2),
        (5, 9), (25, 15),
        (53, 5), (68, 18),
        (5, 28), (17, 47),
        (68, 47),
    )
    for x, y in wall_torches:
        assert (x, y) in wall_cells, f"Torch is not mounted on a wall: {(x, y)}"
        place_fire(lighting, x, y)

    # The central fire is a brazier on a solid shrine, not a wall torch.
    place_fire(lighting, 36, 30)

    blocked = wall_cells | set(solid_objects)
    spawn_layers = build_spawn_layers(blocked)
    all_spawn_objects = [
        obj
        for objects in spawn_layers.values()
        for obj in objects
    ]
    assert_reachable(walkable, set(solid_objects), all_spawn_objects)

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
        "nextlayerid": 15,
        "nextobjectid": next_region_id,
        "layers": [
            tile_layer(1, "Floor", floor),
            tile_layer(2, "FloorDetails", floor_details),
            tile_layer(3, "Walls", walls),
            tile_layer(4, "WallDetails", wall_details),
            tile_layer(5, "Obstacles", obstacles),
            tile_layer(6, "Decoration", decoration),
            tile_layer(7, "Lighting", lighting),
            tile_layer(8, "Collision", collision, visible=False),
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
