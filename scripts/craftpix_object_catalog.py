"""Authoritative compositions for CraftPix dungeon props used by the map.

The source atlases are tile-aligned, but many visual objects cross two or more
16 px cells. Map code must place a catalog entry instead of copying an isolated
tile id, otherwise Phaser renders only a fragment of the prop.
"""

from __future__ import annotations

from dataclasses import dataclass


WALLS_FIRST_GID = 1
OBJECTS_FIRST_GID = 494
CRACKS_FIRST_GID = 710
FIRE_FIRST_GID = 830


@dataclass(frozen=True)
class CraftPixProp:
    tileset: str
    first_gid: int
    tiles: tuple[tuple[int | None, ...], ...]
    direction: str
    solid: bool = False

    @property
    def width(self) -> int:
        return len(self.tiles[0])

    @property
    def height(self) -> int:
        return len(self.tiles)


def _rows(*rows: tuple[int | None, ...]) -> tuple[tuple[int | None, ...], ...]:
    return rows


CRAFTPIX_PROPS: dict[str, CraftPixProp] = {
    # Crates: light/dark palettes with wide and front-facing proportions.
    "crate-light-wide": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((123, 124), (147, 148)), "wide", True
    ),
    "crate-light-front": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((126,), (150,)), "front", True
    ),
    "crate-dark-wide": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((128, 129), (152, 153)), "wide", True
    ),
    "crate-dark-front": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((131,), (155,)), "front", True
    ),
    "barrel-light": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((127,), (151,)), "front", True
    ),
    "barrel-dark": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((132,), (156,)), "front", True
    ),
    "tomb-stone": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((121, 122), (145, 146)), "front", True
    ),
    "stone-column": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((121, 122), (145, 146)), "front", True
    ),

    # Floor decoration. Several props straddle atlas cell boundaries even
    # though their visible pixels are small, so every occupied cell is listed.
    "vase-blue-large": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((133,), (157,)), "front"
    ),
    "vase-blue-medium": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((134,), (158,)), "front"
    ),
    "vase-brown-large": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((136,), (160,)), "front"
    ),
    "vase-brown-medium": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((137,), (161,)), "front"
    ),
    "vase-brown-small": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((138,), (162,)), "front"
    ),
    "gold-flat-wide": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((35, 36), (59, 60)), "wide"
    ),
    "gold-pile-wide": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((37, 38), (61, 62)), "wide"
    ),
    "gold-pile-medium": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((39,), (63,)), "front"
    ),
    "gold-pile-compact": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((40,), (64,)), "front"
    ),
    "gold-scattered-wide": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((85, 86), (109, 110)), "wide"
    ),
    "gold-scattered-small": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((87,), (111,)), "front"
    ),
    "gold-pile-small": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((88,),), "front"
    ),
    "crystal-small": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((174,), (198,)), "front"
    ),
    "crystal-large": CraftPixProp(
        "Objects", OBJECTS_FIRST_GID, _rows((175,),), "front"
    ),

    # Connected floor/wall effects.
    "floor-crack-strip": CraftPixProp(
        "decorative_cracks_floor",
        CRACKS_FIRST_GID,
        _rows((88, 89, 90, 91, 92, 93, 94, 95),),
        "horizontal",
    ),
    "fire-small": CraftPixProp(
        "fire_animation",
        FIRE_FIRST_GID,
        _rows((0, 1, 2), (11, 12, 13), (22, 23, 24)),
        "front",
    ),
}

for mark_index, local_id in enumerate((228, 229, 230, 231)):
    CRAFTPIX_PROPS[f"floor-mark-{mark_index}"] = CraftPixProp(
        "walls_floor", WALLS_FIRST_GID, _rows((local_id,),), "floor"
    )


TILESET_TILE_COUNTS = {
    "walls_floor": 493,
    "Objects": 216,
    "decorative_cracks_floor": 120,
    "fire_animation": 198,
}


def validate_craftpix_catalog() -> None:
    """Fail fast when a future prop is malformed or references another atlas."""
    for key, prop in CRAFTPIX_PROPS.items():
        if not prop.tiles or not prop.tiles[0]:
            raise ValueError(f"CraftPix prop {key!r} has no tiles")

        row_width = len(prop.tiles[0])
        if any(len(row) != row_width for row in prop.tiles):
            raise ValueError(f"CraftPix prop {key!r} is not rectangular")

        tile_count = TILESET_TILE_COUNTS[prop.tileset]
        for row in prop.tiles:
            for local_id in row:
                if local_id is not None and not 0 <= local_id < tile_count:
                    raise ValueError(
                        f"CraftPix prop {key!r} uses invalid local tile {local_id}"
                    )


def prop_cells(
    key: str, x: int, y: int
) -> tuple[tuple[int, int, int], ...]:
    prop = CRAFTPIX_PROPS[key]
    cells: list[tuple[int, int, int]] = []
    for offset_y, row in enumerate(prop.tiles):
        for offset_x, local_id in enumerate(row):
            if local_id is not None:
                cells.append((x + offset_x, y + offset_y, prop.first_gid + local_id))
    return tuple(cells)
