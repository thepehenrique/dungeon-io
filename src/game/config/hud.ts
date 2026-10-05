export const HUD_LAYOUT = {
  x: 18,
  y: 18,
  width: 390,
  height: 168,
  padding: 16,
  barX: 52,
  barWidth: 214,
  barHeight: 12,
  healthY: 78,
  experienceY: 111,
  statsY: 143,
  quickSlots: {
    bottom: 18,
    width: 122,
    height: 62,
    gap: 8,
  },
  ability: {
    gap: 12,
    width: 220,
    height: 62,
  },
} as const;

export const HUD_COLORS = {
  panel: 0x080c12,
  panelBorder: 0x34445a,
  slot: 0x0b1119,
  slotKey: '#e6c87a',
  barBackground: 0x202a35,
  health: 0xc94f55,
  experience: 0x62a8e5,
  primaryText: '#f4f5f7',
  secondaryText: '#a9b4c1',
  mutedText: '#7f8b99',
} as const;
