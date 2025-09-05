import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Player } from "../types/game";

interface HoleScore {
  gross: number | null;
  net: number | null;
  stableford: number;
}

interface ResultsPageProps {
  players: Player[];
  selectedFormats: string[];
  gameResults: any;
  onNewRound: () => void;
}

export function ResultsPage({ players, selectedFormats, gameResults, onNewRound }: ResultsPageProps) {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const formatResults = gameResults.formatResults;
  const scores = gameResults.finalScores || gameResults.gameState?.scores;

  // Calculate totals for each player
  const calculatePlayerTotals = (playerName: string) => {
    const playerScores = scores[playerName] || [];
    
    let front9Gross = 0, front9Net = 0, front9Stableford = 0;
    let back9Gross = 0, back9Net = 0, back9Stableford = 0;
    let totalGross = 0, totalNet = 0, totalStableford = 0;
    
    playerScores.forEach((hole: HoleScore, index: number) => {
      if (hole.gross !== null) {
        if (index < 9) {
          front9Gross += hole.gross;
          front9Net += hole.net || hole.gross;
          front9Stableford += hole.stableford;
        } else {
          back9Gross += hole.gross;
          back9Net += hole.net || hole.gross;
          back9Stableford += hole.stableford;
        }
        totalGross += hole.gross;
        totalNet += hole.net || hole.gross;
        totalStableford += hole.stableford;
      }
    });
    
    return {
      front9: { gross: front9Gross, net: front9Net, stableford: front9Stableford },
      back9: { gross: back9Gross, net: back9Net, stableford: back9Stableford },
      total: { gross: totalGross, net: totalNet, stableford: totalStableford }
    };
  };

  const nextPlayer = () => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
  };

  const prevPlayer = () => {
    setCurrentPlayerIndex((prev) => (prev - 1 + players.length) % players.length);
  };

  const currentPlayer = players[currentPlayerIndex];
  const currentPlayerTotals = calculatePlayerTotals(currentPlayer.name);
  const currentPlayerScores = scores[currentPlayer.name] || [];

  // Format results display
  const getFormatWinners = () => {
    const winners = [];
    
    if (selectedFormats.includes("matchplay") && formatResults.matchPlay?.length > 0) {
      winners.push(`Match Play: ${formatResults.matchPlay[0]}`);
    }
    
    if (selectedFormats.includes("skins") && formatResults.skins) {
      const maxSkins = Math.max(...Object.values(formatResults.skins) as number[]);
      const skinsWinners = Object.entries(formatResults.skins)
        .filter(([_, count]) => count === maxSkins && count > 0)
        .map(([name, count]) => `${name} (${count} skins)`);
      
      if (skinsWinners.length === 1) {
        winners.push(`Skins: ${skinsWinners[0]}`);
      } else if (skinsWinners.length > 1) {
        winners.push(`Skins: Tied - ${skinsWinners.join(", ")}`);
      }
    }
    
    if (selectedFormats.includes("nassau") && formatResults.nassau) {
      const totalPoints = Object.entries(formatResults.nassau).map(([name, points]: [string, any]) => ({
        name,
        total: points.front9 + points.back9 + points.overall
      }));
      
      const maxPoints = Math.max(...totalPoints.map(p => p.total));
      const nassauWinner = totalPoints.find(p => p.total === maxPoints);
      
      if (nassauWinner && maxPoints > 0) {
        const otherPoints = Math.max(...totalPoints.filter(p => p.name !== nassauWinner.name).map(p => p.total));
        winners.push(`Nassau: ${maxPoints}-${otherPoints}`);
      }
    }
    
    if (selectedFormats.includes("sixpoint") && formatResults.sixpoint) {
      const maxPoints = Math.max(...Object.values(formatResults.sixpoint) as number[]);
      const sixPointWinners = Object.entries(formatResults.sixpoint)
        .filter(([_, points]) => points === maxPoints && points > 0)
        .map(([name, points]) => `${name} (${points} pts)`);
      
      if (sixPointWinners.length === 1) {
        const otherScores = Object.entries(formatResults.sixpoint)
          .filter(([name, _]) => !sixPointWinners[0].includes(name))
          .map(([_, points]) => points as number)
          .sort((a, b) => b - a);
        winners.push(`Six Point: ${sixPointWinners[0]} - ${otherScores.join("-")}`);
      } else if (sixPointWinners.length > 1) {
        winners.push(`Six Point: Tied at ${maxPoints} points`);
      }
    }
    
    return winners;
  };

  return (
    <div className="min-h-screen bg-primary text-foreground p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-playfair-black text-augusta-yellow">
            Final Results
          </h1>
          <div className="h-1 w-20 bg-augusta-yellow mx-auto rounded-full"></div>
        </div>

        {/* Format Winners */}
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-augusta-yellow rounded-3xl p-6">
          <h2 className="text-2xl font-playfair text-augusta-yellow-dark text-center mb-4">
            Winners
          </h2>
          <div className="space-y-2">
            {getFormatWinners().map((result, index) => (
              <p key={index} className="text-lg font-playfair text-primary text-center">
                {result}
              </p>
            ))}
            {getFormatWinners().length === 0 && (
              <p className="text-lg font-playfair text-primary text-center">
                All tied!
              </p>
            )}
          </div>
        </Card>

        {/* Player Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={prevPlayer}
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full border-2 border-augusta-yellow bg-white/95 hover:bg-augusta-yellow/20"
            disabled={players.length <= 1}
          >
            <ChevronLeft className="w-6 h-6 text-primary" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-2xl font-playfair text-augusta-yellow">
              {currentPlayer.name}
            </h2>
            <p className="text-sm font-playfair text-augusta-yellow-dark">
              Handicap: {currentPlayer.handicap}
            </p>
            <div className="flex space-x-1 mt-2 justify-center">
              {players.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentPlayerIndex ? 'bg-augusta-yellow' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <Button
            onClick={nextPlayer}
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full border-2 border-augusta-yellow bg-white/95 hover:bg-augusta-yellow/20"
            disabled={players.length <= 1}
          >
            <ChevronRight className="w-6 h-6 text-primary" />
          </Button>
        </div>

        {/* Scorecard */}
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-augusta-yellow rounded-3xl p-4">
          
          {/* Summary Totals */}
          <div className="mb-6">
            <h3 className="text-xl font-playfair text-augusta-yellow-dark text-center mb-4">
              Summary
            </h3>
            <div className="grid grid-cols-4 gap-2 text-lg">
              <div className="font-playfair text-primary text-center">
                <p className="font-playfair">Period</p>
              </div>
              <div className="font-playfair text-primary text-center">
                <p>Gross</p>
              </div>
              <div className="font-playfair text-primary text-center">
                <p>Net</p>
              </div>
              <div className="font-playfair text-primary text-center">
                <p>Points</p>
              </div>
              
              {/* Front 9 */}
              <div className="text-center py-1 border-t border-gray-200">
                <p className="font-playfair text-primary">Front 9</p>
              </div>
              <div className="text-center py-1 border-t border-gray-200">
                <p className="text-primary">{currentPlayerTotals.front9.gross}</p>
              </div>
              <div className="text-center py-1 border-t border-gray-200">
                <p className="text-primary">{currentPlayerTotals.front9.net}</p>
              </div>
              <div className="text-center py-1 border-t border-gray-200">
                <p className="text-primary">{currentPlayerTotals.front9.stableford}</p>
              </div>
              
              {/* Back 9 */}
              <div className="text-center py-1">
                <p className="font-playfair text-primary">Back 9</p>
              </div>
              <div className="text-center py-1">
                <p className="text-primary">{currentPlayerTotals.back9.gross}</p>
              </div>
              <div className="text-center py-1">
                <p className="text-primary">{currentPlayerTotals.back9.net}</p>
              </div>
              <div className="text-center py-1">
                <p className="text-primary">{currentPlayerTotals.back9.stableford}</p>
              </div>
              
              {/* Total */}
              <div className="text-center py-1 border-t-2 border-primary">
                <p className="font-playfair text-primary">Total</p>
              </div>
              <div className="text-center py-1 border-t-2 border-primary">
                <p className="text-primary">{currentPlayerTotals.total.gross}</p>
              </div>
              <div className="text-center py-1 border-t-2 border-primary">
                <p className="text-primary">{currentPlayerTotals.total.net}</p>
              </div>
              <div className="text-center py-1 border-t-2 border-primary">
                <p className="text-primary">{currentPlayerTotals.total.stableford}</p>
              </div>
            </div>
          </div>

          {/* Detailed Scorecard */}
          <div>
            <h3 className="text-xl font-playfair text-augusta-yellow-dark text-center mb-4">
              Hole by Hole
            </h3>
            <div className="grid grid-cols-4 gap-1 text-lg">
              <div className="font-playfair text-primary text-center">
                <p>Hole</p>
              </div>
              <div className="font-playfair text-primary text-center">
                <p>Gross</p>
              </div>
              <div className="font-playfair text-primary text-center">
                <p>Net</p>
              </div>
              <div className="font-playfair text-primary text-center">
                <p>Points</p>
              </div>
              
              {currentPlayerScores.map((hole: HoleScore, index: number) => (
                <div key={index} className="contents">
                  <div className={`text-center py-1 ${index === 8 ? 'border-b-2 border-primary' : index === 8 || index === 17 ? 'border-b border-gray-200' : ''}`}>
                    <p className="font-playfair text-primary">{index + 1}</p>
                  </div>
                  <div className={`text-center py-1 ${index === 8 ? 'border-b-2 border-primary' : index === 8 || index === 17 ? 'border-b border-gray-200' : ''}`}>
                    <p className="text-primary">{hole.gross || '-'}</p>
                  </div>
                  <div className={`text-center py-1 ${index === 8 ? 'border-b-2 border-primary' : index === 8 || index === 17 ? 'border-b border-gray-200' : ''}`}>
                    <p className="text-primary">{hole.net || hole.gross || '-'}</p>
                  </div>
                  <div className={`text-center py-1 ${index === 8 ? 'border-b-2 border-primary' : index === 8 || index === 17 ? 'border-b border-gray-200' : ''}`}>
                    <p className="text-primary">{hole.stableford}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* New Round Button */}
        <Button
          onClick={onNewRound}
          className="w-full h-14 bg-augusta-yellow hover:bg-augusta-yellow-dark text-primary rounded-3xl text-xl font-playfair transition-colors"
        >
          <RotateCcw className="w-6 h-6 mr-2" />
          Start New Round
        </Button>
      </div>
    </div>
  );
}