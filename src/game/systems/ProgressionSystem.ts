import { PROGRESSION_CONFIG } from '../config/progression';
import type {
  ExperienceGainResult,
  LevelUpHandler,
  ProgressionState,
} from '../types/progression';

export class ProgressionSystem {
  private readonly state: ProgressionState;
  private readonly onLevelUp: LevelUpHandler;

  constructor(state: ProgressionState, onLevelUp: LevelUpHandler) {
    this.state = state;
    this.onLevelUp = onLevelUp;
  }

  get requiredExperience(): number {
    return getRequiredExperience(this.state.level);
  }

  addExperience(amount: number): ExperienceGainResult {
    const gainedExperience = Math.max(0, Math.floor(amount));
    this.state.experience += gainedExperience;

    let levelsGained = 0;
    let requiredExperience = this.requiredExperience;

    while (this.state.experience >= requiredExperience) {
      this.state.experience -= requiredExperience;
      this.state.level += 1;
      levelsGained += 1;
      this.onLevelUp(this.state.level);
      requiredExperience = this.requiredExperience;
    }

    return {
      gainedExperience,
      levelsGained,
      currentLevel: this.state.level,
      currentExperience: this.state.experience,
      requiredExperience,
    };
  }
}

export function getRequiredExperience(level: number): number {
  const validLevel = Math.max(1, Math.floor(level));

  return Math.round(
    PROGRESSION_CONFIG.baseRequiredExperience *
      validLevel ** PROGRESSION_CONFIG.growthExponent,
  );
}
