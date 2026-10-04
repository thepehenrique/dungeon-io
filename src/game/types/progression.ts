export interface ProgressionState {
  level: number;
  experience: number;
}

export interface ExperienceGainResult {
  readonly gainedExperience: number;
  readonly levelsGained: number;
  readonly currentLevel: number;
  readonly currentExperience: number;
  readonly requiredExperience: number;
}

export type LevelUpHandler = (newLevel: number) => void;
