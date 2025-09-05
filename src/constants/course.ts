export interface HoleInfo {
  par: number;
  yardage: number;
  name: string;
}

// Augusta Springs Golf Club - 4 par 3s, 10 par 4s, 4 par 5s
export const AUGUSTA_SPRINGS_COURSE: HoleInfo[] = [
  { par: 4, yardage: 365, name: "Magnolia Drive" },
  { par: 5, yardage: 520, name: "Azalea Corner" },
  { par: 4, yardage: 385, name: "Flowering Peach" },
  { par: 3, yardage: 165, name: "Flowering Crab" },
  { par: 4, yardage: 445, name: "Magnolia" },
  { par: 3, yardage: 180, name: "Juniper" },
  { par: 4, yardage: 410, name: "Pampas" },
  { par: 5, yardage: 570, name: "Yellow Jasmine" },
  { par: 4, yardage: 435, name: "Carolina Cherry" },
  // Back 9
  { par: 4, yardage: 455, name: "Camellia" },
  { par: 4, yardage: 490, name: "White Dogwood" },
  { par: 3, yardage: 155, name: "Golden Bell" },
  { par: 5, yardage: 510, name: "Azalea" },
  { par: 4, yardage: 440, name: "Chinese Fir" },
  { par: 4, yardage: 460, name: "Firethorn" },
  { par: 3, yardage: 170, name: "Redbud" },
  { par: 4, yardage: 425, name: "Nandina" },
  { par: 5, yardage: 545, name: "Holly" }
];