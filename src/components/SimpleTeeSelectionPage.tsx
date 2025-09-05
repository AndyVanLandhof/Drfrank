import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { MapPin, Target, TrendingUp, Users } from 'lucide-react';
import { Course, TeeBox } from '../types/course';
import { Player } from '../types/game';

interface SimpleTeeSelectionPageProps {
  course: Course;
  players: Player[];
  onBack: () => void;
  onContinue: (playersWithTees: Player[]) => void;
}

export function SimpleTeeSelectionPage({ course, players, onBack, onContinue }: SimpleTeeSelectionPageProps) {
  // Get recommended tee based on average handicap of all players
  const getRecommendedTee = () => {
    const avgHandicap = players.reduce((sum, player) => sum + (parseInt(player.handicap) || 0), 0) / players.length;
    if (avgHandicap <= 5) return 'blue';
    if (avgHandicap <= 15) return 'white';
    return 'yellow';
  };

  const [selectedTee, setSelectedTee] = useState<string>(getRecommendedTee());
  const [selectedTeeForInfo, setSelectedTeeForInfo] = useState<TeeBox>(
    course.teeBoxes.find(tee => tee.color === getRecommendedTee()) || course.teeBoxes[1] || course.teeBoxes[0]
  );

  const handleTeeSelection = (teeColor: string) => {
    setSelectedTee(teeColor);
    const teeBox = course.teeBoxes.find(tee => tee.color === teeColor);
    if (teeBox) {
      setSelectedTeeForInfo(teeBox);
    }
  };

  const handleContinue = () => {
    // Apply the selected tee to all players
    const playersWithTees = players.map(player => ({
      ...player,
      teeColor: selectedTee
    }));
    onContinue(playersWithTees);
  };

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
              <div className="flex items-center justify-center text-augusta-yellow-dark">
                <Users className="w-5 h-5 mr-2" />
                <span className="font-playfair">All players will play from the same tees</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 flex-1">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Tee Selection */}
            <div className="space-y-4">
              <h3 className="text-2xl font-playfair text-augusta-yellow text-center mb-6">
                Choose Tee Box
              </h3>
              
              <div className="grid gap-3">
                {course.teeBoxes.map((tee) => (
                  <Card 
                    key={tee.color}
                    className={`p-4 border-2 bg-transparent cursor-pointer transition-all ${
                      selectedTee === tee.color
                        ? 'border-augusta-yellow bg-augusta-yellow/10 ring-2 ring-augusta-yellow/20'
                        : 'border-augusta-yellow/30 hover:border-augusta-yellow/60'
                    }`}
                    onClick={() => handleTeeSelection(tee.color)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-augusta-yellow"
                          style={{ backgroundColor: getTeeColor(tee.color) }}
                        ></div>
                        <div>
                          <span className="text-lg font-playfair text-augusta-yellow">
                            {tee.name}
                          </span>
                          <div className="text-sm font-playfair text-augusta-yellow-dark">
                            {tee.totalYardage} yards
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-playfair text-augusta-yellow-dark">
                          CR: {tee.courseRating} | SR: {tee.slopeRating}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Selected Tee Details & Players */}
            <div className="space-y-6">
              <h3 className="text-2xl font-playfair text-augusta-yellow text-center">
                Tee Details
              </h3>
              
              {/* Tee Information */}
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

              {/* Players Summary */}
              <Card className="p-4 border-2 border-augusta-yellow bg-transparent">
                <h4 className="text-lg font-playfair text-augusta-yellow mb-3 text-center">
                  Players ({players.length})
                </h4>
                <div className="space-y-2">
                  {players.map((player) => (
                    <div key={player.name} className="flex justify-between items-center text-augusta-yellow-dark">
                      <span className="font-playfair">{player.name}</span>
                      <span className="font-playfair text-sm">Handicap: {player.handicap}</span>
                    </div>
                  ))}
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
              Back to Players
            </Button>
            <Button
              onClick={handleContinue}
              className="bg-transparent text-augusta-yellow rounded-2xl px-8 py-3 text-lg font-playfair hover:bg-augusta-yellow/10 border-2 border-augusta-yellow"
            >
              Continue to {players.length === 4 ? 'Teams' : 'Formats'}
            </Button>
          </div>
        </div>
        
        <div className="pb-4"></div>
      </div>
    </div>
  );
}