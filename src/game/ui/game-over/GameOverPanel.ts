import Phaser from 'phaser';

import { GAME_HEIGHT, GAME_WIDTH } from '../../constants/game';
import type { PlayerClassDefinition } from '../../types/player';
import type { RunState } from '../../types/run';
import { RunEndReason } from '../../types/run';

export interface GameOverActions {
  readonly restart: () => void;
  readonly returnToMenu: () => void;
}

export class GameOverPanel {
  private readonly root: Phaser.GameObjects.Container;
  private actionTaken = false;

  constructor(
    scene: Phaser.Scene,
    run: RunState,
    playerClass: PlayerClassDefinition,
    actions: GameOverActions,
  ) {
    this.root = scene.add.container(0, 0);
    const escaped = run.endReason === RunEndReason.Escaped;
    const accentColor = escaped ? 0x63c985 : 0xc54f4f;
    const resultTitle = getResultTitle(run);

    const background = scene.add.grid(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      64,
      64,
      0x08090d,
      1,
      0x202936,
      0.3,
    );
    const veil = scene.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x050609,
      0.56,
    );
    const panel = scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 840, 570, 0x0c1118, 0.97)
      .setStrokeStyle(2, 0x4a3035);
    const accent = scene.add.rectangle(GAME_WIDTH / 2, 81, 840, 5, accentColor);
    const title = scene.add
      .text(GAME_WIDTH / 2, 132, resultTitle, {
        fontFamily: 'Georgia, serif',
        fontSize: resultTitle === 'GAME OVER' ? '64px' : '48px',
        fontStyle: 'bold',
        color: escaped ? '#78d99a' : '#d25d62',
      })
      .setOrigin(0.5);
    const subtitle = scene.add
      .text(GAME_WIDTH / 2, 190, getResultMessage(run), {
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        color: '#8995a4',
      })
      .setOrigin(0.5);
    const identity = scene.add
      .text(GAME_WIDTH / 2, 245, `${run.playerName}  ·  ${playerClass.label}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '25px',
        fontStyle: 'bold',
        color: playerClass.cssColor,
      })
      .setOrigin(0.5);

    this.root.add([background, veil, panel, accent, title, subtitle, identity]);
    this.createStatCard(scene, 355, 340, 'NÍVEL', String(run.level));
    this.createStatCard(scene, 545, 340, 'INIMIGOS', String(run.kills));
    this.createStatCard(scene, 735, 340, 'OURO', String(run.gold));
    this.createStatCard(
      scene,
      925,
      340,
      escaped ? 'TEMPO RESTANTE' : 'TEMPO',
      escaped
        ? formatDuration(Math.ceil(run.remainingTimeMs / 1000))
        : formatDuration(run.elapsedSeconds),
    );
    this.createButton(scene, 505, 500, 'JOGAR NOVAMENTE', actions.restart);
    this.createButton(scene, 775, 500, 'VOLTAR AO MENU', actions.returnToMenu);

    const footer = scene.add
      .text(GAME_WIDTH / 2, 592, 'Cada nova run começa sem progresso anterior.', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#6f7b89',
      })
      .setOrigin(0.5);
    this.root.add(footer);
  }

  destroy(): void {
    this.root.destroy();
  }

  private createStatCard(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    value: string,
  ): void {
    const background = scene.add
      .rectangle(x, y, 174, 94, 0x131b25)
      .setStrokeStyle(1, 0x354252);
    const labelText = scene.add
      .text(x, y - 25, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#8995a4',
      })
      .setOrigin(0.5);
    const valueText = scene.add
      .text(x, y + 15, value, {
        fontFamily: 'Georgia, serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#e7d6a6',
      })
      .setOrigin(0.5);

    this.root.add([background, labelText, valueText]);
  }

  private createButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    action: () => void,
  ): void {
    const button = scene.add
      .text(x, y, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#e8d28e',
        backgroundColor: '#202b38',
        padding: { x: 22, y: 15 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        button.setStyle({ backgroundColor: '#2d3b4c', color: '#fff1bd' });
      })
      .on(Phaser.Input.Events.POINTER_OUT, () => {
        button.setStyle({ backgroundColor: '#202b38', color: '#e8d28e' });
      })
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        if (this.actionTaken) {
          return;
        }

        this.actionTaken = true;
        action();
      });

    this.root.add(button);
  }
}

function getResultTitle(run: RunState): string {
  if (run.endReason === RunEndReason.Escaped) {
    return 'VOCÊ ESCAPOU DA MASMORRA';
  }

  if (run.endReason === RunEndReason.Collapsed) {
    return 'A MASMORRA DESMORONOU';
  }

  return 'GAME OVER';
}

function getResultMessage(run: RunState): string {
  if (run.endReason === RunEndReason.Escaped) {
    return 'Você escapou da masmorra com vida.';
  }

  if (run.endReason === RunEndReason.Collapsed) {
    return 'A masmorra desmoronou.';
  }

  return 'Você morreu.';
}

function formatDuration(elapsedSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(elapsedSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
