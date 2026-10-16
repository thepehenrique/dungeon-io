#!/usr/bin/env python3
"""Adapt the connected Tiled dungeon source to the Phaser runtime contract."""

from __future__ import annotations

from collections import deque
from copy import deepcopy
import json
from math import ceil, floor
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "public/assets/dungeon"
SOURCE = ASSET_DIR / "catacumbas-84x58-source.tmj"
OUTPUT = ASSET_DIR / "dungeon-01.tmj"

TILE_SIZE = 16
SAFE_SPAWN_DISTANCE_TILES = 11
REGION_ENEMY_POOLS = {
    "catacombs": ("GOBLIN", "SKELETON_WARRIOR", "ZOMBIE"),
    "goblin_den": ("GOBLIN",),
}
COLLISION_MARKER_GID = 607
COMPOSITION_TILESET_NAME = "Composicao"
# Only the ground-contact cells are physical. Upper artwork remains free so
# multi-tile props do not create oversized invisible walls.
SOLID_PROP_BASE_LOCAL_IDS = {
    # Barrel and single crate.
    16,
    20,
    # Stacked crates and the crate/barrel supply cluster.
    24,
    25,
    28,
    29,
    # Floor vases, iron obstacle and stone stair obstacle.
    80,
    84,
    88,
    89,
    124,
    125,
}
EXIT_BLOCKING_LAYERS = (
    "Collision",
    "Water",
    "Walls",
    "Details",
    "Props",
    "Doors",
    "Fire",
    "Traps",
)
RUNTIME_LAYER_NAMES = {
    "PlayerSpawns",
    "EnemySpawns",
    "ChestSpawns",
    "KeySpawns",
    "ExitGates",
    "Regions",
    "VisionBlockers",
}


def tiled_property(name: str, value: object, property_type: str) -> dict[str, object]:
    return {"name": name, "type": property_type, "value": value}


def point_object(
    object_id: int,
    name: str,
    object_type: str,
    x: float,
    y: float,
    properties: list[dict[str, object]] | None = None,
) -> dict[str, object]:
    return {
        "id": object_id,
        "name": name,
        "type": object_type,
        "x": x,
        "y": y,
        "width": 0,
        "height": 0,
        "rotation": 0,
        "visible": True,
        "point": True,
        "properties": properties or [],
    }


def object_layer(
    layer_id: int,
    name: str,
    objects: list[dict[str, object]],
) -> dict[str, object]:
    return {
        "id": layer_id,
        "name": name,
        "type": "objectgroup",
        "x": 0,
        "y": 0,
        "opacity": 1,
        "visible": name != "Regions",
        "draworder": "topdown",
        "objects": objects,
    }


def object_center(obj: dict[str, object]) -> tuple[float, float]:
    return (
        float(obj.get("x", 0)) + float(obj.get("width", 0)) / 2,
        float(obj.get("y", 0)) + float(obj.get("height", 0)) / 2,
    )


def properties_by_name(obj: dict[str, object]) -> dict[str, object]:
    return {
        str(prop["name"]): prop.get("value")
        for prop in obj.get("properties", [])
    }


def find_layer(map_data: dict[str, object], name: str) -> dict[str, object]:
    for layer in map_data["layers"]:
        if layer.get("name") == name:
            return layer
    raise ValueError(f"Required Tiled layer is missing: {name}")


def tileset_first_gid(map_data: dict[str, object], name: str) -> int:
    for tileset in map_data["tilesets"]:
        if tileset.get("name") == name:
            return int(tileset["firstgid"])
    raise ValueError(f"Required Tiled tileset is missing: {name}")


def add_solid_prop_collisions(
    map_data: dict[str, object],
    props: list[int],
    collision: list[int],
) -> int:
    composition_first_gid = tileset_first_gid(
        map_data,
        COMPOSITION_TILESET_NAME,
    )
    added = 0

    for index, gid in enumerate(props):
        local_id = gid - composition_first_gid
        if local_id not in SOLID_PROP_BASE_LOCAL_IDS or collision[index] != 0:
            continue
        collision[index] = COLLISION_MARKER_GID
        added += 1

    return added


