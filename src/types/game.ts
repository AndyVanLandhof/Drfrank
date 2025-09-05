export interface Player {
  name: string;
  handicap: string;
  teeColor?: string; // Selected tee box color
}

export interface HoleScore {
  gross: number | null;
  net: number | null;
  stableford: number;
}

export interface GameState {
  currentHole: number;
  scores: Record<string, HoleScore[]>; // player name -> array of 18 hole scores
  course: (import('../constants/course').HoleInfo | import('../types/course').CourseHole)[]; // course information for each hole
  skins: Record<string, number>; // player name -> total skins won
  skinsCarryover: number; // current carryover amount for next hole
  nassauPoints: Record<string, { front9: number; back9: number; overall: number }>; // player Nassau points
  sixPointSystem: Record<string, number>; // player name -> total six point system points
  // Team-based format results
  fourball?: any;
  foursomes?: any;
  scramble?: any;
}