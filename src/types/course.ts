export interface CourseHole {
  number: number;
  par: number | { [teeColor: string]: number }; // Can be single par or different per tee
  strokeIndex: number | { [teeColor: string]: number }; // Can be single SI or different per tee
  name?: string;
  yardages: {
    [teeColor: string]: number; // e.g., "black": 450, "blue": 420, "white": 390, "red": 320
  };
}

export interface TeeBox {
  color: string;
  name: string;
  courseRating: number;
  slopeRating: number;
  totalYardage: number;
  par?: number; // Some courses may have different pars from different tees
}

export interface Course {
  id: string;
  name: string;
  location: string;
  teeBoxes: TeeBox[];
  holes: CourseHole[];
  totalPar: number;
}

export interface CourseSearchResult {
  id: string;
  name: string;
  location: string;
  teeBoxes: TeeBox[];
}