import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { TeeBox } from '../types/course';

export interface Player {
  name: string;
  handicap: string;
  teeColor?: string;
}

interface PlayerSetupProps {
  selectedTeeBox: TeeBox;
  onBack: () => void;
  onContinue: (players: Player[]) => void;
}

export function PlayerSetup({ selectedTeeBox, onBack, onContinue }: PlayerSetupProps) {
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player3Name, setPlayer3Name] = useState('');
  const [player4Name, setPlayer4Name] = useState('');
  const [player1Handicap, setPlayer1Handicap] = useState('');
  const [player2Handicap, setPlayer2Handicap] = useState('');
  const [player3Handicap, setPlayer3Handicap] = useState('');
  const [player4Handicap, setPlayer4Handicap] = useState('');



  return (
    <div className="min-h-screen bg-background p-4">
      <div className="min-h-[calc(100vh-2rem)] border-4 border-augusta-yellow rounded-3xl flex flex-col">
        {/* Header and Content */}
        <div className="container mx-auto px-4 py-8 sm:py-12 flex-1">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-5-percent-larger sm:text-5-percent-larger font-playfair-black text-augusta-yellow">
                Players
              </h1>
            </div>

            {/* Content Area */}
            <div className="w-full max-w-2xl space-y-8">
              {/* Player 1 Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="player1Name" className="text-augusta-yellow font-playfair text-xl">
                    Player 1
                  </Label>
                  <Label htmlFor="player1Handicap" className="text-augusta-yellow font-playfair text-xl">
                    Handicap
                  </Label>
                </div>
                <div className="flex gap-4">
                  <Input
                    id="player1Name"
                    type="text"
                    placeholder="Enter your name..."
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    className="flex-1 text-augusta-yellow font-playfair text-lg bg-transparent border-2 border-augusta-yellow rounded-2xl px-6 py-4 placeholder:text-augusta-yellow/60 focus:ring-augusta-yellow focus:border-augusta-yellow"
                  />
                  <Input
                    id="player1Handicap"
                    type="number"
                    placeholder=""
                    value={player1Handicap}
                    onChange={(e) => setPlayer1Handicap(e.target.value)}
                    min="0"
                    max="99"
                    className="w-24 text-augusta-yellow font-playfair text-lg bg-transparent border-2 border-augusta-yellow rounded-2xl px-4 py-4 placeholder:text-augusta-yellow/60 focus:ring-augusta-yellow focus:border-augusta-yellow text-center no-spinners"
                  />
                </div>
              </div>

              {/* Player 2 Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="player2Name" className="text-augusta-yellow font-playfair text-xl">
                    Player 2
                  </Label>
                  <Label htmlFor="player2Handicap" className="text-augusta-yellow font-playfair text-xl">
                    Handicap
                  </Label>
                </div>
                <div className="flex gap-4">
                  <Input
                    id="player2Name"
                    type="text"
                    placeholder="Enter your name..."
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    className="flex-1 text-augusta-yellow font-playfair text-lg bg-transparent border-2 border-augusta-yellow rounded-2xl px-6 py-4 placeholder:text-augusta-yellow/60 focus:ring-augusta-yellow focus:border-augusta-yellow"
                  />
                  <Input
                    id="player2Handicap"
                    type="number"
                    placeholder=""
                    value={player2Handicap}
                    onChange={(e) => setPlayer2Handicap(e.target.value)}
                    min="0"
                    max="99"
                    className="w-24 text-augusta-yellow font-playfair text-lg bg-transparent border-2 border-augusta-yellow rounded-2xl px-4 py-4 placeholder:text-augusta-yellow/60 focus:ring-augusta-yellow focus:border-augusta-yellow text-center no-spinners"
                  />
                </div>
              </div>

              {/* Player 3 Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="player3Name" className="text-augusta-yellow font-playfair text-xl">
                    Player 3
                  </Label>
                  <Label htmlFor="player3Handicap" className="text-augusta-yellow font-playfair text-xl">
                    Handicap
                  </Label>
                </div>
                <div className="flex gap-4">
                  <Input
                    id="player3Name"
                    type="text"
                    placeholder="Enter your name..."
                    value={player3Name}
                    onChange={(e) => setPlayer3Name(e.target.value)}
                    className="flex-1 text-augusta-yellow font-playfair text-lg bg-transparent border-2 border-augusta-yellow rounded-2xl px-6 py-4 placeholder:text-augusta-yellow/60 focus:ring-augusta-yellow focus:border-augusta-yellow"
                  />
                  <Input
                    id="player3Handicap"
                    type="number"
                    placeholder=""
                    value={player3Handicap}
                    onChange={(e) => setPlayer3Handicap(e.target.value)}
                    min="0"
                    max="99"
                    className="w-24 text-augusta-yellow font-playfair text-lg bg-transparent border-2 border-augusta-yellow rounded-2xl px-4 py-4 placeholder:text-augusta-yellow/60 focus:ring-augusta-yellow focus:border-augusta-yellow text-center no-spinners"
                  />
                </div>
              </div>

              {/* Player 4 Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="player4Name" className="text-augusta-yellow font-playfair text-xl">
                    Player 4
                  </Label>
                  <Label htmlFor="player4Handicap" className="text-augusta-yellow font-playfair text-xl">
                    Handicap
                  </Label>
                </div>
                <div className="flex gap-4">
                  <Input
                    id="player4Name"
                    type="text"
                    placeholder="Enter your name..."
                    value={player4Name}
                    onChange={(e) => setPlayer4Name(e.target.value)}
                    className="flex-1 text-augusta-yellow font-playfair text-lg bg-transparent border-2 border-augusta-yellow rounded-2xl px-6 py-4 placeholder:text-augusta-yellow/60 focus:ring-augusta-yellow focus:border-augusta-yellow"
                  />
                  <Input
                    id="player4Handicap"
                    type="number"
                    placeholder=""
                    value={player4Handicap}
                    onChange={(e) => setPlayer4Handicap(e.target.value)}
                    min="0"
                    max="99"
                    className="w-24 text-augusta-yellow font-playfair text-lg bg-transparent border-2 border-augusta-yellow rounded-2xl px-4 py-4 placeholder:text-augusta-yellow/60 focus:ring-augusta-yellow focus:border-augusta-yellow text-center no-spinners"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons - positioned at bottom */}
        <div className="container mx-auto px-4 pb-8 sm:pb-12">
          <div className="flex flex-col items-center space-y-4">
            <Button 
              onClick={() => {
                const playerData: Player[] = [];
                if (player1Name.trim()) playerData.push({ name: player1Name.trim(), handicap: player1Handicap || '0', teeColor: selectedTeeBox.color });
                if (player2Name.trim()) playerData.push({ name: player2Name.trim(), handicap: player2Handicap || '0', teeColor: selectedTeeBox.color });
                if (player3Name.trim()) playerData.push({ name: player3Name.trim(), handicap: player3Handicap || '0', teeColor: selectedTeeBox.color });
                if (player4Name.trim()) playerData.push({ name: player4Name.trim(), handicap: player4Handicap || '0', teeColor: selectedTeeBox.color });
                
                onContinue(playerData);
              }}
              disabled={!player1Name.trim()}
              className={`bg-augusta-yellow text-primary rounded-2xl w-40 h-32 text-3xl sm:text-4xl font-playfair hover:bg-augusta-yellow/90 border-2 border-augusta-yellow shadow-lg inset-border-augusta-green flex flex-col items-center justify-center ${
                !player1Name.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Continue
            </Button>
            
            <Button 
              onClick={onBack}
              className="bg-transparent text-augusta-yellow-dark rounded-2xl px-8 py-4 text-xl font-playfair hover:bg-augusta-yellow-dark/10 border-2 border-transparent"
            >
              Back to Course
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}