import { ITEM_RARITY_PRESENTATION } from '../../game/config/itemRarities';
import { getItemDefinition } from '../../game/items/ItemRegistry';
import { formatItemDetails } from '../../game/items/itemPresentation';
import type { EquipmentSystem } from '../../game/systems/EquipmentSystem';
import type {
  InventoryOperationResult,
  InventorySystem,
} from '../../game/systems/InventorySystem';
import {
  EquipmentSlot,
  ItemType,
  type RegisteredItemDefinition,
} from '../../game/types/item';

export interface InventoryActions {
  readonly equip: (index: number) => InventoryOperationResult;
  readonly unequip: (slot: EquipmentSlot) => InventoryOperationResult;
  readonly use: (definitionId: string) => InventoryOperationResult;
  readonly assignQuickSlot: (
    definitionId: string,
    index: number,
  ) => InventoryOperationResult;
  readonly clearQuickSlot: (index: number) => InventoryOperationResult;
  readonly discard: (index: number) => InventoryOperationResult;
  readonly close: () => void;
}

const EQUIPMENT_SLOTS = [
  EquipmentSlot.Weapon,
  EquipmentSlot.Armor,
] as const;

const EQUIPMENT_SLOT_LABELS: Readonly<Record<EquipmentSlot, string>> = {
  [EquipmentSlot.Weapon]: 'Arma',
  [EquipmentSlot.Armor]: 'Armadura',
};

export class InventoryView {
  private readonly element: HTMLElement;
  private selectedIndex: number | null = null;
  private feedback = '';
  private selectionTimer: number | null = null;

  constructor(
    root: HTMLElement,
    private readonly inventory: InventorySystem,
    private readonly equipment: EquipmentSystem,
    private readonly actions: InventoryActions,
  ) {
    this.element = document.createElement('section');
    this.element.className = 'inventory-screen';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-labelledby', 'inventory-title');
    root.replaceChildren(this.element);
    this.render();
  }

  render(): void {
    const slots = Array.from({ length: this.inventory.capacity }, (_, index) => {
      const slot = this.inventory.getSlot(index);

      if (!slot) {
        return `<div class="inventory-slot inventory-slot--empty"><span>Vazio</span></div>`;
      }

      const definition = this.inventory.getDefinition(slot);
      const rarity = ITEM_RARITY_PRESENTATION[definition.rarity];
      const selected = index === this.selectedIndex ? ' inventory-slot--selected' : '';
      const quantity = definition.type === ItemType.Consumable
        ? `<small>x${slot.quantity}</small>`
        : '';

      return `
        <button
          class="inventory-slot${selected}"
          type="button"
          data-inventory-index="${index}"
          style="--item-color: ${rarity.color}"
        >
          <strong>${escapeHtml(definition.name)}</strong>
          ${quantity}
          <em>${rarity.label}</em>
        </button>
      `;
    }).join('');

    const equippedRows = EQUIPMENT_SLOTS.map((slot) => {
      const equipped = this.equipment.getEquipped(slot);

      return `
        <div class="inventory-equipped-row">
          <span>${EQUIPMENT_SLOT_LABELS[slot]}</span>
          <strong>${equipped ? escapeHtml(equipped.definition.name) : 'Nenhum'}</strong>
          ${equipped && !equipped.isBase ? `<button type="button" data-unequip-slot="${slot}">Desequipar</button>` : ''}
        </div>
      `;
    }).join('');
    const backpack = this.inventory.backpack
      ? getItemDefinition(this.inventory.backpack.definitionId)
      : null;
    const quickSlots = [0, 1, 2].map((index) => {
      const definitionId = this.inventory.getQuickSlotDefinitionId(index);
      const definition = definitionId ? getItemDefinition(definitionId) : null;
      const quantity = definitionId
        ? this.inventory.getQuantity(definitionId)
        : 0;

      return `
        <div class="inventory-quick-slot">
          <span>[${index + 1}]</span>
          <strong>${definition ? escapeHtml(definition.name) : 'Vazio'}</strong>
          ${definition ? `<small>x${quantity}</small>` : ''}
          ${definition ? `<button type="button" data-clear-quick-index="${index}">Remover</button>` : ''}
        </div>
      `;
    }).join('');
    const selected = this.getSelectedDefinition();

    this.element.innerHTML = `
      <div class="inventory-panel">
        <header class="inventory-header">
          <div>
            <p class="eyebrow">GERENCIAMENTO DE EQUIPAMENTO</p>
            <h2 id="inventory-title">INVENTÁRIO</h2>
          </div>
          <div class="inventory-capacity">${this.inventory.usedSlots} / ${this.inventory.capacity}</div>
          <button class="inventory-close" type="button" data-close-inventory>Fechar [TAB]</button>
        </header>

        <div class="inventory-layout">
          <section class="inventory-section">
            <h3>Equipado</h3>
            <div class="inventory-equipped">
              ${equippedRows}
              <div class="inventory-equipped-row">
                <span>Mochila</span>
                <strong>${backpack ? escapeHtml(backpack.name) : 'Nenhuma'}</strong>
              </div>
            </div>

            <h3>Mochila</h3>
            <div class="inventory-grid">${slots}</div>
          </section>

          <aside class="inventory-details">
            ${this.renderDetails(selected)}
          </aside>
        </div>

        <section class="inventory-quick-section">
          <h3>Quick Slots</h3>
          <div class="inventory-quick-grid">${quickSlots}</div>
        </section>
        <p class="inventory-feedback" aria-live="polite">${escapeHtml(this.feedback)}</p>
      </div>
    `;

    this.bindEvents();
  }

