import { Button } from './ui/button';
import { Player } from '../types/game';
import { TeeBox, Course } from '../types/course';

interface HandicapSummaryProps {
  players: Player[];
  selectedTeeBox: TeeBox;
  selectedCourse: Course;
  onBack: () => void;
  onContinue: () => void;
}

// USGA Handicap calculation: Playing Handicap = Handicap Index × (Slope Rating ÷ 113) + (Course Rating - Par)
function calculatePlayingHandicap(handicapIndex: number, slopeRating: number, courseRating: number, par: number): number {
  const playingHandicap = handicapIndex * (slopeRating / 113) + (courseRating - par);
  return Math.round(playingHandicap);
}

export function HandicapSummary({ players, selectedTeeBox, selectedCourse, onBack, onContinue }: HandicapSummaryProps) {
  // Get the actual course par from the selected course
  const coursePar = selectedCourse.totalPar;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="min-h-[calc(100vh-2rem)] border-4 border-augusta-yellow rounded-3xl flex flex-col">
        {/* Header and Content */}
        <div className="container mx-auto px-4 py-8 sm:py-12 flex-1">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-5-percent-larger sm:text-5-percent-larger font-playfair-black text-augusta-yellow">
                Playing Handicaps
              </h1>
              <p className="text-xl sm:text-2xl text-augusta-yellow-dark max-w-2xl italic font-playfair">
                USGA adjusted for {selectedTeeBox.name}
              </p>
            </div>

            {/* Content Area */}
            <div className="w-full max-w-2xl space-y-6">
              {/* Course Info */}
              <div className="bg-primary/5 border-2 border-augusta-yellow/30 rounded-2xl p-6">
                <div className="grid grid-cols-2 gap-4 text-augusta-yellow font-playfair">
                  <div className="text-center">
                    <div className="text-sm opacity-80">Course Rating</div>
                    <div className="text-lg font-bold">{selectedTeeBox.courseRating}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm opacity-80">Slope Rating</div>
                    <div className="text-lg font-bold">{selectedTeeBox.slopeRating}</div>
                  </div>
                </div>
              </div>

              {/* Players Summary */}
              <div className="space-y-4">
                {players.map((player, index) => {
                  const handicapIndex = parseFloat(player.handicap) || 0;
                  const playingHandicap = calculatePlayingHandicap(
                    handicapIndex, 
                    selectedTeeBox.slopeRating, 
                    selectedTeeBox.courseRating, 
                    coursePar
                  );

                  return (
                    <div 
                      key={index}
                      className="bg-primary/5 border-2 border-augusta-yellow rounded-2xl p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col items-start">
                          <h3 className="text-2xl font-playfair-black text-augusta-yellow">
                            {player.name}
                          </h3>
                          <p className="text-augusta-yellow-dark font-playfair">
                            Handicap Index: {player.handicap}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-augusta-yellow-dark font-playfair opacity-80">
                            Playing Handicap
                          </div>
                          <div className="text-4xl font-playfair-black text-augusta-yellow">
                            {playingHandicap}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons - positioned at bottom */}
        <div className="container mx-auto px-4 pb-8 sm:pb-12">
          <div className="flex flex-col items-center space-y-4">
            <Button 
              onClick={onContinue}
              className="bg-augusta-yellow text-primary rounded-2xl w-40 h-32 text-3xl sm:text-4xl font-playfair hover:bg-augusta-yellow/90 border-2 border-augusta-yellow shadow-lg inset-border-augusta-green flex flex-col items-center justify-center"
            >
              Continue
            </Button>
            
            <Button 
              onClick={onBack}
              className="bg-transparent text-augusta-yellow-dark rounded-2xl px-8 py-4 text-xl font-playfair hover:bg-augusta-yellow-dark/10 border-2 border-transparent"
            >
              Back to Players
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}