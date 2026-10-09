import Phaser from 'phaser';

import { SceneMusic } from '../audio/SceneMusic';
import { MENU_MUSIC } from '../config/audio';
import { SCENE_KEYS } from '../constants/game';
import { getGameSession } from '../state/getGameSession';
import {
  hasSeenTutorial,
  markTutorialAsSeen,
} from '../state/tutorialProgress';
import type { PlayerClass } from '../types/player';
import { HowToPlayView } from '../../ui/how-to-play/HowToPlayView';
import { MenuView } from '../../ui/menu/MenuView';

export class MenuScene extends Phaser.Scene {
  private menuView: MenuView | null = null;
  private howToPlayView: HowToPlayView | null = null;
  private menuMusic: SceneMusic | null = null;

  constructor() {
    super(SCENE_KEYS.MENU);
  }

  create(): void {
    const uiRoot = document.querySelector<HTMLElement>('#ui-root');

    if (!uiRoot) {
      throw new Error('UI root element was not found.');
    }

    this.input.keyboard?.clearCaptures();
    getGameSession(this).clear();
    this.menuMusic = new SceneMusic(this, MENU_MUSIC);
    this.menuMusic.start();
    this.menuView = new MenuView(uiRoot, {
      onSubmit: ({ playerName, playerClass }) => {
        if (hasSeenTutorial()) {
          this.startRun(playerName, playerClass);
          return;
        }

        this.showFirstRunTutorial(
          uiRoot,
          playerClass,
          () => this.startRun(playerName, playerClass),
        );
      },
      onShowHowToPlay: (playerClass) => {
        this.showMenuTutorial(uiRoot, playerClass);
      },
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.menuMusic?.stop();
      this.menuMusic = null;
      this.howToPlayView?.destroy();
      this.howToPlayView = null;
      this.menuView?.destroy();
      this.menuView = null;
    });
  }

  private showFirstRunTutorial(
    root: HTMLElement,
    playerClass: PlayerClass,
    startRun: () => void,
  ): void {
    if (this.howToPlayView) {
      return;
    }

    this.howToPlayView = new HowToPlayView(root, playerClass, {
      confirmLabel: 'COMEÇAR A AVENTURA',
      onConfirm: () => {
        markTutorialAsSeen();
        this.closeHowToPlay();
        startRun();
      },
    });
  }

  private showMenuTutorial(
    root: HTMLElement,
    playerClass: PlayerClass | null,
  ): void {
    if (this.howToPlayView) {
      return;
    }

    this.howToPlayView = new HowToPlayView(root, playerClass, {
      confirmLabel: 'VOLTAR AO MENU',
      onConfirm: () => this.closeHowToPlay(),
    });
  }

  private closeHowToPlay(): void {
    this.howToPlayView?.destroy();
    this.howToPlayView = null;
  }

  private startRun(playerName: string, playerClass: PlayerClass): void {
    getGameSession(this).startRun(playerName, playerClass);
    this.scene.start(SCENE_KEYS.DUNGEON);
  }
}