def is_open_cell(
    x: int,
    y: int,
    width: int,
    height: int,
    collision: list[int],
    traps: list[int],
) -> bool:
    if not (0 <= x < width and 0 <= y < height):
        return False
    index = y * width + x
    return collision[index] == 0 and traps[index] == 0


def choose_room_spawns(
    room: dict[str, object],
    width: int,
    height: int,
    collision: list[int],
    traps: list[int],
    player_position: tuple[float, float],
    count: int = 4,
) -> list[tuple[float, float]]:
    min_x = ceil(float(room["x"]) / TILE_SIZE) + 1
    min_y = ceil(float(room["y"]) / TILE_SIZE) + 1
    max_x = floor((float(room["x"]) + float(room["width"])) / TILE_SIZE) - 2
    max_y = floor((float(room["y"]) + float(room["height"])) / TILE_SIZE) - 2
    safe_distance_squared = (SAFE_SPAWN_DISTANCE_TILES * TILE_SIZE) ** 2

    candidates: list[tuple[int, int]] = []
    for tile_y in range(min_y, max_y + 1):
        for tile_x in range(min_x, max_x + 1):
            if not all(is_open_cell(tile_x+dx, tile_y+dy, width, height, collision, traps)
                       for dx, dy in ((0,0), (-1,0), (1,0), (0,-1), (0,1))):
                continue
            x = (tile_x + 0.5) * TILE_SIZE
            y = (tile_y + 0.5) * TILE_SIZE
            if (x - player_position[0]) ** 2 + (y - player_position[1]) ** 2 <= safe_distance_squared:
                continue
            candidates.append((tile_x, tile_y))

    if len(candidates) < count:
        raise ValueError(f"Room {room['name']!r} needs {count} enemy cells")

    anchors = (
        (min_x, min_y),
        (max_x, min_y),
        (min_x, max_y),
        (max_x, max_y),
    )
    selected: list[tuple[int, int]] = []
    for index in range(count):
        anchor_x, anchor_y = anchors[index % len(anchors)]
        available = [candidate for candidate in candidates if candidate not in selected]
        selected.append(
            min(
                available,
                key=lambda cell: (cell[0] - anchor_x) ** 2 + (cell[1] - anchor_y) ** 2,
            )
        )

    return [
        ((tile_x + 0.5) * TILE_SIZE, (tile_y + 0.5) * TILE_SIZE)
        for tile_x, tile_y in selected
    ]


def reachable_cells(
    start: tuple[int, int],
    width: int,
    height: int,
    collision: list[int],
) -> set[tuple[int, int]]:
    if not is_open_cell(start[0], start[1], width, height, collision, [0] * len(collision)):
        raise ValueError(f"Player spawn is blocked at {start}")

    visited = {start}
    queue = deque([start])
    while queue:
        x, y = queue.popleft()
        for candidate in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if candidate in visited:
                continue
            if is_open_cell(candidate[0], candidate[1], width, height, collision, [0] * len(collision)):
                visited.add(candidate)
                queue.append(candidate)
    return visited


def exit_footprint(tile_x: int, tile_y: int) -> set[tuple[int, int]]:
    """Cells occupied by the door art plus its interaction approach."""
    return {
        (x, y)
        for y in range(tile_y - 3, tile_y + 2)
        for x in range(tile_x - 1, tile_x + 2)
    }


def choose_exit_cell(
    room: dict[str, object],
    width: int,
    height: int,
    floor_data: list[int],
    blocking_layers: list[list[int]],
    reachable: set[tuple[int, int]],
    reserved: set[tuple[int, int]],
) -> tuple[int, int]:
    min_x = ceil(float(room["x"]) / TILE_SIZE) + 1
    min_y = ceil(float(room["y"]) / TILE_SIZE) + 3
    max_x = floor((float(room["x"]) + float(room["width"])) / TILE_SIZE) - 2
    max_y = floor((float(room["y"]) + float(room["height"])) / TILE_SIZE) - 2

    candidates: list[tuple[int, int]] = []
    for tile_y in range(min_y, max_y + 1):
        for tile_x in range(min_x, max_x + 1):
            footprint = exit_footprint(tile_x, tile_y)
            if not footprint.issubset(reachable):
                continue
            if footprint & reserved:
                continue
            if any(
                not (0 <= x < width and 0 <= y < height)
                or floor_data[y * width + x] == 0
                or any(layer[y * width + x] != 0 for layer in blocking_layers)
                for x, y in footprint
            ):
                continue
            candidates.append((tile_x, tile_y))

    if not candidates:
        raise ValueError(f"Room {room['name']!r} has no safe exit-door area")

    def safety_score(cell: tuple[int, int]) -> tuple[int, int]:
        nearest_reserved = min(
            ((cell[0] - x) ** 2 + (cell[1] - y) ** 2 for x, y in reserved),
            default=width * width + height * height,
        )
        return nearest_reserved, -cell[1]

    return max(candidates, key=safety_score)


