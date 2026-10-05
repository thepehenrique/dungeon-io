import {
  ConsumableEffectType,
  ItemStat,
  ItemType,
  ModifierMode,
  type ItemModifier,
  type RegisteredItemDefinition,
} from '../types/item';

const STAT_LABELS: Readonly<Record<ItemStat, string>> = {
  [ItemStat.Damage]: 'Dano',
  [ItemStat.Defense]: 'Defesa',
  [ItemStat.MaxHealth]: 'Vida Máxima',
  [ItemStat.AttackSpeed]: 'Velocidade de Ataque',
  [ItemStat.MovementSpeed]: 'Velocidade de Movimento',
  [ItemStat.CriticalChance]: 'Chance de Crítico',
};

export function formatItemDetails(
  definition: RegisteredItemDefinition,
): string {
  switch (definition.type) {
    case ItemType.Equipment:
      return definition.modifiers.map(formatModifier).join('\n');
    case ItemType.Consumable:
      switch (definition.effect.type) {
        case ConsumableEffectType.Heal:
          return `Cura ${definition.effect.amount} HP`;
      }
    case ItemType.Backpack:
      return `Capacidade: ${definition.capacity} slots`;
  }
}

export function formatModifier(modifier: ItemModifier): string {
  const isPercentage =
    modifier.mode === ModifierMode.Percent ||
    modifier.stat === ItemStat.CriticalChance;
  const value = isPercentage
    ? `${formatNumber(modifier.value * 100)}%`
    : formatNumber(modifier.value);

  return `+${value} ${STAT_LABELS[modifier.stat]}`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
