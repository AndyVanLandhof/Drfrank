import { Course, CourseSearchResult } from '../types/course';

// Mock data for the 8 specific courses
const MOCK_COURSES: Course[] = [
  {
    id: 'royal-dornoch',
    name: 'Royal Dornoch Golf Club',
    location: 'Dornoch, Scotland',
    totalPar: 70,
    teeBoxes: [
      { color: 'blue', name: 'Blue Tees', courseRating: 73.5, slopeRating: 138, totalYardage: 6799 },
      { color: 'white', name: 'White Tees', courseRating: 72.8, slopeRating: 137, totalYardage: 6649 },
      { color: 'yellow', name: 'Yellow Tees', courseRating: 71.3, slopeRating: 131, totalYardage: 6299 },
      { color: 'red', name: 'Red Tees', courseRating: 69.5, slopeRating: 127, totalYardage: 5920 },
      { color: 'green', name: 'Green Tees', courseRating: 66.3, slopeRating: 114, totalYardage: 5296 }
    ],
    holes: [
      { number: 1, par: 4, strokeIndex: 12, name: "First", yardages: { blue: 331, white: 331, yellow: 302, red: 266, green: 256 } },
      { number: 2, par: 3, strokeIndex: 6, name: "Ord", yardages: { blue: 184, white: 177, yellow: 167, red: 160, green: 131 } },
      { number: 3, par: 4, strokeIndex: 14, name: "Earl's Cross", yardages: { blue: 413, white: 413, yellow: 398, red: 389, green: 277 } },
      { number: 4, par: 4, strokeIndex: 4, name: "Achinnaich", yardages: { blue: 422, white: 422, yellow: 402, red: 392, green: 359 } },
      { number: 5, par: 4, strokeIndex: 18, name: "Hilton", yardages: { blue: 353, white: 353, yellow: 312, red: 306, green: 246 } },
      { number: 6, par: 3, strokeIndex: 8, name: "Whinny Brae", yardages: { blue: 161, white: 161, yellow: 156, red: 137, green: 125 } },
      { number: 7, par: 4, strokeIndex: 2, name: "Pier", yardages: { blue: 485, white: 479, yellow: 464, red: 395, green: 342 } },
      { number: 8, par: 4, strokeIndex: 16, name: "Dunrobin", yardages: { blue: 482, white: 457, yellow: 421, red: 368, green: 324 } },
      { number: 9, par: 5, strokeIndex: 10, name: "Craigiemore", yardages: { blue: 529, white: 529, yellow: 491, red: 435, green: 427 } },
      { number: 10, par: 3, strokeIndex: 11, name: "Fuaran", yardages: { blue: 174, white: 146, yellow: 142, red: 132, green: 130 } },
      { number: 11, par: 4, strokeIndex: 3, name: "Souchie", yardages: { blue: 446, white: 446, yellow: 434, red: 426, green: 421 } },
      { number: 12, par: 5, strokeIndex: 7, name: "Sutherland", yardages: { blue: 560, white: 535, yellow: 492, red: 478, green: 453 } },
      { number: 13, par: 3, strokeIndex: 15, name: "Bents", yardages: { blue: 180, white: 171, yellow: 148, red: 137, green: 130 } },
      { number: 14, par: 4, strokeIndex: 1, name: "Foxy", yardages: { blue: 445, white: 445, yellow: 439, red: 401, green: 378 } },
      { number: 15, par: 4, strokeIndex: 17, name: "Stulaig", yardages: { blue: 360, white: 322, yellow: 300, red: 290, green: 284 } },
      { number: 16, par: 4, strokeIndex: 5, name: "High Hole", yardages: { blue: 401, white: 401, yellow: 395, red: 387, green: 307 } },
      { number: 17, par: 4, strokeIndex: 13, name: "Valley", yardages: { blue: 417, white: 405, yellow: 390, red: 384, green: 326 } },
      { number: 18, par: 4, strokeIndex: 9, name: "Home", yardages: { blue: 456, white: 456, yellow: 446, red: 437, green: 380 } }
    ]
  },
  {
    id: 'nairn',
    name: 'Nairn Golf Club',
    location: 'Nairn, Scotland',
    totalPar: 71,
    teeBoxes: [
      { color: 'black', name: 'Black Tees', courseRating: 74.6, slopeRating: 138, totalYardage: 6832 },
      { color: 'white', name: 'White Tees', courseRating: 72.7, slopeRating: 134, totalYardage: 6426 },
      { color: 'blue', name: 'Blue Tees', courseRating: 71.4, slopeRating: 131, totalYardage: 6125 },
      { color: 'green', name: 'Green Tees', courseRating: 69.2, slopeRating: 127, totalYardage: 5633 },
      { color: 'silver', name: 'Silver Tees', courseRating: 67.8, slopeRating: 123, totalYardage: 5199 }
    ],
    holes: [
      { number: 1, par: 4, strokeIndex: 10, name: "First", yardages: { black: 417, white: 409, blue: 400, green: 370, silver: 331 } },
      { number: 2, par: 4, strokeIndex: 4, name: "Second", yardages: { black: 479, white: 451, blue: 433, green: 406, silver: 406 } },
      { number: 3, par: 4, strokeIndex: 16, name: "Third", yardages: { black: 411, white: 371, blue: 361, green: 345, silver: 285 } },
      { number: 4, par: 3, strokeIndex: 18, name: "Fourth", yardages: { black: 167, white: 155, blue: 134, green: 132, silver: 132 } },
      { number: 5, par: 4, strokeIndex: 2, name: "Fifth", yardages: { black: 383, white: 377, blue: 371, green: 279, silver: 279 } },
      { number: 6, par: 3, strokeIndex: 14, name: "Sixth", yardages: { black: 193, white: 179, blue: 169, green: 137, silver: 110 } },
      { number: 7, par: 5, strokeIndex: 6, name: "Seventh", yardages: { black: 601, white: 532, blue: 481, green: 435, silver: 417 } },
      { number: 8, par: 4, strokeIndex: 8, name: "Eighth", yardages: { black: 352, white: 323, blue: 296, green: 276, silver: 276 } },
      { number: 9, par: 4, strokeIndex: 12, name: "Ninth", yardages: { black: 357, white: 322, blue: 301, green: 274, silver: 274 } },
      { number: 10, par: 5, strokeIndex: 9, name: "Tenth", yardages: { black: 533, white: 493, blue: 489, green: 463, silver: 423 } },
      { number: 11, par: 3, strokeIndex: 17, name: "Eleventh", yardages: { black: 180, white: 158, blue: 152, green: 141, silver: 109 } },
      { number: 12, par: 4, strokeIndex: 5, name: "Twelfth", yardages: { black: 464, white: 441, blue: 412, green: 400, silver: 386 } },
      { number: 13, par: 4, strokeIndex: 1, name: "Thirteenth", yardages: { black: 428, white: 419, blue: 409, green: 401, silver: 337 } },
      { number: 14, par: 3, strokeIndex: 13, name: "Fourteenth", yardages: { black: 224, white: 212, blue: 199, green: 182, silver: 134 } },
      { number: 15, par: 4, strokeIndex: 7, name: "Fifteenth", yardages: { black: 303, white: 303, blue: 281, green: 220, silver: 220 } },
      { number: 16, par: 4, strokeIndex: 3, name: "Sixteenth", yardages: { black: 419, white: 412, blue: 398, green: 385, silver: 352 } },
      { number: 17, par: 4, strokeIndex: 15, name: "Seventeenth", yardages: { black: 373, white: 359, blue: 349, green: 332, silver: 316 } },
      { number: 18, par: 5, strokeIndex: 11, name: "Eighteenth", yardages: { black: 548, white: 510, blue: 490, green: 455, silver: 412 } }
    ]
  },
  {
    id: 'brora',
    name: 'Brora Golf Club',
    location: 'Brora, Scotland',
    totalPar: 69,
    teeBoxes: [
      { color: 'black', name: 'Championship Tees', courseRating: 71.8, slopeRating: 128, totalYardage: 6110 },
      { color: 'blue', name: 'Medal Tees', courseRating: 70.2, slopeRating: 124, totalYardage: 5800 },
      { color: 'white', name: 'Club Tees', courseRating: 68.6, slopeRating: 120, totalYardage: 5500 },
      { color: 'yellow', name: 'Forward Tees', courseRating: 67.1, slopeRating: 116, totalYardage: 5200 },
      { color: 'red', name: "Ladies' Tees", courseRating: 70.8, slopeRating: 119, totalYardage: 4800 }
    ],
    holes: [
      { number: 1, par: 4, strokeIndex: 9, name: "Carnachy", yardages: { black: 320, blue: 305, white: 290, yellow: 275, red: 240 } },
      { number: 2, par: 4, strokeIndex: 7, name: "Blackcraig", yardages: { black: 434, blue: 420, white: 405, yellow: 385, red: 345 } },
      { number: 3, par: 3, strokeIndex: 17, name: "Sea Hole", yardages: { black: 136, blue: 130, white: 120, yellow: 110, red: 100 } },
      { number: 4, par: 4, strokeIndex: 3, name: "Witch", yardages: { black: 462, blue: 445, white: 430, yellow: 410, red: 370 } },
      { number: 5, par: 3, strokeIndex: 15, name: "Sahara", yardages: { black: 174, blue: 165, white: 155, yellow: 145, red: 130 } },
      { number: 6, par: 4, strokeIndex: 1, name: "Badger", yardages: { black: 469, blue: 455, white: 440, yellow: 420, red: 380 } },
      { number: 7, par: 3, strokeIndex: 13, name: "Platform", yardages: { black: 190, blue: 180, white: 170, yellow: 160, red: 145 } },
      { number: 8, par: 4, strokeIndex: 5, name: "Druids' Stone", yardages: { black: 448, blue: 435, white: 420, yellow: 400, red: 360 } },
      { number: 9, par: 4, strokeIndex: 11, name: "Balnacoil", yardages: { black: 362, blue: 350, white: 335, yellow: 315, red: 275 } },
      { number: 10, par: 4, strokeIndex: 8, name: "Inver", yardages: { black: 435, blue: 420, white: 405, yellow: 385, red: 345 } },
      { number: 11, par: 3, strokeIndex: 18, name: "Bomb", yardages: { black: 143, blue: 135, white: 125, yellow: 115, red: 105 } },
      { number: 12, par: 5, strokeIndex: 4, name: "Snake", yardages: { black: 502, blue: 485, white: 470, yellow: 450, red: 410 } },
      { number: 13, par: 4, strokeIndex: 2, name: "Castle", yardages: { black: 433, blue: 420, white: 405, yellow: 385, red: 345 } },
      { number: 14, par: 3, strokeIndex: 16, name: "Doll's House", yardages: { black: 164, blue: 155, white: 145, yellow: 135, red: 120 } },
      { number: 15, par: 4, strokeIndex: 10, name: "Sutherland", yardages: { black: 378, blue: 365, white: 350, yellow: 330, red: 290 } },
      { number: 16, par: 4, strokeIndex: 6, name: "Clynekaberfeidh", yardages: { black: 408, blue: 395, white: 380, yellow: 360, red: 320 } },
      { number: 17, par: 4, strokeIndex: 14, name: "Tarbatness", yardages: { black: 389, blue: 375, white: 360, yellow: 340, red: 300 } },
      { number: 18, par: 4, strokeIndex: 12, name: "Home", yardages: { black: 417, blue: 405, white: 390, yellow: 370, red: 330 } }
    ]
  },
  {
    id: 'golspie',
    name: 'Golspie Golf Club',
    location: 'Golspie, Scotland',
    totalPar: 68,
    teeBoxes: [
      { color: 'black', name: 'Championship Tees', courseRating: 70.5, slopeRating: 126, totalYardage: 5876 },
      { color: 'blue', name: 'Medal Tees', courseRating: 69.1, slopeRating: 122, totalYardage: 5600 },
      { color: 'white', name: 'Club Tees', courseRating: 67.7, slopeRating: 118, totalYardage: 5300 },
      { color: 'yellow', name: 'Forward Tees', courseRating: 66.3, slopeRating: 114, totalYardage: 5000 },
      { color: 'red', name: "Ladies' Tees", courseRating: 69.5, slopeRating: 117, totalYardage: 4650 }
    ],
    holes: [
      { number: 1, par: 4, strokeIndex: 7, name: "Heather", yardages: { black: 356, blue: 340, white: 325, yellow: 305, red: 265 } },
      { number: 2, par: 4, strokeIndex: 11, name: "Bents", yardages: { black: 362, blue: 345, white: 330, yellow: 310, red: 270 } },
      { number: 3, par: 3, strokeIndex: 15, name: "The Hollow", yardages: { black: 153, blue: 145, white: 135, yellow: 125, red: 110 } },
      { number: 4, par: 4, strokeIndex: 3, name: "Ben Bhraggie", yardages: { black: 400, blue: 385, white: 370, yellow: 350, red: 310 } },
      { number: 5, par: 4, strokeIndex: 1, name: "Long", yardages: { black: 467, blue: 450, white: 435, yellow: 415, red: 375 } },
      { number: 6, par: 3, strokeIndex: 17, name: "Whin", yardages: { black: 137, blue: 130, white: 120, yellow: 110, red: 100 } },
      { number: 7, par: 4, strokeIndex: 5, name: "Plateau", yardages: { black: 385, blue: 370, white: 355, yellow: 335, red: 295 } },
      { number: 8, par: 3, strokeIndex: 13, name: "Hill", yardages: { black: 175, blue: 165, white: 155, yellow: 145, red: 130 } },
      { number: 9, par: 4, strokeIndex: 9, name: "Ferry", yardages: { black: 344, blue: 330, white: 315, yellow: 295, red: 255 } },
      { number: 10, par: 4, strokeIndex: 8, name: "Crossing", yardages: { black: 371, blue: 355, white: 340, yellow: 320, red: 280 } },
      { number: 11, par: 3, strokeIndex: 18, name: "Dornoch Firth", yardages: { black: 127, blue: 120, white: 110, yellow: 100, red: 90 } },
      { number: 12, par: 5, strokeIndex: 2, name: "Cemetery", yardages: { black: 484, blue: 470, white: 455, yellow: 435, red: 395 } },
      { number: 13, par: 4, strokeIndex: 4, name: "Ord", yardages: { black: 423, blue: 410, white: 395, yellow: 375, red: 335 } },
      { number: 14, par: 3, strokeIndex: 16, name: "Dell", yardages: { black: 165, blue: 155, white: 145, yellow: 135, red: 120 } },
      { number: 15, par: 4, strokeIndex: 10, name: "Quarry", yardages: { black: 378, blue: 365, white: 350, yellow: 330, red: 290 } },
      { number: 16, par: 4, strokeIndex: 6, name: "Seaward", yardages: { black: 397, blue: 385, white: 370, yellow: 350, red: 310 } },
      { number: 17, par: 3, strokeIndex: 14, name: "Road", yardages: { black: 171, blue: 160, white: 150, yellow: 140, red: 125 } },
      { number: 18, par: 4, strokeIndex: 12, name: "Home", yardages: { black: 341, blue: 330, white: 315, yellow: 295, red: 255 } }
    ]
  },
  {
    id: 'covesea',
    name: 'Covesea Golf Club',
    location: 'Lossiemouth, Scotland',
    totalPar: 71,
    teeBoxes: [
      { color: 'black', name: 'Championship Tees', courseRating: 72.4, slopeRating: 130, totalYardage: 6252 },
      { color: 'blue', name: 'Medal Tees', courseRating: 70.8, slopeRating: 126, totalYardage: 5950 },
      { color: 'white', name: 'Club Tees', courseRating: 69.2, slopeRating: 122, totalYardage: 5650 },
      { color: 'yellow', name: 'Forward Tees', courseRating: 67.6, slopeRating: 118, totalYardage: 5350 },
      { color: 'red', name: "Ladies' Tees", courseRating: 71.2, slopeRating: 121, totalYardage: 4950 }
    ],
    holes: [
      { number: 1, par: 4, strokeIndex: 9, name: "Covesea", yardages: { black: 380, blue: 365, white: 350, yellow: 330, red: 290 } },
      { number: 2, par: 4, strokeIndex: 5, name: "Lighthouse", yardages: { black: 417, blue: 400, white: 385, yellow: 365, red: 325 } },
      { number: 3, par: 3, strokeIndex: 17, name: "Links", yardages: { black: 162, blue: 155, white: 145, yellow: 135, red: 120 } },
      { number: 4, par: 4, strokeIndex: 1, name: "Clashach", yardages: { black: 456, blue: 440, white: 425, yellow: 405, red: 365 } },
      { number: 5, par: 4, strokeIndex: 13, name: "Burn", yardages: { black: 346, blue: 330, white: 315, yellow: 295, red: 255 } },
      { number: 6, par: 5, strokeIndex: 7, name: "Long", yardages: { black: 508, blue: 490, white: 475, yellow: 455, red: 415 } },
      { number: 7, par: 3, strokeIndex: 15, name: "Bay", yardages: { black: 178, blue: 170, white: 160, yellow: 150, red: 135 } },
      { number: 8, par: 4, strokeIndex: 3, name: "Binn Hill", yardages: { black: 425, blue: 410, white: 395, yellow: 375, red: 335 } },
      { number: 9, par: 4, strokeIndex: 11, name: "Braes", yardages: { black: 364, blue: 350, white: 335, yellow: 315, red: 275 } },
      { number: 10, par: 4, strokeIndex: 8, name: "Slopes", yardages: { black: 398, blue: 385, white: 370, yellow: 350, red: 310 } },
      { number: 11, par: 3, strokeIndex: 18, name: "Dunes", yardages: { black: 145, blue: 140, white: 130, yellow: 120, red: 105 } },
      { number: 12, par: 4, strokeIndex: 4, name: "Quarry Brae", yardages: { black: 432, blue: 415, white: 400, yellow: 380, red: 340 } },
      { number: 13, par: 5, strokeIndex: 2, name: "Spey Bay", yardages: { black: 522, blue: 505, white: 490, yellow: 470, red: 430 } },
      { number: 14, par: 3, strokeIndex: 16, name: "Short", yardages: { black: 168, blue: 160, white: 150, yellow: 140, red: 125 } },
      { number: 15, par: 4, strokeIndex: 6, name: "Lossie", yardages: { black: 412, blue: 395, white: 380, yellow: 360, red: 320 } },
      { number: 16, par: 4, strokeIndex: 10, name: "Halliman", yardages: { black: 378, blue: 365, white: 350, yellow: 330, red: 290 } },
      { number: 17, par: 4, strokeIndex: 14, name: "Sea Hole", yardages: { black: 354, blue: 340, white: 325, yellow: 305, red: 265 } },
      { number: 18, par: 4, strokeIndex: 12, name: "Home", yardages: { black: 367, blue: 355, white: 340, yellow: 320, red: 280 } }
    ]
  },
  {
    id: 'moray-old',
    name: 'Moray Golf Club (Old Course)',
    location: 'Lossiemouth, Scotland',
    totalPar: 71, // White tees: 71, Red tees: 76
    teeBoxes: [
      { color: 'white', name: 'White Tees', courseRating: 72.5, slopeRating: 128, totalYardage: 6572, par: 71 },
      { color: 'red', name: 'Red Tees', courseRating: 76.0, slopeRating: 113, totalYardage: 6078, par: 76 }
    ],
    holes: [
      { number: 1, par: 4, strokeIndex: { white: 12, red: 16 }, name: "First", yardages: { white: 316, red: 295 } },
      { number: 2, par: 5, strokeIndex: { white: 3, red: 6 }, name: "Second", yardages: { white: 481, red: 452 } },
      { number: 3, par: { white: 4, red: 5 }, strokeIndex: { white: 8, red: 3 }, name: "Third", yardages: { white: 397, red: 384 } },
      { number: 4, par: 3, strokeIndex: 13, name: "Fourth", yardages: { white: 193, red: 179 } },
      { number: 5, par: 4, strokeIndex: { white: 6, red: 1 }, name: "Fifth", yardages: { white: 413, red: 386 } },
      { number: 6, par: 3, strokeIndex: { white: 17, red: 1 }, name: "Sixth", yardages: { white: 146, red: 136 } },
      { number: 7, par: { white: 4, red: 5 }, strokeIndex: { white: 9, red: 7 }, name: "Seventh", yardages: { white: 435, red: 416 } },
      { number: 8, par: { white: 4, red: 5 }, strokeIndex: { white: 1, red: 8 }, name: "Eighth", yardages: { white: 456, red: 429 } },
      { number: 9, par: 4, strokeIndex: 15, name: "Ninth", yardages: { white: 310, red: 294 } },
      { number: 10, par: 4, strokeIndex: 14, name: "Tenth", yardages: { white: 313, red: 245 } },
      { number: 11, par: { white: 4, red: 5 }, strokeIndex: { white: 2, red: 5 }, name: "Eleventh", yardages: { white: 423, red: 412 } },
      { number: 12, par: 4, strokeIndex: { white: 10, red: 2 }, name: "Twelfth", yardages: { white: 389, red: 358 } },
      { number: 13, par: 4, strokeIndex: { white: 4, red: 10 }, name: "Thirteenth", yardages: { white: 418, red: 378 } },
      { number: 14, par: { white: 3, red: 5 }, strokeIndex: 7, name: "Fourteenth", yardages: { white: 427, red: 408 } },
      { number: 15, par: { white: 4, red: 3 }, strokeIndex: 18, name: "Fifteenth", yardages: { white: 180, red: 143 } },
      { number: 16, par: { white: 5, red: 4 }, strokeIndex: { white: 16, red: 12 }, name: "Sixteenth", yardages: { white: 358, red: 338 } },
      { number: 17, par: { white: 4, red: 5 }, strokeIndex: { white: 5, red: 4 }, name: "Seventeenth", yardages: { white: 509, red: 452 } },
      { number: 18, par: 4, strokeIndex: 11, name: "Eighteenth", yardages: { white: 408, red: 373 } }
    ]
  },
  {
    id: 'fortrose',
    name: 'Fortrose & Rosemarkie Golf Club',
    location: 'Fortrose, Scotland',
    totalPar: 71,
    teeBoxes: [
      { color: 'black', name: 'Championship Tees', courseRating: 71.6, slopeRating: 127, totalYardage: 5876 },
      { color: 'blue', name: 'Medal Tees', courseRating: 70.1, slopeRating: 123, totalYardage: 5600 },
      { color: 'white', name: 'Club Tees', courseRating: 68.6, slopeRating: 119, totalYardage: 5300 },
      { color: 'yellow', name: 'Forward Tees', courseRating: 67.1, slopeRating: 115, totalYardage: 5000 },
      { color: 'red', name: "Ladies' Tees", courseRating: 70.8, slopeRating: 118, totalYardage: 4650 }
    ],
    holes: [
      { number: 1, par: 4, strokeIndex: 13, name: "Cathedral", yardages: { black: 323, blue: 310, white: 295, yellow: 275, red: 235 } },
      { number: 2, par: 4, strokeIndex: 5, name: "Chanonry Point", yardages: { black: 414, blue: 400, white: 385, yellow: 365, red: 325 } },
      { number: 3, par: 3, strokeIndex: 17, name: "Ord Hill", yardages: { black: 150, blue: 145, white: 135, yellow: 125, red: 110 } },
      { number: 4, par: 4, strokeIndex: 1, name: "Fairy Glen", yardages: { black: 448, blue: 435, white: 420, yellow: 400, red: 360 } },
      { number: 5, par: 4, strokeIndex: 9, name: "Miller", yardages: { black: 364, blue: 350, white: 335, yellow: 315, red: 275 } },
      { number: 6, par: 3, strokeIndex: 15, name: "Rosemarkie", yardages: { black: 179, blue: 170, white: 160, yellow: 150, red: 135 } },
      { number: 7, par: 4, strokeIndex: 7, name: "Tarbet Ness", yardages: { black: 395, blue: 380, white: 365, yellow: 345, red: 305 } },
      { number: 8, par: 4, strokeIndex: 3, name: "Ben Wyvis", yardages: { black: 427, blue: 415, white: 400, yellow: 380, red: 340 } },
      { number: 9, par: 3, strokeIndex: 11, name: "Valley", yardages: { black: 186, blue: 175, white: 165, yellow: 155, red: 140 } },
      { number: 10, par: 4, strokeIndex: 8, name: "Ness", yardages: { black: 386, blue: 375, white: 360, yellow: 340, red: 300 } },
      { number: 11, par: 4, strokeIndex: 4, name: "Crescent", yardages: { black: 421, blue: 410, white: 395, yellow: 375, red: 335 } },
      { number: 12, par: 4, strokeIndex: 18, name: "Schoolhouse", yardages: { black: 278, blue: 270, white: 255, yellow: 235, red: 195 } },
      { number: 13, par: 5, strokeIndex: 2, name: "Citadel", yardages: { black: 482, blue: 470, white: 455, yellow: 435, red: 395 } },
      { number: 14, par: 3, strokeIndex: 16, name: "Battery", yardages: { black: 171, blue: 165, white: 155, yellow: 145, red: 130 } },
      { number: 15, par: 4, strokeIndex: 6, name: "Manse", yardages: { black: 398, blue: 385, white: 370, yellow: 350, red: 310 } },
      { number: 16, par: 4, strokeIndex: 10, name: "Shore", yardages: { black: 374, blue: 360, white: 345, yellow: 325, red: 285 } },
      { number: 17, par: 4, strokeIndex: 14, name: "Kirk", yardages: { black: 355, blue: 345, white: 330, yellow: 310, red: 270 } },
      { number: 18, par: 4, strokeIndex: 12, name: "Home", yardages: { black: 375, blue: 365, white: 350, yellow: 330, red: 290 } }
    ]
  },
  {
    id: 'liphook',
    name: 'Liphook Golf Club',
    location: 'Liphook, Hampshire, England',
    totalPar: 70,
    teeBoxes: [
      { color: 'white', name: 'Competition Tees', courseRating: 71.7, slopeRating: 136, totalYardage: 6317 },
      { color: 'yellow', name: 'Medal Tees', courseRating: 70.2, slopeRating: 131, totalYardage: 6011 },
      { color: 'red', name: 'Forward Tees', courseRating: 74.0, slopeRating: 128, totalYardage: 5556 },
      { color: 'green', name: 'Ladies Tees', courseRating: 69.4, slopeRating: 120, totalYardage: 4783 }
    ],
    holes: [
      { number: 1, par: 4, strokeIndex: 9, name: "Birch Hill", yardages: { white: 393, yellow: 384, red: 370, green: 317 } },
      { number: 2, par: 4, strokeIndex: 3, name: "The Old Road", yardages: { white: 423, yellow: 411, red: 406, green: 325 } },
      { number: 3, par: 3, strokeIndex: 18, name: "Millard", yardages: { white: 142, yellow: 117, red: 108, green: 108 } },
      { number: 4, par: 4, strokeIndex: 1, name: "Fir Tree", yardages: { white: 460, yellow: 439, red: 409, green: 315 } },
      { number: 5, par: 5, strokeIndex: 14, name: "The Black Pond", yardages: { white: 499, yellow: 489, red: 397, green: 297 } },
      { number: 6, par: 4, strokeIndex: 6, name: "Rustic", yardages: { white: 456, yellow: 420, red: 399, green: 297 } },
      { number: 7, par: 5, strokeIndex: 12, name: "Junction", yardages: { white: 501, yellow: 478, red: 439, green: 383 } },
      { number: 8, par: 3, strokeIndex: 13, name: "The Pond", yardages: { white: 176, yellow: 169, red: 155, green: 133 } },
      { number: 9, par: 4, strokeIndex: 7, name: "Waterside", yardages: { white: 372, yellow: 363, red: 279, green: 199 } },
      { number: 10, par: 4, strokeIndex: 3, name: "Gantry", yardages: { white: 431, yellow: 397, red: 344, green: 344 } },
      { number: 11, par: 5, strokeIndex: 5, name: "Tent More", yardages: { white: 560, yellow: 542, red: 487, green: 425 } },
      { number: 12, par: 3, strokeIndex: 16, name: "The Bowl", yardages: { white: 150, yellow: 136, red: 118, green: 118 } },
      { number: 13, par: 4, strokeIndex: 10, name: "The Valley", yardages: { white: 381, yellow: 334, red: 310, green: 284 } },
      { number: 14, par: 4, strokeIndex: 2, name: "Richard", yardages: { white: 414, yellow: 434, red: 336, green: 286 } },
      { number: 15, par: 4, strokeIndex: 17, name: "Hollowrowe", yardages: { white: 308, yellow: 301, red: 249, green: 214 } },
      { number: 16, par: 4, strokeIndex: 8, name: "The Quarry", yardages: { white: 360, yellow: 344, red: 310, green: 268 } },
      { number: 17, par: 3, strokeIndex: 15, name: "Sussex Edge", yardages: { white: 161, yellow: 148, red: 141, green: 141 } },
      { number: 18, par: 5, strokeIndex: 11, name: "Whitehall", yardages: { white: 461, yellow: 449, red: 432, green: 352 } }
    ]
  }
];

