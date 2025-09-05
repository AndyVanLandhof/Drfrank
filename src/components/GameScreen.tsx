import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MatchStatusDialog } from './MatchStatusDialog';
import { AUGUSTA_SPRINGS_COURSE } from '../constants/course';
import { Player, HoleScore, GameState } from '../types/game';
import { Course } from '../types/course';
import { 
  calculateNetScore, 
  calculateStableford, 
  calculateSkins, 
  calculateNassau, 
  calculateSixPointSystem,
  calculateFourball,
  calculateFoursomes,
  calculateScramble
} from '../utils/scoring';

interface GameScreenProps {
  players: Player[];
  selectedFormats: string[];
  teams?: { teamA: Player[], teamB: Player[] } | null;
  selectedCourse: Course | null;
  onBack: () => void;
  onGameComplete: (results: any) => void;
}

// Helper functions for tee box display
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

const getTeeDisplayName = (teeColor: string): string => {
  const names: Record<string, string> = {
    black: 'Black',
    blue: 'Blue',
    white: 'White',
    yellow: 'Yellow',
    red: 'Red',
    green: 'Green'
  };
  return names[teeColor.toLowerCase()] || teeColor;
};

export function GameScreen({ players, selectedFormats, teams, selectedCourse, onBack, onGameComplete }: GameScreenProps) {
  // Use selected course or fallback to Augusta Springs
  const courseData = selectedCourse ? selectedCourse.holes : AUGUSTA_SPRINGS_COURSE;
  
  // Track confirmed scores for each hole
  const [confirmedHoles, setConfirmedHoles] = useState<boolean[]>(new Array(18).fill(false));
  // Track match status modal
  const [showMatchStatus, setShowMatchStatus] = useState(false);

  const [gameState, setGameState] = useState<GameState>({
    currentHole: 1,
    scores: players.reduce((acc, player) => {
      acc[player.name] = Array(18).fill(null).map(() => ({ gross: null, net: null, stableford: 0 }));
      return acc;
    }, {} as Record<string, HoleScore[]>),
    course: courseData,
    skins: players.reduce((acc, player) => {
      acc[player.name] = 0;
      return acc;
    }, {} as Record<string, number>),
    skinsCarryover: 1, // Start with 1 skin available
    nassauPoints: players.reduce((acc, player) => {
      acc[player.name] = { front9: 0, back9: 0, overall: 0 };
      return acc;
    }, {} as Record<string, { front9: number; back9: number; overall: number }>),
    sixPointSystem: players.reduce((acc, player) => {
      acc[player.name] = 0;
      return acc;
    }, {} as Record<string, number>),
    // Team-based format results
    fourball: teams ? { teamA: { holesWon: 0 }, teamB: { holesWon: 0 } } : {},
    foursomes: teams ? { teamA: { holesWon: 0 }, teamB: { holesWon: 0 } } : {},
    scramble: teams ? { teamA: { totalScore: 0 }, teamB: { totalScore: 0 } } : {}
  });

  // Update score for a player on current hole
  const updateScore = (playerName: string, grossScore: number) => {
    const player = players.find(p => p.name === playerName);
    if (!player) return;

    const handicap = parseInt(player.handicap) || 0;
    const holeIndex = gameState.currentHole - 1;
    const holeData = gameState.course[holeIndex];
    const playerTeeColor = player.teeColor || 'white';
    
    // Handle flexible par structure
    const par = typeof holeData.par === 'object' ? holeData.par[playerTeeColor] || holeData.par.white || 4 : holeData.par;
    
    // Handle flexible stroke index structure
    const strokeIndex = typeof holeData.strokeIndex === 'object' 
      ? holeData.strokeIndex[playerTeeColor] || holeData.strokeIndex.white || (holeIndex + 1)
      : holeData.strokeIndex || (holeIndex + 1);
    
    // Get player's specific tee ratings
    const playerTeeBox = selectedCourse?.teeBoxes.find(tee => tee.color === playerTeeColor);
    const courseRating = playerTeeBox?.courseRating || 72;
    const slopeRating = playerTeeBox?.slopeRating || 113;
    
    const netScore = calculateNetScore(grossScore, handicap, holeIndex, courseRating, slopeRating, strokeIndex);
    const stableford = calculateStableford(netScore, par);

    setGameState(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [playerName]: prev.scores[playerName].map((score, index) => 
          index === holeIndex 
            ? { gross: grossScore, net: netScore, stableford }
            : score
        )
      }
    }));
  };

  const nextHole = () => {
    if (gameState.currentHole < 18) {
      // First update the game state to move to next hole, then calculate formats
      const newGameState = { ...gameState, currentHole: gameState.currentHole + 1 };
      
      // Update skins, Nassau, Six Point System, and team formats when moving to next hole
      const { skins, nextHoleCarryover } = calculateSkins(players, newGameState);
      const nassau = calculateNassau(players, newGameState);
      const sixPoint = calculateSixPointSystem(players, newGameState);
      
      // Calculate team-based formats if teams are set
      let fourball = gameState.fourball;
      let foursomes = gameState.foursomes;
      let scramble = gameState.scramble;
      
      if (teams && players.length === 4) {
        fourball = calculateFourball(players, gameState, teams);
        foursomes = calculateFoursomes(players, gameState, teams);
        scramble = calculateScramble(players, gameState, teams);
      }
      
      setGameState(prev => ({ 
        ...prev, 
        currentHole: newGameState.currentHole,
        skins,
        skinsCarryover: nextHoleCarryover,
        nassauPoints: nassau,
        sixPointSystem: sixPoint,
        fourball,
        foursomes,
        scramble
      }));
    } else {
      // Game complete - calculate final results
      const finalSkins = calculateSkins(players, gameState);
      const finalNassau = calculateNassau(players, gameState);
      const finalSixPoint = calculateSixPointSystem(players, gameState);
      const finalStatus = calculateMatchStatus();
      
      // Calculate final team format results
      let finalFourball = {};
      let finalFoursomes = {};
      let finalScramble = {};
      
      if (teams && players.length === 4) {
        finalFourball = calculateFourball(players, gameState, teams);
        finalFoursomes = calculateFoursomes(players, gameState, teams);
        finalScramble = calculateScramble(players, gameState, teams);
      }
      
      const results = {
        finalScores: gameState.scores,
        teams,
        gameState: {
          ...gameState,
          skins: finalSkins.skins,
          nassauPoints: finalNassau,
          sixPointSystem: finalSixPoint,
          fourball: finalFourball,
          foursomes: finalFoursomes,
          scramble: finalScramble
        },
        formatResults: {
          matchPlay: finalStatus,
          skins: finalSkins.skins,
          nassau: finalNassau,
          sixpoint: finalSixPoint,
          fourball: finalFourball,
          foursomes: finalFoursomes,
          scramble: finalScramble
        }
      };
      
      onGameComplete(results);
    }
  };

  const prevHole = () => {
    if (gameState.currentHole > 1) {
      setGameState(prev => ({ ...prev, currentHole: prev.currentHole - 1 }));
    }
  };

  // Toggle score confirmation for current hole
  const toggleScoreConfirmation = () => {
    const currentHoleIndex = gameState.currentHole - 1;
    setConfirmedHoles(prev => {
      const newConfirmed = [...prev];
      newConfirmed[currentHoleIndex] = !newConfirmed[currentHoleIndex];
      return newConfirmed;
    });
  };

  // Check if current hole is confirmed
  const isCurrentHoleConfirmed = confirmedHoles[gameState.currentHole - 1];

  // Check if all players have entered scores for current hole
  const allScoresEntered = players.every(player => 
    gameState.scores[player.name][gameState.currentHole - 1].gross !== null
  );

  // Calculate cumulative scores up to current hole
  const calculateCumulativeScores = () => {
    // Calculate current Six Point scores if Six Point is selected
    const currentSixPoint = selectedFormats.includes("sixpoint") && players.length === 3 
      ? calculateSixPointSystem(players, gameState)
      : {};
    
    return players.map(player => {
      let grossTotal = 0;
      let stablefordTotal = 0;
      let holesCompleted = 0;

      for (let holeIndex = 0; holeIndex < gameState.currentHole; holeIndex++) {
        const score = gameState.scores[player.name][holeIndex];
        if (score.gross !== null) {
          grossTotal += score.gross;
          stablefordTotal += score.stableford;
          holesCompleted++;
        }
      }

      return {
        name: player.name,
        grossTotal,
        stablefordTotal,
        holesCompleted,
        sixPointTotal: currentSixPoint[player.name] || 0
      };
    });
  };

  // Calculate match play status based on selected formats
  const calculateMatchStatus = () => {
    const cumulativeScores = calculateCumulativeScores();
    const isMatchPlay = selectedFormats.includes("matchplay");
    const isSkins = selectedFormats.includes("skins");
    const isNassau = selectedFormats.includes("nassau");
    const isSixPoint = selectedFormats.includes("sixpoint");
    const isFourball = selectedFormats.includes("fourball");
    const isFoursomes = selectedFormats.includes("foursomes");
    const isScramble = selectedFormats.includes("scramble");
    
    let statusLines: string[] = [];
    
    // Match Play Status
    if (isMatchPlay && cumulativeScores.length === 2) {
      const [player1, player2] = cumulativeScores;
      let player1HolesWon = 0;
      let player2HolesWon = 0;
      
      for (let holeIndex = 0; holeIndex < gameState.currentHole; holeIndex++) {
        const player1Score = gameState.scores[player1.name][holeIndex];
        const player2Score = gameState.scores[player2.name][holeIndex];
        
        if (player1Score.gross !== null && player2Score.gross !== null) {
          if (player1Score.gross < player2Score.gross) {
            player1HolesWon++;
          } else if (player2Score.gross < player1Score.gross) {
            player2HolesWon++;
          }
        }
      }
      
      const holeDifference = player1HolesWon - player2HolesWon;
      
      if (holeDifference === 0) {
        statusLines.push("All Square");
      } else if (holeDifference > 0) {
        statusLines.push(`${player1.name} is ${Math.abs(holeDifference)}-Up`);
      } else {
        statusLines.push(`${player2.name} is ${Math.abs(holeDifference)}-Up`);
      }
    }
    
    // Skins Status
    if (isSkins) {
      const { skins } = calculateSkins(players, gameState);
      const skinsEntries = Object.entries(skins).filter(([_, count]) => count > 0);
      
      if (skinsEntries.length > 0) {
        const maxSkins = Math.max(...Object.values(skins));
        const leaders = skinsEntries.filter(([_, count]) => count === maxSkins);
        
        if (leaders.length === 1) {
          const [leader, count] = leaders[0];
          statusLines.push(`${leader} has ${count} skin${count > 1 ? 's' : ''}`);
        } else {
          statusLines.push(`Tied with ${maxSkins} skin${maxSkins > 1 ? 's' : ''} each`);
        }
      } else {
        statusLines.push("No skins won yet");
      }
    }
    
    // Nassau Status
    if (isNassau) {
      const nassau = calculateNassau(players, gameState);
      
      if (gameState.currentHole > 9) {
        // Show front 9 results
        const front9Winner = Object.entries(nassau).find(([_, points]) => points.front9 > 0);
        if (front9Winner) {
          statusLines.push(`${front9Winner[0]} won Front 9`);
        }
        
        if (gameState.currentHole > 18) {
          // Show final Nassau results
          const totalPoints = Object.entries(nassau).map(([name, points]) => ({
            name,
            total: points.front9 + points.back9 + points.overall
          }));
          
          const maxPoints = Math.max(...totalPoints.map(p => p.total));
          const nassauWinner = totalPoints.find(p => p.total === maxPoints);
          
          if (nassauWinner && maxPoints > 0) {
            const otherPoints = Math.max(...totalPoints.filter(p => p.name !== nassauWinner.name).map(p => p.total));
            statusLines.push(`Nassau: ${maxPoints}-${otherPoints}`);
          }
        }
      }
    }
    
    // Six Point System Status
    if (isSixPoint && players.length === 3) {
      const sixPoint = calculateSixPointSystem(players, gameState); // Recalculate for current status
      console.log('Six Point Status - Current calculations:', sixPoint);
      
      const sixPointEntries = Object.entries(sixPoint);
      const allValues = Object.values(sixPoint);
      const maxPoints = Math.max(...allValues);
      const hasAnyPoints = maxPoints > 0;
      
      if (hasAnyPoints) {
        const leaders = sixPointEntries.filter(([_, points]) => points === maxPoints);
        
        if (leaders.length === 1) {
          const [leader, points] = leaders[0];
          const otherScores = sixPointEntries
            .filter(([name, _]) => name !== leader)
            .map(([_, points]) => points)
            .sort((a, b) => b - a);
          
          statusLines.push(`Six Point: ${leader} leads ${points}-${otherScores[0]}-${otherScores[1]}`);
        } else {
          // Multiple leaders tied - show all three scores
          const sortedScores = allValues.sort((a, b) => b - a);
          statusLines.push(`Six Point: Tied ${sortedScores[0]}-${sortedScores[1]}-${sortedScores[2]}`);
        }
      } else {
        statusLines.push("Six Point: All tied at 0");
      }
    }

    // Fourball Status
    if (isFourball && teams && players.length === 4) {
      // Calculate current fourball status
      const currentFourball = calculateFourball(players, gameState, teams) as any;
      if (currentFourball.teamA && currentFourball.teamB) {
        const teamAHoles = currentFourball.teamA.holesWon || 0;
        const teamBHoles = currentFourball.teamB.holesWon || 0;
        const holeDifference = teamAHoles - teamBHoles;
        
        if (holeDifference === 0) {
          statusLines.push("Fourball: All Square");
        } else if (holeDifference > 0) {
          statusLines.push(`Fourball: Team A ${Math.abs(holeDifference)}-Up`);
        } else {
          statusLines.push(`Fourball: Team B ${Math.abs(holeDifference)}-Up`);
        }
      }
    }

    // Foursomes Status
    if (isFoursomes && teams && players.length === 4) {
      // Calculate current foursomes status
      const currentFoursomes = calculateFoursomes(players, gameState, teams) as any;
      if (currentFoursomes.teamA && currentFoursomes.teamB) {
        const teamAHoles = currentFoursomes.teamA.holesWon || 0;
        const teamBHoles = currentFoursomes.teamB.holesWon || 0;
        const holeDifference = teamAHoles - teamBHoles;
        
        if (holeDifference === 0) {
          statusLines.push("Foursomes: All Square");
        } else if (holeDifference > 0) {
          statusLines.push(`Foursomes: Team A ${Math.abs(holeDifference)}-Up`);
        } else {
          statusLines.push(`Foursomes: Team B ${Math.abs(holeDifference)}-Up`);
        }
      }
    }

    // Scramble Status
    if (isScramble && teams && players.length === 4) {
      // Calculate current scramble status
      const currentScramble = calculateScramble(players, gameState, teams) as any;
      if (currentScramble.teamA && currentScramble.teamB) {
        const teamAScore = currentScramble.teamA.totalScore || 0;
        const teamBScore = currentScramble.teamB.totalScore || 0;
        
        if (teamAScore === 0 && teamBScore === 0) {
          statusLines.push("Scramble: No scores yet");
        } else if (teamAScore === teamBScore) {
          statusLines.push("Scramble: Teams tied");
        } else if (teamAScore < teamBScore) {
          statusLines.push(`Scramble: Team A leads by ${teamBScore - teamAScore}`);
        } else {
          statusLines.push(`Scramble: Team B leads by ${teamAScore - teamBScore}`);
        }
      }
    }
    
    // Fallback to stroke play if no other formats
    if (statusLines.length === 0) {
      if (cumulativeScores.length === 2) {
        const [player1, player2] = cumulativeScores;
        const strokeDifference = player1.grossTotal - player2.grossTotal;
        
        if (strokeDifference === 0) {
          statusLines.push("Tied");
        } else if (strokeDifference > 0) {
          statusLines.push(`${player2.name} leads by ${Math.abs(strokeDifference)} stroke${Math.abs(strokeDifference) > 1 ? 's' : ''}`);
        } else {
          statusLines.push(`${player1.name} leads by ${Math.abs(strokeDifference)} stroke${Math.abs(strokeDifference) > 1 ? 's' : ''}`);
        }
      } else {
        const sortedByGross = [...cumulativeScores].sort((a, b) => a.grossTotal - b.grossTotal);
        const leader = sortedByGross[0];
        const strokesAhead = sortedByGross[1]?.grossTotal - leader.grossTotal;
        
        if (strokesAhead === 0) {
          statusLines.push("Tied for the lead");
        } else {
          statusLines.push(`${leader.name} leads by ${strokesAhead} stroke${strokesAhead > 1 ? 's' : ''}`);
        }
      }
    }
    
    return statusLines;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="min-h-[calc(100vh-2rem)] border-4 border-augusta-yellow rounded-3xl flex flex-col">
        {/* Header - Course and Hole Info */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center space-y-3">
            {/* Course Name */}
            <h1 className="text-lg font-playfair text-augusta-yellow-dark">
              {selectedCourse ? selectedCourse.name : 'Augusta Springs Golf Club'}
            </h1>
            
            {/* Hole Number - Large like Players/Format pages */}
            <div className="text-center">
              <h2 className="text-5xl font-playfair-black text-augusta-yellow">
                Hole {gameState.currentHole}
              </h2>
              <div className="flex items-center justify-center space-x-8 mt-3">
                <Button
                  onClick={prevHole}
                  disabled={gameState.currentHole === 1}
                  className="p-2 rounded-xl bg-transparent border-2 border-augusta-yellow text-augusta-yellow hover:bg-augusta-yellow/10 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <p className="text-2xl font-playfair text-augusta-yellow">
                  Par {(() => {
                    const holeData = gameState.course[gameState.currentHole - 1];
                    // Show par for white tees as default, or the numeric par if simple structure
                    const par = typeof holeData.par === 'object' 
                      ? holeData.par.white || holeData.par.red || Object.values(holeData.par)[0] || 4 
                      : holeData.par;
                    return par;
                  })()}
                </p>
                <Button
                  onClick={nextHole}
                  disabled={gameState.currentHole === 18}
                  className="p-2 rounded-xl bg-transparent border-2 border-augusta-yellow text-augusta-yellow hover:bg-augusta-yellow/10 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Hole Name and Yardage */}
            <div className="text-center">
              <p className="text-base font-playfair text-augusta-yellow-dark">
                {gameState.course[gameState.currentHole - 1].name || `Hole ${gameState.currentHole}`}
              </p>
              {/* Display yardage for selected tee or default white tees */}
              {(() => {
                const currentHole = gameState.course[gameState.currentHole - 1];
                let defaultYardage = 0;
                
                // Get default tee color from first player, or use white
                const defaultTeeColor = players[0]?.teeColor || 'white';
                
                if ('yardages' in currentHole && currentHole.yardages) {
                  // New structure: per-tee yardages
                  defaultYardage = currentHole.yardages[defaultTeeColor] || currentHole.yardages.white || 0;
                } else if ('yardage' in currentHole && currentHole.yardage) {
                  // Old structure: single yardage for all tees
                  defaultYardage = currentHole.yardage;
                }
                
                if (defaultYardage > 0) {
                  return (
                    <p className="text-sm font-playfair text-augusta-yellow-dark">
                      {defaultYardage} yards
                    </p>
                  );
                }
                return null;
              })()}
            </div>
            
            {/* Skins Carryover Indicator */}
            {selectedFormats.includes("skins") && gameState.skinsCarryover > 1 && (
              <div className="text-center">
                <p className="text-lg font-playfair text-augusta-yellow">
                  {gameState.skinsCarryover === 2 ? "Two" : 
                   gameState.skinsCarryover === 3 ? "Three" : 
                   gameState.skinsCarryover === 4 ? "Four" : 
                   gameState.skinsCarryover === 5 ? "Five" : 
                   gameState.skinsCarryover} Skin Hole
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Content - Player Scoring */}
        <div className="container mx-auto px-4 flex-1">
          <div className="space-y-4">
            {players.map((player) => {
              const currentScore = gameState.scores[player.name][gameState.currentHole - 1];
              const playerTeeColor = player.teeColor || 'white';
              const currentHole = gameState.course[gameState.currentHole - 1];
              
              // Handle both old and new data structures for yardages
              let holeYardage = 0;
              if ('yardages' in currentHole && currentHole.yardages) {
                // New structure: per-tee yardages
                holeYardage = currentHole.yardages[playerTeeColor] || currentHole.yardages.white || 0;
              } else if ('yardage' in currentHole && currentHole.yardage) {
                // Old structure: single yardage for all tees
                holeYardage = currentHole.yardage;
              }
              
              return (
                <Card key={player.name} className="p-5 border-2 border-augusta-yellow bg-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-playfair text-augusta-yellow">{player.name}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center space-x-1">
                          <div 
                            className="w-3 h-3 rounded-full border border-augusta-yellow-dark"
                            style={{ backgroundColor: getTeeColor(playerTeeColor) }}
                          ></div>
                          <span className="text-sm font-playfair text-augusta-yellow-dark">
                            {getTeeDisplayName(playerTeeColor)}
                          </span>
                        </div>
                        {holeYardage > 0 && (
                          <span className="text-sm font-playfair text-augusta-yellow-dark">
                            {holeYardage}y
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <Input
                        type="number"
                        min="1"
                        max="15"
                        value={currentScore.gross || ''}
                        disabled={isCurrentHoleConfirmed}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            // Handle empty input - reset to null
                            setGameState(prev => ({
                              ...prev,
                              scores: {
                                ...prev.scores,
                                [player.name]: prev.scores[player.name].map((score, index) => 
                                  index === gameState.currentHole - 1 
                                    ? { gross: null, net: null, stableford: 0 }
                                    : score
                                )
                              }
                            }));
                          } else {
                            const score = parseInt(value);
                            if (!isNaN(score) && score >= 1 && score <= 15) {
                              updateScore(player.name, score);
                            }
                          }
                        }}
                        className={`w-20 h-14 text-center text-xl font-playfair bg-transparent border-2 rounded-xl no-spinners ${
                          isCurrentHoleConfirmed 
                            ? 'border-augusta-yellow-dark text-augusta-yellow-dark opacity-60 cursor-not-allowed' 
                            : 'border-augusta-yellow text-augusta-yellow'
                        }`}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
            
            {/* All Action Buttons - Centrally Aligned */}
            <div className="flex flex-col items-center justify-center space-y-4 mt-6 mb-4">
              {/* Confirm Scores Button */}
              <div className="flex justify-center w-full">
                <Button
                  onClick={toggleScoreConfirmation}
                  disabled={!allScoresEntered && !isCurrentHoleConfirmed}
                  className={`px-12 py-4 rounded-2xl text-2xl font-playfair border-2 w-full max-w-xs ${
                    isCurrentHoleConfirmed
                      ? 'bg-transparent border-augusta-yellow-dark text-augusta-yellow-dark hover:bg-augusta-yellow-dark/10'
                      : 'bg-transparent border-augusta-yellow text-augusta-yellow hover:bg-augusta-yellow/10'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  {isCurrentHoleConfirmed ? 'Amend Scores' : 'Confirm Scores'}
                </Button>
              </div>

              {/* Navigation and Status Buttons - Now both square */}
              <div className="flex justify-center items-center space-x-6">
                <MatchStatusDialog
                  open={showMatchStatus}
                  onOpenChange={setShowMatchStatus}
                  gameState={gameState}
                  players={players}
                  selectedFormats={selectedFormats}
                  teams={teams}
                  calculateMatchStatus={calculateMatchStatus}
                  calculateCumulativeScores={calculateCumulativeScores}
                />

                <Button
                  onClick={nextHole}
                  disabled={!isCurrentHoleConfirmed}
                  className="w-36 h-36 rounded-xl text-2xl font-playfair bg-transparent border-2 border-augusta-yellow text-augusta-yellow hover:bg-augusta-yellow/10 disabled:opacity-30 disabled:cursor-not-allowed flex flex-col items-center justify-center p-3"
                >
                  <span className="text-center leading-tight">
                    {gameState.currentHole >= 18 ? "View Results" : "Next Hole"}
                  </span>
                </Button>
              </div>

              {/* Back Button */}
              <div className="flex justify-center">
                <Button 
                  onClick={onBack}
                  className="bg-transparent text-augusta-yellow-dark rounded-2xl px-6 py-3 text-lg font-playfair hover:bg-augusta-yellow-dark/10 border-2 border-transparent"
                >
                  Back to Format
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Empty space for bottom padding */}
        <div className="pb-4"></div>
      </div>
    </div>
  );
}