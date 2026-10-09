import { PLAYER_CLASSES } from '../../game/config/playerClasses';
import { PlayerClass } from '../../game/types/player';

const CLASS_ABILITY_LABELS: Readonly<Record<PlayerClass, string>> = {
  [PlayerClass.Warrior]: 'Bloqueio',
  [PlayerClass.Archer]: 'Dash',
  [PlayerClass.Mage]: 'Proteção Arcana',
};

export interface HowToPlayActions {
  readonly confirmLabel: string;
  readonly onConfirm: () => void;
}

export class HowToPlayView {
  private readonly element: HTMLElement;
  private actionTaken = false;

  constructor(
    root: HTMLElement,
    playerClass: PlayerClass | null,
    actions: HowToPlayActions,
  ) {
    this.element = this.build(playerClass, actions);
    root.append(this.element);
  }

  destroy(): void {
    this.element.remove();
  }

  private build(
    playerClass: PlayerClass | null,
    actions: HowToPlayActions,
  ): HTMLElement {
    const wrapper = document.createElement('section');
    wrapper.className = 'how-to-play-screen';
    wrapper.setAttribute('role', 'dialog');
    wrapper.setAttribute('aria-modal', 'true');
    wrapper.setAttribute('aria-labelledby', 'how-to-play-title');

    const classDefinition = playerClass ? PLAYER_CLASSES[playerClass] : null;
    const abilityLabel = playerClass
      ? CLASS_ABILITY_LABELS[playerClass]
      : 'Habilidade da classe';

    wrapper.innerHTML = `
      <div class="how-to-play-panel">
        <p class="eyebrow">PREPARE-SE PARA A MASMORRA</p>
        <h2 id="how-to-play-title">COMO JOGAR</h2>
        <p class="how-to-play-intro">
          ${classDefinition
            ? `${classDefinition.label}: ${classDefinition.fantasy}`
            : 'Aprenda os comandos essenciais antes de entrar.'}
        </p>

        <div class="controls-grid">
          <div class="control-group">
            <h3>Movimento e combate</h3>
            <div class="control-row">
              <span class="key-combo"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span>
              <span>Mover</span>
            </div>
            <div class="control-row">
              <span class="key-combo"><kbd>MOUSE</kbd></span>
              <span>Mirar</span>
            </div>
            <div class="control-row">
              <span class="key-combo"><kbd>CLIQUE</kbd></span>
              <span>Atacar</span>
            </div>
            <div class="control-row control-row--ability">
              <span class="key-combo"><kbd>SPACE</kbd></span>
              <span>${abilityLabel}</span>
            </div>
          </div>

          <div class="control-group">
            <h3>Itens e exploração</h3>
            <div class="control-row">
              <span class="key-combo"><kbd>E</kbd></span>
              <span>Interagir</span>
            </div>
            <div class="control-row">
              <span class="key-combo"><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd></span>
              <span>Itens rápidos</span>
            </div>
            <div class="control-row">
              <span class="key-combo"><kbd>TAB</kbd></span>
              <span>Inventário</span>
            </div>
          </div>
        </div>

        <button class="tutorial-confirm-button" type="button">
          ${actions.confirmLabel}
        </button>
      </div>
    `;

    const confirmButton = wrapper.querySelector<HTMLButtonElement>(
      '.tutorial-confirm-button',
    );

    if (!confirmButton) {
      throw new Error('How-to-play confirmation button could not be created.');
    }

    confirmButton.addEventListener('click', () => {
      if (this.actionTaken) {
        return;
      }

      this.actionTaken = true;
      actions.onConfirm();
    });
    window.setTimeout(() => confirmButton.focus(), 0);

    return wrapper;
  }
}
