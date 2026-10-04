import Phaser from 'phaser';

import { PLAYER_CLASSES } from '../config/playerClasses';
import { GAME_WIDTH, SCENE_KEYS } from '../constants/game';
import { getGameSession } from '../state/getGameSession';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.GAME_OVER);
  }

  create(): void {
    const session = getGameSession(this);
    const run = session.getRun();

    if (!run) {
      this.scene.start(SCENE_KEYS.MENU);
      return;
    }

    const classDefinition = PLAYER_CLASSES[run.playerClass];

    this.cameras.main.setBackgroundColor('#08090d');
    this.add
      .text(GAME_WIDTH / 2, 150, 'GAME OVER', {
        fontFamily: 'Georgia, serif',
        fontSize: '68px',
        color: '#c54f4f',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        320,
        [
          run.playerName,
          classDefinition.label,
          `Nível ${run.level}`,
          `Tempo: ${run.elapsedSeconds}s`,
          `Inimigos derrotados: ${run.kills}`,
        ].join('\n'),
        {
          align: 'center',
          fontFamily: 'Arial, sans-serif',
          fontSize: '24px',
          color: '#d9dee5',
          lineSpacing: 12,
        },
      )
      .setOrigin(0.5);

    this.createButton(GAME_WIDTH / 2 - 150, 535, 'JOGAR NOVAMENTE', () => {
      session.restartRun();
      this.scene.start(SCENE_KEYS.DUNGEON);
    });

    this.createButton(GAME_WIDTH / 2 + 150, 535, 'VOLTAR AO MENU', () => {
      session.clear();
      this.scene.start(SCENE_KEYS.MENU);
    });
  }

  private createButton(x: number, y: number, label: string, action: () => void): void {
    this.add
      .text(x, y, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        color: '#e6c87a',
        backgroundColor: '#202b38',
        padding: { x: 20, y: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_DOWN, action);
  }
}
