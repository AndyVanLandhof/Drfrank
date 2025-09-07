import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
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

    // 2-player Match Play (NET per hole). Keep other formats going regardless.
    if (isMatchPlay && cumulativeScores.length === 2) {
      const [player1, player2] = cumulativeScores;
      let player1HolesWon = 0;
      let player2HolesWon = 0;

      for (let holeIndex = 0; holeIndex < gameState.currentHole; holeIndex++) {
        const s1 = gameState.scores[player1.name][holeIndex];
        const s2 = gameState.scores[player2.name][holeIndex];
        if (s1.net !== null && s2.net !== null) {
          if (s1.net < s2.net) player1HolesWon++;
          else if (s2.net < s1.net) player2HolesWon++;
        }
      }

      const holeDiff = player1HolesWon - player2HolesWon;
      const totalHoles = Array.isArray(gameState.course) ? gameState.course.length : 18;
      const holesRemaining = Math.max(0, totalHoles - gameState.currentHole);

      if (Math.abs(holeDiff) > holesRemaining) {
        const lead = Math.abs(holeDiff);
        if (holeDiff > 0) statusLines.push(`${player1.name} wins ${lead}&${holesRemaining}`);
        else statusLines.push(`${player2.name} wins ${lead}&${holesRemaining}`);
      } else if (holeDiff === 0) {
        statusLines.push("All Square");
      } else if (holeDiff > 0) {
        statusLines.push(`${player1.name} is ${leadText(holeDiff)}-Up`);
      } else {
        statusLines.push(`${player2.name} is ${leadText(-holeDiff)}-Up`);
      }
    }

    // Skins
    if (isSkins) {
      const { skins } = calculateSkins(players, gameState);
      const entries = Object.entries(skins).filter(([_, c]) => c > 0);
      if (entries.length > 0) {
        const max = Math.max(...Object.values(skins));
        const leaders = entries.filter(([_, c]) => c === max).map(([n]) => n);
        statusLines.push(leaders.length === 1 ? `${leaders[0]} has ${max} skin${max > 1 ? 's' : ''}` : `Tied with ${max} skin${max > 1 ? 's' : ''}`);
      } else {
        statusLines.push("No skins won yet");
      }
    }

    // Nassau
    if (isNassau) {
      const nassau = calculateNassau(players, gameState);
      if (gameState.currentHole > 9) {
        const front = Object.entries(nassau).find(([_, p]) => p.front9 > 0);
        if (front) statusLines.push(`${front[0]} won Front 9`);
        if (gameState.currentHole > 18) {
          const totals = Object.entries(nassau).map(([name, p]) => ({ name, total: p.front9 + p.back9 + p.overall }));
          const max = Math.max(...totals.map(t => t.total));
          const winner = totals.find(t => t.total === max);
          if (winner && max > 0) {
            const other = Math.max(...totals.filter(t => t.name !== winner.name).map(t => t.total));
            statusLines.push(`Nassau: ${max}-${other}`);
          }
        }
      }
    }

    // Six Point System (3 players)
    if (isSixPoint && players.length === 3) {
      const sixPoint = calculateSixPointSystem(players, gameState);
      const vals = Object.values(sixPoint);
      const max = Math.max(...vals);
      if (max > 0) {
        const leaders = Object.entries(sixPoint).filter(([_, v]) => v === max);
        if (leaders.length === 1) statusLines.push(`Six Point: ${leaders[0][0]} leads with ${max}`);
        else statusLines.push(`Six Point: Tied at ${max}`);
      } else {
        statusLines.push("Six Point: All tied at 0");
      }
    }

    // Fourball (team match play)
    if (isFourball && teams && players.length === 4) {
      const fb: any = calculateFourball(players, gameState, teams);
      if (fb.teamA && fb.teamB) {
        const diff = (fb.teamA.holesWon || 0) - (fb.teamB.holesWon || 0);
        const totalHoles = Array.isArray(gameState.course) ? gameState.course.length : 18;
        const holesRemaining = Math.max(0, totalHoles - gameState.currentHole);
        if (Math.abs(diff) > holesRemaining) statusLines.push(`Fourball: Team ${diff > 0 ? 'A' : 'B'} wins ${Math.abs(diff)}&${holesRemaining}`);
        else if (diff === 0) statusLines.push("Fourball: All Square");
        else statusLines.push(`Fourball: Team ${diff > 0 ? 'A' : 'B'} ${Math.abs(diff)}-Up`);
      }
    }

    // Foursomes (team match play)
    if (isFoursomes && teams && players.length === 4) {
      const fs: any = calculateFoursomes(players, gameState, teams);
      if (fs.teamA && fs.teamB) {
        const diff = (fs.teamA.holesWon || 0) - (fs.teamB.holesWon || 0);
        const totalHoles = Array.isArray(gameState.course) ? gameState.course.length : 18;
        const holesRemaining = Math.max(0, totalHoles - gameState.currentHole);
        if (Math.abs(diff) > holesRemaining) statusLines.push(`Foursomes: Team ${diff > 0 ? 'A' : 'B'} wins ${Math.abs(diff)}&${holesRemaining}`);
        else if (diff === 0) statusLines.push("Foursomes: All Square");
        else statusLines.push(`Foursomes: Team ${diff > 0 ? 'A' : 'B'} ${Math.abs(diff)}-Up`);
      }
    }

    // Scramble (aggregate), informational only
    if (isScramble && teams && players.length === 4) {
      const sc: any = calculateScramble(players, gameState, teams);
      if (sc.teamA && sc.teamB) {
        const a = sc.teamA.totalScore || 0;
        const b = sc.teamB.totalScore || 0;
        if (a === 0 && b === 0) statusLines.push("Scramble: No scores yet");
        else if (a === b) statusLines.push("Scramble: Teams tied");
        else statusLines.push(`Scramble: Team ${a < b ? 'A' : 'B'} leads by ${Math.abs(a - b)}`);
      }
    }

    // Fallback stroke-play leaderboard line if nothing else
    if (statusLines.length === 0) {
      if (cumulativeScores.length === 2) {
        const [p1, p2] = cumulativeScores;
        const diff = p1.grossTotal - p2.grossTotal;
        if (diff === 0) statusLines.push("Tied");
        else statusLines.push(`${diff > 0 ? p2.name : p1.name} leads by ${Math.abs(diff)} stroke${Math.abs(diff) > 1 ? 's' : ''}`);
      } else {
        const sorted = [...cumulativeScores].sort((a, b) => a.grossTotal - b.grossTotal);
        const leader = sorted[0];
        const ahead = (sorted[1]?.grossTotal ?? leader.grossTotal) - leader.grossTotal;
        statusLines.push(ahead === 0 ? "Tied for the lead" : `${leader.name} leads by ${ahead} stroke${ahead > 1 ? 's' : ''}`);
      }
    }

    return statusLines;
  };

  function leadText(n: number) { return `${n}`; }

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
            
            {/* Hole Name, Yardage, Stroke Index */}
            <div className="text-center">
              <p className="text-2xl font-playfair text-augusta-yellow-dark">
                {(() => {
                  const currentHole = gameState.course[gameState.currentHole - 1];
                  const name = currentHole.name || `Hole ${gameState.currentHole}`;
                  const defaultTeeColor = players[0]?.teeColor || 'white';
                  let yardage = 0;
                  if ('yardages' in currentHole && currentHole.yardages) {
                    yardage = currentHole.yardages[defaultTeeColor] || currentHole.yardages.white || 0;
                  } else if ('yardage' in currentHole && currentHole.yardage) {
                    yardage = currentHole.yardage;
                  }
                  // Resolve stroke index for selected tee
                  const strokeIndex = typeof currentHole.strokeIndex === 'object'
                    ? currentHole.strokeIndex[defaultTeeColor] || currentHole.strokeIndex.white || gameState.currentHole
                    : currentHole.strokeIndex || gameState.currentHole;
                  const yardText = yardage > 0 ? `${yardage} yards` : '';
                  return `${name}${yardText ? ' • ' + yardText : ''} • S.I. ${strokeIndex}`;
                })()}
              </p>
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
                      {/* Handicap strokes indicator */}
                      {(() => {
                        const hole = gameState.course[gameState.currentHole - 1];
                        const tee = playerTeeColor;
                        const strokeIndex = typeof hole.strokeIndex === 'object'
                          ? hole.strokeIndex[tee] || hole.strokeIndex.white || gameState.currentHole
                          : hole.strokeIndex || gameState.currentHole;
                        // Compute strokes for this player on this hole (same logic inputs as calculateNetScore)
                        const playerObj = players.find(p => p.name === player.name);
                        const handicap = parseInt(playerObj?.handicap || '0') || 0;
                        const playerTeeBox = (selectedCourse?.teeBoxes || []).find(t => t.color === tee);
                        const courseRating = playerTeeBox?.courseRating || 72;
                        const slopeRating = playerTeeBox?.slopeRating || 113;
                        const courseHandicap = Math.round((handicap * (slopeRating) / 113) + (courseRating - 72));
                        const strokesOnThisHole = strokeIndex <= Math.abs(courseHandicap) ? Math.sign(courseHandicap) : 0;
                        const extraStrokes = Math.abs(courseHandicap) > 18 && strokeIndex <= (Math.abs(courseHandicap) - 18) ? Math.sign(courseHandicap) : 0;
                        const totalStrokes = strokesOnThisHole + extraStrokes;
                        if (totalStrokes > 0) {
                          return (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-4 h-4 text-augusta-yellow" />
                              <span className="text-xs font-playfair text-augusta-yellow-dark">
                                {totalStrokes} {totalStrokes === 1 ? 'Stroke' : 'Strokes'}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
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
                        className={`w-32 h-24 md:w-36 md:h-28 text-center text-3xl md:text-4xl leading-none font-playfair bg-transparent border-2 rounded-xl no-spinners ${
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