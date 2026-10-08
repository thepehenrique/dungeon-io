import { PLAYER_CLASS_LIST } from "../../game/config/playerClasses";
import { PlayerClass } from "../../game/types/player";

export interface MenuSubmission {
  readonly playerName: string;
  readonly playerClass: PlayerClass;
}

export class MenuView {
  private readonly root: HTMLElement;
  private readonly element: HTMLElement;
  private readonly onSubmit: (submission: MenuSubmission) => void;

  constructor(
    root: HTMLElement,
    onSubmit: (submission: MenuSubmission) => void
  ) {
    this.root = root;
    this.onSubmit = onSubmit;
    this.element = this.build();
    this.root.replaceChildren(this.element);
  }

  destroy(): void {
    this.element.remove();
  }

  private build(): HTMLElement {
    const wrapper = document.createElement("section");
    wrapper.className = "menu-screen";

    const classOptions = PLAYER_CLASS_LIST.map(
      ({ id, label, fantasy, cssColor, portraitAssetPath, portraitScale }) => `
        <label
          class="class-card"
          style="--class-color: ${cssColor}; --class-portrait: url('${portraitAssetPath}'); --portrait-scale: ${portraitScale}"
        >
          <input type="radio" name="player-class" value="${id}" />
          <span class="class-card__content">
            <span class="class-card__portrait" aria-hidden="true">
              <span class="class-card__portrait-image"></span>
            </span>
            <span class="class-card__copy">
              <strong>${label}</strong>
              <small>${fantasy}</small>
            </span>
          </span>
        </label>
      `
    ).join("");

    wrapper.innerHTML = `
      <div class="menu-panel">
        <p class="eyebrow">UMA NOVA RUN AGUARDA</p>
        <h1>DUNGEON<span>.IO</span></h1>
        <p class="menu-intro">Escolha quem atravessará os portões da masmorra.</p>

        <form class="menu-form" novalidate>
          <label class="field-label" for="player-name">Nome do Aventureiro</label>
          <input
            id="player-name"
            class="name-input"
            name="player-name"
            type="text"
            maxlength="20"
            autocomplete="off"
            placeholder="Digite seu nome"
          />

          <fieldset>
            <legend>Escolha sua classe</legend>
            <div class="class-grid">${classOptions}</div>
          </fieldset>

          <p class="form-error" role="alert" aria-live="polite"></p>
          <button class="play-button" type="submit">JOGAR</button>
        </form>
      </div>
    `;

    const form = wrapper.querySelector<HTMLFormElement>("form");
    const nameInput = wrapper.querySelector<HTMLInputElement>("#player-name");
    const errorElement = wrapper.querySelector<HTMLElement>(".form-error");

    if (!form || !nameInput || !errorElement) {
      throw new Error("Menu elements could not be created.");
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const selectedClass = form.querySelector<HTMLInputElement>(
        'input[name="player-class"]:checked'
      );
      const playerName = nameInput.value.trim();

      if (!playerName || !selectedClass) {
        errorElement.textContent = "Informe seu nome e selecione uma classe.";
        return;
      }

      errorElement.textContent = "";
      this.onSubmit({
        playerName,
        playerClass: selectedClass.value as PlayerClass,
      });
    });

    window.setTimeout(() => nameInput.focus(), 0);
    return wrapper;
  }
}