export class CourseService {
  // TODO: Replace with real API endpoint
  // Example: https://api.github.com/repos/username/uk-golf-courses/contents/courses.json
  private static readonly API_BASE_URL = 'https://api.github.com/repos/your-repo/uk-golf-courses';
  
  /**
   * Search for golf courses by name or location
   * @param query Search term
   * @returns Promise of course search results
   */
  static async searchCourses(query: string): Promise<CourseSearchResult[]> {
    try {
      // TODO: Replace with real API call
      // const response = await fetch(`${this.API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      // const data = await response.json();
      // return data.courses;
      
      // Mock implementation - simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filteredCourses = MOCK_COURSES.filter(course => 
        course.name.toLowerCase().includes(query.toLowerCase()) ||
        course.location.toLowerCase().includes(query.toLowerCase())
      );
      
      return filteredCourses.map(course => ({
        id: course.id,
        name: course.name,
        location: course.location,
        teeBoxes: course.teeBoxes
      }));
    } catch (error) {
      console.error('Error searching courses:', error);
      throw new Error('Failed to search courses');
    }
  }
  
  /**
   * Get full course details by ID
   * @param courseId Course identifier
   * @returns Promise of complete course data
   */
  static async getCourseById(courseId: string): Promise<Course | null> {
    try {
      // TODO: Replace with real API call
      // const response = await fetch(`${this.API_BASE_URL}/courses/${courseId}`);
      // const data = await response.json();
      // return data;
      
      // Mock implementation - simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return MOCK_COURSES.find(course => course.id === courseId) || null;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw new Error('Failed to fetch course details');
    }
  }
  
  /**
   * Get popular/featured courses
   * @returns Promise of featured course search results
   */
  static async getFeaturedCourses(): Promise<CourseSearchResult[]> {
    try {
      // TODO: Replace with real API call
      // const response = await fetch(`${this.API_BASE_URL}/featured`);
      // const data = await response.json();
      // return data.courses;
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return MOCK_COURSES.map(course => ({
        id: course.id,
        name: course.name,
        location: course.location,
        teeBoxes: course.teeBoxes
      }));
    } catch (error) {
      console.error('Error fetching featured courses:', error);
      throw new Error('Failed to fetch featured courses');
    }
  }
}