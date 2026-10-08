# Catacumbas map guide

## Tiled settings

- orientation: orthogonal
- map size: 84×58 tiles
- tile size: 16×16 px
- Phaser scale: 3
- world size: 4032×2784 px
- finite map, render order `right-down`

## Visual layer order

1. `Floor`
2. `Water`
3. `Walls`
4. `Details`
5. `Props`
6. `Traps`
7. `Doors`
8. `Fire`

Hidden technical layers:

- `Collision`: every physical wall, water edge and solid obstacle.
- `Gameplay`: authoring markers for rooms, lights, loot, doors and objectives.
- `VisionBlockers`: generated from collision for the existing vision system.

The runtime generator adds physical collision only to the ground-contact cells
of crates, barrels, vases, iron obstacles and stone stair props. These props
block the player, enemies, projectiles and item drops, but are deliberately not
copied to `VisionBlockers`, so they remain visible without producing black fog
wedges.

## Editing workflow

Edit `catacumbas-84x58-source.tmj`, not `dungeon-01.tmj`. Keep all PNG files in
the same directory, save the source in Tiled, then run:

```bash
python3 scripts/generate_dungeon_map.py
npm run build
```

The generator validates connectivity, keeps the player outside enemy detection
range, avoids collision/trap/solid-prop cells for enemy points and rebuilds the
runtime object layers. It generates one safe exit candidate per combat room,
rejecting areas that overlap walls, water, props, doors, fire, traps, runtime
entities or unreachable floor. The runtime randomly chooses one of these
candidates for each run. Visual changes made directly to `dungeon-01.tmj` will
be replaced the next time the importer runs.