def build_runtime_map(source: dict[str, object]) -> dict[str, object]:
    map_data = deepcopy(source)
    map_data["layers"] = [
        layer
        for layer in map_data["layers"]
        if layer.get("name") not in RUNTIME_LAYER_NAMES
    ]

    gameplay = find_layer(map_data, "Gameplay")
    gameplay["visible"] = False
    collision_layer = find_layer(map_data, "Collision")
    traps_layer = find_layer(map_data, "Traps")
    props_layer = find_layer(map_data, "Props")
    vision_collision = list(collision_layer["data"])
    width = int(map_data["width"])
    height = int(map_data["height"])
    for layer in map_data["layers"]:
        if layer.get("type") == "tilelayer" and (
            layer["width"] != width or layer["height"] != height
            or len(layer["data"]) != width * height
        ):
            raise ValueError(f"Invalid dimensions for layer {layer['name']}")
    gameplay_objects = list(gameplay["objects"])
    for obj in gameplay_objects:
        if properties_by_name(obj).get("blocksVision") is False:
            for y in range(int(obj["y"] // TILE_SIZE), ceil((obj["y"] + obj["height"]) / TILE_SIZE)):
                for x in range(int(obj["x"] // TILE_SIZE), ceil((obj["x"] + obj["width"]) / TILE_SIZE)):
                    vision_collision[y * width + x] = 0

    # Interactive runtime entities replace their static Tiled artwork. Keeping
    # both would leave a closed chest/key underneath after interaction.
    for obj in gameplay_objects:
        tile_x = int(float(obj.get("x", 0)) // TILE_SIZE)
        tile_y = int(float(obj.get("y", 0)) // TILE_SIZE)
        if obj.get("type") == "loot" and obj.get("name") == "chest":
            tile_width = max(1, ceil(float(obj.get("width", 0)) / TILE_SIZE))
            for y in (tile_y - 1, tile_y):
                for x in range(tile_x, tile_x + tile_width):
                    props_layer["data"][y * width + x] = 0
        elif obj.get("type") == "key_spawn":
            props_layer["data"][tile_y * width + tile_x] = 0

    solid_prop_collision_count = add_solid_prop_collisions(
        map_data,
        list(props_layer["data"]),
        collision_layer["data"],
    )
    if solid_prop_collision_count == 0:
        raise ValueError("No physical CraftPix props were found in the map")
    collision = list(collision_layer["data"])
    traps = list(traps_layer["data"])

    source_player = next(
        obj for obj in gameplay_objects if obj.get("type") == "player_spawn"
    )
    player_x, player_y = object_center(source_player)
    player_position = (player_x, player_y)
    visited = reachable_cells(
        (int(player_x // TILE_SIZE), int(player_y // TILE_SIZE)),
        width,
        height,
        collision,
    )

    rooms = [obj for obj in gameplay_objects if obj.get("type") == "room"]
    combat_rooms = [
        room
        for room in rooms
        if room.get("name") not in {"Vestibulo", "Segredo"}
        and properties_by_name(room).get("combat", True)
    ]
    region_definitions = [o for o in gameplay_objects if o.get("type") == "region"]
    room_budgets = {}
    for region in region_definitions:
        config = properties_by_name(region)
        region_id = config["region"]
        if region_id not in REGION_ENEMY_POOLS:
            raise ValueError(f"Unknown enemy region: {region_id}")
        regional_rooms = [r for r in combat_rooms if properties_by_name(r).get("region") == region_id]
        budget = int(config.get("enemyBudget", 0))
        if budget < 0:
            raise ValueError("Regional enemy budgets cannot be negative")
        if budget and not regional_rooms:
            raise ValueError(f"Region {region_id} has a budget but no combat rooms")
        weights = [int(properties_by_name(r).get("enemyWeight", 1)) for r in regional_rooms]
        if any(w <= 0 for w in weights):
            raise ValueError("Combat room weights must be positive")
        allocated = [budget * w // sum(weights) for w in weights]
        for i in range(budget - sum(allocated)):
            allocated[i % len(allocated)] += 1
        room_budgets.update({r['id']: n for r,n in zip(regional_rooms, allocated)})
    if any(r['id'] not in room_budgets for r in combat_rooms):
        raise ValueError("Every combat room must belong to a configured region")

    next_object_id = max(int(map_data.get("nextobjectid", 1)),
                         max((o["id"] for o in gameplay_objects), default=0) + 1)

    def next_id() -> int:
        nonlocal next_object_id
        value = next_object_id
        next_object_id += 1
        return value

    player_spawns = [
        point_object(
            next_id(),
            "PlayerSpawn_01",
            "PLAYER",
            player_x,
            player_y,
            [tiled_property("safeStart", True, "bool")],
        )
    ]

    enemy_spawns: list[dict[str, object]] = []
    enemy_index = 0
    for room in combat_rooms:
        region_id = properties_by_name(room)["region"]
        pool = REGION_ENEMY_POOLS[region_id]
        for x, y in choose_room_spawns(
            room,
            width,
            height,
            collision,
            traps,
            player_position,
            room_budgets[room["id"]],
        ):
            enemy_type = pool[enemy_index % len(pool)]
            enemy_spawns.append(
                point_object(
                    next_id(),
                    f"{enemy_type.title()}_{enemy_index + 1:02d}",
                    "ENEMY",
                    x,
                    y,
                    [
                        tiled_property("enemyType", enemy_type, "string"),
                        tiled_property("region", region_id, "string"),
                        tiled_property("level", 1, "int"),
                    ],
                )
            )
            enemy_index += 1

    source_chests = [
        obj
        for obj in gameplay_objects
        if obj.get("type") == "loot" and obj.get("name") == "chest"
    ]
    chest_spawns = []
    for index, chest in enumerate(source_chests, start=1):
        x = float(chest.get("x", 0)) + float(chest.get("width", 0)) / 2
        y = float(chest.get("y", 0)) + float(chest.get("height", 0))
        chest_spawns.append(
            point_object(
                next_id(),
                f"ChestSpawn_{index:02d}",
                "CHEST",
                x,
                y,
                [tiled_property("rarity", "COMMON", "string")],
            )
        )

    source_keys = [obj for obj in gameplay_objects if obj.get("type") == "key_spawn"]
    key_spawns = []
    for index, key in enumerate(source_keys, start=1):
        x, y = object_center(key)
        key_spawns.append(point_object(next_id(), f"KeySpawn_{index:02d}", "KEY", x, y))

    reserved_cells = {
        (int(float(spawn["x"]) // TILE_SIZE), int(float(spawn["y"]) // TILE_SIZE))
        for spawn in player_spawns + enemy_spawns + chest_spawns + key_spawns
    }
    blocking_layers = [
        list(find_layer(map_data, layer_name)["data"])
        for layer_name in EXIT_BLOCKING_LAYERS
    ]
    floor_data = list(find_layer(map_data, "Floor")["data"])
    exit_spawns = []
    for index, room in enumerate(
        [r for r in combat_rooms if properties_by_name(r).get("region") == "catacombs"], start=1
    ):
        tile_x, tile_y = choose_exit_cell(
            room,
            width,
            height,
            floor_data,
            blocking_layers,
            visited,
            reserved_cells,
        )
        x = (tile_x + 0.5) * TILE_SIZE
        y = (tile_y + 0.5) * TILE_SIZE
        exit_spawns.append(
            point_object(
                next_id(),
                f"ExitGate_{index:02d}",
                "EXIT_GATE",
                x,
                y,
                [tiled_property("room", str(room["name"]), "string")],
            )
        )

    region_objects: list[dict[str, object]] = []
    for room in region_definitions:
        region = deepcopy(room)
        region["id"] = next_id()
        region["type"] = "REGION"
        region_objects.append(region)

    vision_layer = deepcopy(collision_layer)
    vision_layer["id"] = max(int(map_data.get("nextlayerid", 1)),
                             max(l["id"] for l in map_data["layers"]) + 1)
    vision_layer["name"] = "VisionBlockers"
    vision_layer["visible"] = False
    vision_layer["data"] = vision_collision
    vision_layer["properties"] = [
        tiled_property("blocksVision", True, "bool")
    ]

    next_layer_id = vision_layer["id"] + 1
    runtime_layers = [
        vision_layer,
        object_layer(next_layer_id, "PlayerSpawns", player_spawns),
        object_layer(next_layer_id + 1, "EnemySpawns", enemy_spawns),
        object_layer(next_layer_id + 2, "ChestSpawns", chest_spawns),
        object_layer(next_layer_id + 3, "KeySpawns", key_spawns),
        object_layer(next_layer_id + 4, "ExitGates", exit_spawns),
        object_layer(next_layer_id + 5, "Regions", region_objects),
    ]
    map_data["layers"].extend(runtime_layers)
    map_data["nextlayerid"] = next_layer_id + 6
    map_data["nextobjectid"] = next_object_id

    for spawn in enemy_spawns:
        cell = (int(float(spawn["x"]) // TILE_SIZE), int(float(spawn["y"]) // TILE_SIZE))
        if cell not in visited:
            raise ValueError(f"Enemy spawn is unreachable: {spawn['name']} at {cell}")
        region_id = properties_by_name(spawn)["region"]
        areas = [r for r in region_definitions if properties_by_name(r)["region"] == region_id]
        if not any(r['x'] <= spawn['x'] < r['x'] + r['width']
                   and r['y'] <= spawn['y'] < r['y'] + r['height'] for r in areas):
            raise ValueError(f"Enemy spawn outside its region: {spawn['name']}")

    for spawn in exit_spawns:
        cell = (int(float(spawn["x"]) // TILE_SIZE), int(float(spawn["y"]) // TILE_SIZE))
        if not exit_footprint(*cell).issubset(visited):
            raise ValueError(f"Exit footprint is unreachable: {spawn['name']} at {cell}")
        if exit_footprint(*cell) & reserved_cells:
            raise ValueError(f"Exit overlaps a runtime entity: {spawn['name']} at {cell}")

    nearest_enemy_squared = min(
        (float(spawn["x"]) - player_x) ** 2 + (float(spawn["y"]) - player_y) ** 2
        for spawn in enemy_spawns
    )
    if nearest_enemy_squared <= (SAFE_SPAWN_DISTANCE_TILES * TILE_SIZE) ** 2:
        raise ValueError("Player spawn is not outside enemy detection range")

    return map_data


def main() -> None:
    source = json.loads(SOURCE.read_text())
    runtime_map = build_runtime_map(source)
    OUTPUT.write_text(json.dumps(runtime_map, ensure_ascii=False, indent=2) + "\n")
    collision_data = find_layer(runtime_map, "Collision")["data"]
    vision_data = find_layer(runtime_map, "VisionBlockers")["data"]
    solid_prop_cells = sum(
        1
        for collision, vision in zip(collision_data, vision_data)
        if collision and not vision
    )
    print(f"Generated {OUTPUT}")
    print(
        f"Map: {runtime_map['width']}x{runtime_map['height']}; "
        f"rooms: {sum(o.get('type') == 'room' for o in find_layer(runtime_map, 'Gameplay')['objects'])}; "
        f"enemies: {len(find_layer(runtime_map, 'EnemySpawns')['objects'])}; "
        f"chests: {len(find_layer(runtime_map, 'ChestSpawns')['objects'])}; "
        f"keys: {len(find_layer(runtime_map, 'KeySpawns')['objects'])}; "
        f"exits: {len(find_layer(runtime_map, 'ExitGates')['objects'])}; "
        f"solid prop cells: {solid_prop_cells}"
    )


if __name__ == "__main__":
    main()
