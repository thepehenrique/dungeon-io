import Phaser from 'phaser';

import { SCENE_KEYS } from '../constants/game';
import { getGameSession } from '../state/getGameSession';
import { MenuView } from '../../ui/menu/MenuView';

export class MenuScene extends Phaser.Scene {
  private menuView: MenuView | null = null;

  constructor() {
    super(SCENE_KEYS.MENU);
  }

  create(): void {
    const uiRoot = document.querySelector<HTMLElement>('#ui-root');

    if (!uiRoot) {
      throw new Error('UI root element was not found.');
    }

    getGameSession(this).clear();
    this.menuView = new MenuView(uiRoot, ({ playerName, playerClass }) => {
      getGameSession(this).startRun(playerName, playerClass);
      this.scene.start(SCENE_KEYS.DUNGEON);
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.menuView?.destroy();
      this.menuView = null;
    });
  }
}
