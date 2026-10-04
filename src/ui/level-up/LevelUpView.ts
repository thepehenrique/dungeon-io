import type { UpgradeDefinition } from '../../game/types/upgrade';

export class LevelUpView {
  private readonly element: HTMLElement;
  private selected = false;

  constructor(
    root: HTMLElement,
    level: number,
    upgrades: readonly UpgradeDefinition[],
    onSelect: (upgrade: UpgradeDefinition) => void,
  ) {
    this.element = this.build(level, upgrades, onSelect);
    root.replaceChildren(this.element);
  }

  destroy(): void {
    this.element.remove();
  }

  private build(
    level: number,
    upgrades: readonly UpgradeDefinition[],
    onSelect: (upgrade: UpgradeDefinition) => void,
  ): HTMLElement {
    const wrapper = document.createElement('section');
    wrapper.className = 'level-up-screen';
    wrapper.setAttribute('role', 'dialog');
    wrapper.setAttribute('aria-modal', 'true');
    wrapper.setAttribute('aria-labelledby', 'level-up-title');

    const cards = upgrades
      .map(
        (upgrade) => `
          <button class="upgrade-card" type="button" data-upgrade-id="${upgrade.id}">
            <span class="upgrade-card__symbol" aria-hidden="true">${upgrade.symbol}</span>
            <strong>${upgrade.label}</strong>
            <small>${upgrade.description}</small>
          </button>
        `,
      )
      .join('');

    wrapper.innerHTML = `
      <div class="level-up-panel">
        <p class="eyebrow">NÍVEL ${level} ALCANÇADO</p>
        <h2 id="level-up-title">ESCOLHA UM UPGRADE</h2>
        <p class="level-up-intro">Selecione uma melhoria para continuar a run.</p>
        <div class="upgrade-grid">${cards}</div>
      </div>
    `;

    const buttons = wrapper.querySelectorAll<HTMLButtonElement>('.upgrade-card');

    for (const button of buttons) {
      button.addEventListener('click', () => {
        if (this.selected) {
          return;
        }

        const upgrade = upgrades.find(
          (candidate) => candidate.id === button.dataset.upgradeId,
        );

        if (!upgrade) {
          return;
        }

        this.selected = true;

        for (const choice of buttons) {
          choice.disabled = true;
        }

        onSelect(upgrade);
      });
    }

    window.setTimeout(() => buttons.item(0)?.focus(), 0);
    return wrapper;
  }
}
