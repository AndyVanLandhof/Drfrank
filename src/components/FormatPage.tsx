import { useState } from 'react';
import { Button } from './ui/button';
import { Check } from 'lucide-react';

export interface Player {
  name: string;
  handicap: string;
}

interface FormatPageProps {
  players: Player[];
  onBack: () => void;
  onContinue: (selectedFormats: string[]) => void;
}

export function FormatPage({ players, onBack, onContinue }: FormatPageProps) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);

  const toggleFormat = (format: string) => {
    setSelectedFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  // Different format options based on number of players
  const getFormatOptions = () => {
    if (players.length === 2) {
      return [
        { id: 'matchplay', name: 'Match Play' },
        { id: 'nassau', name: 'Nassau' },
        { id: 'skins', name: 'Skins' }
      ];
    } else if (players.length === 3) {
      return [
        { id: 'sixpoint', name: 'Six Point System' },
        { id: 'nassau', name: 'Nassau' },
        { id: 'skins', name: 'Skins' }
      ];
    } else if (players.length === 4) {
      return [
        { id: 'fourball', name: 'Fourball' },
        { id: 'foursomes', name: 'Foursomes' },
        { id: 'scramble', name: 'Scramble' },
        { id: 'nassau', name: 'Nassau' },
        { id: 'skins', name: 'Skins' }
      ];
    }
    return [];
  };

  const formatOptions = getFormatOptions();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="min-h-[calc(100vh-2rem)] border-4 border-augusta-yellow rounded-3xl flex flex-col">
        {/* Header and Content */}
        <div className="container mx-auto px-4 py-8 sm:py-12 flex-1">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-5-percent-larger sm:text-5-percent-larger font-playfair-black text-augusta-yellow">
                Format
              </h1>
            </div>

            {/* Format Options */}
            <div className="w-full max-w-2xl space-y-6">
              <h2 className="text-2xl font-playfair text-augusta-yellow">
                Select Game Formats
                <span className="block text-lg font-playfair text-augusta-yellow-dark mt-1">
                  {players.length === 2 && "2 Player Formats"}
                  {players.length === 3 && "3 Player Formats"}
                  {players.length === 4 && "4 Player Formats"}
                </span>
              </h2>
              
              <div className="space-y-4">
                {formatOptions.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => toggleFormat(format.id)}
                    className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-200 ${
                      selectedFormats.includes(format.id)
                        ? 'bg-augusta-yellow text-primary border-augusta-yellow'
                        : 'bg-transparent text-augusta-yellow border-augusta-yellow hover:bg-augusta-yellow/10'
                    }`}
                  >
                    <span className="text-xl font-playfair">
                      {format.name}
                    </span>
                    {selectedFormats.includes(format.id) && (
                      <Check className="w-6 h-6" />
                    )}
                  </button>
                ))}
              </div>
            </div>



          </div>
        </div>

        {/* Navigation Buttons - positioned at bottom */}
        <div className="container mx-auto px-4 pb-8 sm:pb-12">
          <div className="flex flex-col items-center space-y-4">
            <Button 
              onClick={() => onContinue(selectedFormats)}
              className="bg-augusta-yellow text-primary rounded-2xl w-40 h-32 text-2xl sm:text-3xl font-playfair hover:bg-augusta-yellow/90 border-2 border-augusta-yellow shadow-lg inset-border-augusta-green flex flex-col items-center justify-center"
            >
              <span>Start</span>
              <span>Game</span>
            </Button>
            
            <Button 
              onClick={onBack}
              className="bg-transparent text-augusta-yellow-dark rounded-2xl px-8 py-4 text-xl font-playfair hover:bg-augusta-yellow-dark/10 border-2 border-transparent"
            >
              {players.length === 4 ? 'Back to Teams' : 'Back to Players'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}