  destroy(): void {
    if (this.selectionTimer !== null) {
      window.clearTimeout(this.selectionTimer);
    }

    this.element.remove();
  }

  private renderDetails(definition: RegisteredItemDefinition | null): string {
    if (!definition || this.selectedIndex === null) {
      return `
        <p class="eyebrow">DETALHES</p>
        <h3>Selecione um item</h3>
        <p class="inventory-details__empty">Escolha um slot para ver atributos e ações.</p>
      `;
    }

    const rarity = ITEM_RARITY_PRESENTATION[definition.rarity];
    const details = formatItemDetails(definition)
      .split('\n')
      .map((line) => `<li>${escapeHtml(line)}</li>`)
      .join('');
    const typeDetail = definition.type === ItemType.Equipment
      ? `<p>Slot: ${EQUIPMENT_SLOT_LABELS[definition.slot]}</p>`
      : '';
    let actions = '';

    if (definition.type === ItemType.Equipment) {
      actions = `
        <button type="button" data-item-action="equip">Equipar</button>
        <button type="button" data-item-action="discard" class="danger">Descartar</button>
      `;
    } else if (definition.type === ItemType.Consumable) {
      actions = `
        <button type="button" data-item-action="use">Usar</button>
        <div class="inventory-assign-actions">
          ${[0, 1, 2].map((index) => `<button type="button" data-quick-index="${index}">Slot ${index + 1}</button>`).join('')}
        </div>
        <button type="button" data-item-action="discard" class="danger">Descartar</button>
      `;
    }

    return `
      <p class="eyebrow">DETALHES</p>
      <h3 style="color: ${rarity.color}">${escapeHtml(definition.name)}</h3>
      <strong class="inventory-rarity" style="color: ${rarity.color}">${rarity.label.toUpperCase()}</strong>
      ${typeDetail}
      <ul>${details}</ul>
      <div class="inventory-actions">${actions}</div>
    `;
  }

  private bindEvents(): void {
    this.element
      .querySelector<HTMLButtonElement>('[data-close-inventory]')
      ?.addEventListener('click', this.actions.close);

    for (const button of this.element.querySelectorAll<HTMLButtonElement>('[data-inventory-index]')) {
      const index = Number(button.dataset.inventoryIndex);
      button.addEventListener('click', () => {
        if (this.selectionTimer !== null) {
          window.clearTimeout(this.selectionTimer);
        }

        this.selectionTimer = window.setTimeout(() => {
          this.selectedIndex = index;
          this.feedback = '';
          this.selectionTimer = null;
          this.render();
        }, 180);
      });
      button.addEventListener('dblclick', () => {
        if (this.selectionTimer !== null) {
          window.clearTimeout(this.selectionTimer);
          this.selectionTimer = null;
        }

        const definition = this.inventory.getDefinition(
          this.inventory.getSlot(index)!,
        );
        const result = definition.type === ItemType.Equipment
          ? this.actions.equip(index)
          : definition.type === ItemType.Consumable
            ? this.actions.use(definition.id)
            : null;

        if (result) {
          this.handleResult(result, definition.type === ItemType.Equipment);
        }
      });
    }

    for (const button of this.element.querySelectorAll<HTMLButtonElement>('[data-unequip-slot]')) {
      button.addEventListener('click', () => {
        const slot = button.dataset.unequipSlot as EquipmentSlot;
        this.handleResult(this.actions.unequip(slot), false);
      });
    }

    this.element
      .querySelector<HTMLButtonElement>('[data-item-action="equip"]')
      ?.addEventListener('click', () => {
        if (this.selectedIndex !== null) {
          this.handleResult(this.actions.equip(this.selectedIndex), true);
        }
      });
    this.element
      .querySelector<HTMLButtonElement>('[data-item-action="use"]')
      ?.addEventListener('click', () => {
        const definition = this.getSelectedDefinition();
        if (definition) {
          this.handleResult(this.actions.use(definition.id), false);
        }
      });
    this.element
      .querySelector<HTMLButtonElement>('[data-item-action="discard"]')
      ?.addEventListener('click', () => {
        if (this.selectedIndex !== null) {
          this.handleResult(this.actions.discard(this.selectedIndex), true);
        }
      });

    for (const button of this.element.querySelectorAll<HTMLButtonElement>('[data-quick-index]')) {
      button.addEventListener('click', () => {
        const definition = this.getSelectedDefinition();
        if (definition) {
          this.handleResult(
            this.actions.assignQuickSlot(
              definition.id,
              Number(button.dataset.quickIndex),
            ),
            false,
          );
        }
      });
    }

    for (const button of this.element.querySelectorAll<HTMLButtonElement>('[data-clear-quick-index]')) {
      button.addEventListener('click', () => {
        this.handleResult(
          this.actions.clearQuickSlot(
            Number(button.dataset.clearQuickIndex),
          ),
          false,
        );
      });
    }
  }

  private handleResult(
    result: InventoryOperationResult,
    clearSelection: boolean,
  ): void {
    this.feedback = result.message;

    if (result.success && clearSelection) {
      this.selectedIndex = null;
    } else if (
      this.selectedIndex !== null &&
      !this.inventory.getSlot(this.selectedIndex)
    ) {
      this.selectedIndex = null;
    }

    this.render();
  }

  private getSelectedDefinition(): RegisteredItemDefinition | null {
    if (this.selectedIndex === null) {
      return null;
    }

    const slot = this.inventory.getSlot(this.selectedIndex);
    return slot ? this.inventory.getDefinition(slot) : null;
  }
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"]/g,
    (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
    })[character] ?? character,
  );
}
