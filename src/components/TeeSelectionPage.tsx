import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { MapPin, Target, TrendingUp } from 'lucide-react';
import { Course, TeeBox } from '../types/course';
import { Player } from '../types/game';

interface TeeSelectionPageProps {
  course: Course;
  players: Player[];
  onBack: () => void;
  onContinue: (playersWithTees: Player[]) => void;
}

export function TeeSelectionPage({ course, players, onBack, onContinue }: TeeSelectionPageProps) {
  const [playerTeeSelections, setPlayerTeeSelections] = useState<Record<string, string>>(() => {
    // Initialize with recommended tees based on handicap
    const initialSelections: Record<string, string> = {};
    players.forEach(player => {
      const handicap = parseInt(player.handicap) || 0;
      // Recommend tees based on handicap (rough guideline)
      if (handicap <= 5) {
        initialSelections[player.name] = 'blue'; // Low handicap players
      } else if (handicap <= 15) {
        initialSelections[player.name] = 'white'; // Mid handicap players
      } else {
        initialSelections[player.name] = 'yellow'; // Higher handicap players
      }
    });
    return initialSelections;
  });

  const [selectedTeeForInfo, setSelectedTeeForInfo] = useState<TeeBox>(course.teeBoxes[1] || course.teeBoxes[0]);

  const handleTeeSelection = (playerName: string, teeColor: string) => {
    setPlayerTeeSelections(prev => ({
      ...prev,
      [playerName]: teeColor
    }));
  };

  const handleContinue = () => {
    const playersWithTees = players.map(player => ({
      ...player,
      teeColor: playerTeeSelections[player.name] || 'white'
    }));
    onContinue(playersWithTees);
  };

  const allPlayersHaveTees = players.every(player => 
    playerTeeSelections[player.name] && 
    course.teeBoxes.some(tee => tee.color === playerTeeSelections[player.name])
  );

  // Helper function to get tee box colors
  const getTeeColor = (teeColor: string): string => {
    const colors: Record<string, string> = {
      black: '#000000',
      blue: '#0066CC',
      white: '#FFFFFF',
      yellow: '#FFD700',
      red: '#CC0000',
      green: '#00AA00'
    };
    return colors[teeColor.toLowerCase()] || '#999999';
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="min-h-[calc(100vh-2rem)] border-4 border-augusta-yellow rounded-3xl flex flex-col">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-playfair-black text-augusta-yellow">
              Select Tees
            </h1>
            <div className="space-y-2">
              <h2 className="text-2xl font-playfair text-augusta-yellow-dark">
                {course.name}
              </h2>
              <p className="text-lg font-playfair text-augusta-yellow-dark flex items-center justify-center">
                <MapPin className="w-5 h-5 mr-2" />
                {course.location}
              </p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 flex-1">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Player Tee Selection */}
            <div className="space-y-4">
              <h3 className="text-2xl font-playfair text-augusta-yellow text-center mb-6">
                Player Tee Selection
              </h3>
              
              {players.map((player) => (
                <Card key={player.name} className="p-4 border-2 border-augusta-yellow bg-transparent">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-playfair text-augusta-yellow">{player.name}</h4>
                      <span className="text-sm font-playfair text-augusta-yellow-dark">
                        Handicap: {player.handicap}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {course.teeBoxes.map((tee) => (
                        <button
                          key={tee.color}
                          onClick={() => handleTeeSelection(player.name, tee.color)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            playerTeeSelections[player.name] === tee.color
                              ? 'border-augusta-yellow bg-augusta-yellow/10'
                              : 'border-augusta-yellow/30 hover:border-augusta-yellow/60'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full border-2 border-augusta-yellow"
                              style={{ backgroundColor: getTeeColor(tee.color) }}
                            ></div>
                            <span className="text-sm font-playfair text-augusta-yellow">
                              {tee.name}
                            </span>
                          </div>
                          <div className="text-xs font-playfair text-augusta-yellow-dark mt-1">
                            {tee.totalYardage}y
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Tee Information */}
            <div className="space-y-4">
              <h3 className="text-2xl font-playfair text-augusta-yellow text-center mb-6">
                Tee Information
              </h3>
              
              <div className="space-y-3">
                {course.teeBoxes.map((tee) => (
                  <Card 
                    key={tee.color}
                    className={`p-4 border-2 bg-transparent cursor-pointer transition-all ${
                      selectedTeeForInfo.color === tee.color
                        ? 'border-augusta-yellow bg-augusta-yellow/10'
                        : 'border-augusta-yellow/30 hover:border-augusta-yellow/60'
                    }`}
                    onClick={() => setSelectedTeeForInfo(tee)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-5 h-5 rounded-full border-2 border-augusta-yellow"
                          style={{ backgroundColor: getTeeColor(tee.color) }}
                        ></div>
                        <span className="text-lg font-playfair text-augusta-yellow">
                          {tee.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="flex space-x-4 text-sm font-playfair text-augusta-yellow-dark">
                          <span>{tee.courseRating}CR</span>
                          <span>{tee.slopeRating}SR</span>
                          <span>{tee.totalYardage}y</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Selected Tee Details */}
              <Card className="p-6 border-2 border-augusta-yellow bg-transparent">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-augusta-yellow"
                      style={{ backgroundColor: getTeeColor(selectedTeeForInfo.color) }}
                    ></div>
                    <h4 className="text-xl font-playfair text-augusta-yellow">
                      {selectedTeeForInfo.name}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Target className="w-5 h-5 text-augusta-yellow mr-2" />
                        <span className="text-sm font-playfair text-augusta-yellow">Course Rating</span>
                      </div>
                      <p className="text-xl font-playfair text-augusta-yellow-dark">
                        {selectedTeeForInfo.courseRating}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="w-5 h-5 text-augusta-yellow mr-2" />
                        <span className="text-sm font-playfair text-augusta-yellow">Slope Rating</span>
                      </div>
                      <p className="text-xl font-playfair text-augusta-yellow-dark">
                        {selectedTeeForInfo.slopeRating}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-sm font-playfair text-augusta-yellow">Total Yardage</span>
                      </div>
                      <p className="text-xl font-playfair text-augusta-yellow-dark">
                        {selectedTeeForInfo.totalYardage}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <Button
              onClick={onBack}
              className="bg-transparent text-augusta-yellow-dark rounded-2xl px-8 py-3 text-lg font-playfair hover:bg-augusta-yellow-dark/10 border-2 border-augusta-yellow-dark"
            >
              Back to Course
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!allPlayersHaveTees}
              className="bg-transparent text-augusta-yellow rounded-2xl px-8 py-3 text-lg font-playfair hover:bg-augusta-yellow/10 border-2 border-augusta-yellow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Formats
            </Button>
          </div>
        </div>
        
        <div className="pb-4"></div>
      </div>
    </div>
  );
}