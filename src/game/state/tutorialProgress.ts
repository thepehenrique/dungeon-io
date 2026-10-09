const TUTORIAL_SEEN_STORAGE_KEY = 'dungeon.io.tutorialSeen';

export function hasSeenTutorial(): boolean {
  try {
    return window.localStorage.getItem(TUTORIAL_SEEN_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markTutorialAsSeen(): void {
  try {
    window.localStorage.setItem(TUTORIAL_SEEN_STORAGE_KEY, 'true');
  } catch {
    // Storage may be unavailable. It must never prevent starting a run.
  }
}
