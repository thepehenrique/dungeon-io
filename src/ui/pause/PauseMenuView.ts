export interface PauseMenuActions {
  readonly resume: () => void;
  readonly setMusicVolume: (volume: number) => void;
  readonly returnToMenu: () => void;
}

export class PauseMenuView {
  private readonly element: HTMLDialogElement;

  constructor(root: HTMLElement, volume: number, actions: PauseMenuActions) {
    this.element = document.createElement('dialog');
    this.element.className = 'pause-dialog';
    this.element.setAttribute('aria-labelledby', 'pause-title');
    this.element.innerHTML = `
      <p class="eyebrow">DUNGEON.IO</p>
      <h2 id="pause-title">JOGO PAUSADO</h2>
      <div class="pause-actions">
        <button type="button" data-action="resume" autofocus>Continuar</button>
        <button type="button" data-action="audio">Áudio</button>
        <button type="button" data-action="menu">Voltar ao Menu</button>
      </div>
      <div class="pause-audio" hidden>
        <label for="music-volume">Volume da música de fundo</label>
        <div class="pause-volume">
          <input id="music-volume" type="range" min="0" max="100" step="1">
          <output for="music-volume"></output>
        </div>
        <button type="button" data-action="back">Voltar</button>
      </div>
    `;
    const main = this.element.querySelector<HTMLElement>('.pause-actions')!;
    const audio = this.element.querySelector<HTMLElement>('.pause-audio')!;
    const title = this.element.querySelector<HTMLElement>('#pause-title')!;
    const slider = this.element.querySelector<HTMLInputElement>('input')!;
    const output = this.element.querySelector<HTMLOutputElement>('output')!;
    slider.value = String(Math.round(volume * 100));
    const updateLabel = () => {
      output.value = `${slider.value}%`;
      slider.setAttribute('aria-valuetext', output.value);
    };
    updateLabel();
    slider.addEventListener('input', () => {
      updateLabel();
      actions.setMusicVolume(Number(slider.value) / 100);
    });
    this.element.querySelector('[data-action="resume"]')!
      .addEventListener('click', actions.resume);
    this.element.querySelector('[data-action="menu"]')!
      .addEventListener('click', actions.returnToMenu);
    const audioButton = this.element.querySelector<HTMLButtonElement>('[data-action="audio"]')!;
    audioButton.addEventListener('click', () => {
      main.hidden = true;
      audio.hidden = false;
      title.textContent = 'ÁUDIO';
      slider.focus();
    });
    this.element.querySelector('[data-action="back"]')!.addEventListener('click', () => {
      audio.hidden = true;
      main.hidden = false;
      title.textContent = 'JOGO PAUSADO';
      audioButton.focus();
    });
    this.element.addEventListener('cancel', (event) => {
      event.preventDefault();
      actions.resume();
    });
    root.append(this.element);
    this.element.showModal();
  }

  destroy(): void {
    this.element.close();
    this.element.remove();
  }
}
