# Dungeon.io pixel-art UI kit

Dark-fantasy HUD and inventory frames generated for a 1280×720 viewport. All
files are RGBA PNGs with a genuinely transparent outer background. Dynamic text,
icons, HP, XP and cooldown values are intentionally absent.

## Assets

| File | Size | Intended use |
| --- | ---: | --- |
| `hud_top_frame.png` | 768×64 | Narrow top-edge identity, status and objective frame |
| `hud_bottom_frame.png` | 512×128 | Bottom-center frame for three quick slots and one ability |
| `slot_frame.png` | 64×64 | Normal reusable item slot |
| `slot_hover.png` | 64×64 | Hovered item slot |
| `slot_selected.png` | 64×64 | Selected item slot |
| `slot_cooldown.png` | 64×64 | Slot with a dark center overlay for cooldown state |
| `slot_disabled.png` | 64×64 | Desaturated disabled slot |
| `slot_states.png` | 320×64 | Horizontal spritesheet: normal, hover, selected, cooldown, disabled |
| `ability_slot.png` | 96×72 | Distinct class-ability frame |
| `hp_bar_frame.png` | 384×64 | HP border with transparent fill channel |
| `xp_bar_frame.png` | 384×40 | Thin XP border with transparent fill channel |
| `timer_frame.png` | 160×48 | Dynamic dungeon timer frame |
| `objective_frame.png` | 448×72 | Short objective-message ribbon |
| `inventory_panel.png` | 960×600 | Paused inventory layout with equipment, backpack, details and quick-slot regions |
| `ui_decorations_sheet.png` | 256×192 | 4×3 sheet of separators, corners and small accents |

`slot_states.json` records the spritesheet frame coordinates. Every slot frame is
64×64 and the frame order is fixed.

## Transparent regions

- Top, bottom, timer, objective and ability frames have transparent/open content
  regions for Phaser text or icons.
- HP and XP contain transparent channels. Render the colored fill behind the
  corresponding frame and crop or scale the fill dynamically.
- Normal, hover and selected slots have transparent centers. Cooldown and
  disabled intentionally add a state overlay within the center.
- Inventory equipment slots, backpack cells, item-details region and quick-slot
  cells remain open for HTML or Phaser content.

## Phaser usage

Load individual assets with `this.load.image`. Load the combined slot states as a
spritesheet with a frame size of 64×64:

```ts
this.load.image('hud-top-frame', 'assets/ui/hud_top_frame.png');
this.load.image('hp-bar-frame', 'assets/ui/hp_bar_frame.png');
this.load.spritesheet('slot-states', 'assets/ui/slot_states.png', {
  frameWidth: 64,
  frameHeight: 64,
});
```

Keep gameplay HUD images fixed to the viewport with `setScrollFactor(0)`. Place
the HP/XP fills below their frames, and render labels, values and item icons above
the frame depth. Scale with integer or half-integer factors when possible and use
nearest-neighbor texture filtering to retain crisp pixels.

## Generation prompt set

The built-in image generation workflow used a consistent production brief:
authentic crisp low-resolution pixel art; dark-fantasy medieval dungeon-crawler
UI; dark charcoal stone, aged iron, old wood, tiny rivets and restrained bronze;
front orthographic isolated frames; transparent background and empty dynamic
content regions; no fixed text, numbers, icons, filled bars, neon, blur, modern
gradients or watermark. Slot variants were derived from the normal frame while
requesting unchanged geometry and state-only color/overlay changes.

Final files were trimmed, resized with nearest-neighbor sampling and alpha-cut to
keep the edges crisp. High-resolution generation originals remain in Codex's
generated-image storage rather than in the game repository.
