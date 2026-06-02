export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number; // in seconds
  bpm: number;
  description: string;
  color: string; // Theme color (e.g., cyan-400, pink-500, green-400)
  glowColor: string; // shadow/glow hex or rgba
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;
  y: number;
}

export type GameSpeed = 'SLOW' | 'MEDIUM' | 'FAST' | 'HYPER';

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  isGameOver: boolean;
  score: number;
  highScore: number;
  isPaused: boolean;
  speed: GameSpeed;
}
