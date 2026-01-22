export interface GameSettings {
  gender: string;
  age: string;
  setting: string;
  genre: string;
}

export interface StorySegment {
  id: string;
  text: string;
  choices: string[];
  imagePrompt: string;
  imageUrl?: string; // Populated after image generation
  isUserAction?: boolean; // If this segment represents a user's choice
  userActionText?: string;
}

export interface StoryState {
  segments: StorySegment[];
  isLoadingText: boolean;
  isLoadingImage: boolean;
  gameStarted: boolean;
  error: string | null;
}

export enum Step {
  SETUP,
  PLAYING,
  ERROR
}
