export const UI_ASSETS = {
  hudTop: {
    key: 'ui-hud-top-frame',
    path: 'assets/ui/hud_top_frame.png',
  },
  hudBottom: {
    key: 'ui-hud-bottom-frame',
    path: 'assets/ui/hud_bottom_frame.png',
  },
  slot: {
    key: 'ui-slot-frame',
    path: 'assets/ui/slot_frame.png',
  },
  abilitySlot: {
    key: 'ui-ability-slot',
    path: 'assets/ui/ability_slot.png',
  },
  healthBar: {
    key: 'ui-health-bar-frame',
    path: 'assets/ui/hp_bar_frame.png',
  },
  experienceBar: {
    key: 'ui-experience-bar-frame',
    path: 'assets/ui/xp_bar_frame.png',
  },
  timer: {
    key: 'ui-timer-frame',
    path: 'assets/ui/timer_frame.png',
  },
  objective: {
    key: 'ui-objective-frame',
    path: 'assets/ui/objective_frame.png',
  },
} as const;

export const PHASER_UI_ASSETS = [
  UI_ASSETS.slot,
  UI_ASSETS.abilitySlot,
  UI_ASSETS.healthBar,
  UI_ASSETS.experienceBar,
  UI_ASSETS.timer,
] as const;
