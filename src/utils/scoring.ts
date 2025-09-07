import { Player, HoleScore, GameState } from '../types/game';

// Calculate net score based on gross score and handicap
export const calculateNetScore = (grossScore: number, handicapIndex: number, holeIndex: number, courseRating: number = 72, slopeRating: number = 113, strokeIndex: number = holeIndex + 1): number => {
  // Calculate course handicap using USGA formula
  // Course Handicap = (Handicap Index × Slope Rating ÷ 113) + (Course Rating - Par)
  // For simplicity, assuming par = 72, so (Course Rating - Par) is (courseRating - 72)
  const courseHandicap = Math.round((handicapIndex * slopeRating / 113) + (courseRating - 72));
  
  // Determine strokes received on this hole based on stroke index
  // Players receive strokes on holes with stroke index <= their course handicap
  const strokesOnThisHole = strokeIndex <= Math.abs(courseHandicap) ? Math.sign(courseHandicap) : 0;
  
  // For very high handicaps, players might receive 2 strokes on easier holes
  const extraStrokes = Math.abs(courseHandicap) > 18 && strokeIndex <= (Math.abs(courseHandicap) - 18) ? Math.sign(courseHandicap) : 0;
  
  const totalStrokes = strokesOnThisHole + extraStrokes;
  
  return Math.max(0, grossScore - totalStrokes);
};

// Calculate Stableford points based on net score and par
export const calculateStableford = (netScore: number, par: number): number => {
  const scoreToPar = netScore - par;
  if (scoreToPar <= -3) return 5; // Albatross or better
  if (scoreToPar === -2) return 4; // Eagle
  if (scoreToPar === -1) return 3; // Birdie
  if (scoreToPar === 0) return 2;  // Par
  if (scoreToPar === 1) return 1;  // Bogey
  return 0; // Double bogey or worse
};

// Calculate skins for completed holes
export const calculateSkins = (players: Player[], gameState: GameState) => {
  const newSkins = { ...gameState.skins };
  let carryover = 1;

  for (let holeIndex = 0; holeIndex < gameState.currentHole - 1; holeIndex++) {
    const holeScores = players.map(player => ({
      name: player.name,
      score: gameState.scores[player.name][holeIndex].gross
    })).filter(p => p.score !== null);

    if (holeScores.length === 0) {
      continue;
    }

    const lowestScore = Math.min(...holeScores.map(p => p.score!));
    const winners = holeScores.filter(p => p.score === lowestScore);

    if (winners.length === 1) {
      // Single winner gets the skin(s)
      newSkins[winners[0].name] = (newSkins[winners[0].name] || 0) + carryover;
      carryover = 1; // Reset carryover
    } else {
      // Tie - carryover to next hole
      carryover++;
    }
  }

  return { skins: newSkins, nextHoleCarryover: carryover };
};

// Calculate Nassau points
export const calculateNassau = (players: Player[], gameState: GameState) => {
  const nassau = { ...gameState.nassauPoints };
  
  // Front 9 calculation (holes 1-9)
  if (gameState.currentHole > 9) {
    const front9Scores = players.map(player => {
      let total = 0;
      for (let i = 0; i < 9; i++) {
        const score = gameState.scores[player.name][i];
        if (score.gross !== null) total += score.gross;
      }
      return { name: player.name, total };
    });
    
    const front9Winner = front9Scores.reduce((min, player) => 
      player.total < min.total ? player : min
    );
    
    // Reset all front9 points and award to winner
    players.forEach(player => { nassau[player.name].front9 = 0; });
    nassau[front9Winner.name].front9 = 1;
  }

  // Back 9 calculation (holes 10-18) 
  if (gameState.currentHole > 18) {
    const back9Scores = players.map(player => {
      let total = 0;
      for (let i = 9; i < 18; i++) {
        const score = gameState.scores[player.name][i];
        if (score.gross !== null) total += score.gross;
      }
      return { name: player.name, total };
    });
    
    const back9Winner = back9Scores.reduce((min, player) => 
      player.total < min.total ? player : min
    );
    
    // Reset all back9 points and award to winner
    players.forEach(player => { nassau[player.name].back9 = 0; });
    nassau[back9Winner.name].back9 = 1;

    // Overall 18 calculation
    const overallScores = players.map(player => {
      let total = 0;
      for (let i = 0; i < 18; i++) {
        const score = gameState.scores[player.name][i];
        if (score.gross !== null) total += score.gross;
      }
      return { name: player.name, total };
    });
    
    const overallWinner = overallScores.reduce((min, player) => 
      player.total < min.total ? player : min
    );
    
    // Reset all overall points and award to winner
    players.forEach(player => { nassau[player.name].overall = 0; });
    nassau[overallWinner.name].overall = 1;
  }

  return nassau;
};

// Calculate Six Point System for 3 players
export const calculateSixPointSystem = (players: Player[], gameState: GameState) => {
  if (players.length !== 3) return gameState.sixPointSystem;
  
  // Start fresh calculation each time
  const sixPoint: Record<string, number> = {};
  players.forEach(player => {
    sixPoint[player.name] = 0;
  });
  
  console.log('Six Point Debug - Starting calculation for holes 1 to', gameState.currentHole);
  
  // Calculate points for each hole up to and including the current hole
  // The current hole is included only when all three players have entered scores
  for (let holeIndex = 0; holeIndex < gameState.currentHole; holeIndex++) {
    const holeScores = players.map(player => ({
      name: player.name,
      netScore: gameState.scores[player.name][holeIndex].net
    })).filter(p => p.netScore !== null);

    console.log(`Hole ${holeIndex + 1} scores:`, holeScores);

    if (holeScores.length !== 3) continue; // Skip if not all players completed the hole

    // Sort by net score (lowest first)
    holeScores.sort((a, b) => a.netScore! - b.netScore!);
    
    const [first, second, third] = holeScores;
    
    // Determine point allocation based on scores
    let holePoints: Record<string, number> = {};
    
    if (first.netScore === second.netScore && second.netScore === third.netScore) {
      // All three tied: 2-2-2
      holePoints[first.name] = 2;
      holePoints[second.name] = 2;
      holePoints[third.name] = 2;
      console.log(`Hole ${holeIndex + 1}: All tied at ${first.netScore} -> 2-2-2`);
    } else if (first.netScore === second.netScore) {
      // Two tied for first: 3-3-0
      holePoints[first.name] = 3;
      holePoints[second.name] = 3;
      holePoints[third.name] = 0;
      console.log(`Hole ${holeIndex + 1}: ${first.name} and ${second.name} tied for first at ${first.netScore}, ${third.name} at ${third.netScore} -> 3-3-0`);
    } else if (second.netScore === third.netScore) {
      // Two tied for second: 3-1-1
      holePoints[first.name] = 3;
      holePoints[second.name] = 1;
      holePoints[third.name] = 1;
      console.log(`Hole ${holeIndex + 1}: ${first.name} wins at ${first.netScore}, ${second.name} and ${third.name} tied at ${second.netScore} -> 3-1-1`);
    } else {
      // All different: 4-2-0
      holePoints[first.name] = 4;
      holePoints[second.name] = 2;
      holePoints[third.name] = 0;
      console.log(`Hole ${holeIndex + 1}: ${first.name} at ${first.netScore}, ${second.name} at ${second.netScore}, ${third.name} at ${third.netScore} -> 4-2-0`);
    }

    // Add hole points to running totals
    Object.keys(holePoints).forEach(playerName => {
      sixPoint[playerName] = (sixPoint[playerName] || 0) + holePoints[playerName];
    });
    
    console.log(`After hole ${holeIndex + 1}:`, sixPoint);
  }

  // Store points before reduction for debugging
  const beforeReduction = { ...sixPoint };

  // Apply reduction rule: reduce lowest to zero while maintaining spreads
  if (gameState.currentHole > 1 && Object.values(sixPoint).some(p => p > 0)) {
    const pointEntries = Object.entries(sixPoint).map(([name, points]) => ({ name, points }));
    pointEntries.sort((a, b) => a.points - b.points); // Sort by points (lowest first)
    
    const [lowest, middle, highest] = pointEntries;
    
    if (lowest.points > 0) {
      const reductionAmount = lowest.points;
      console.log(`Applying reduction rule: subtracting ${reductionAmount} from all players`);
      
      // Reduce all players by the lowest player's amount
      sixPoint[lowest.name] = 0;
      sixPoint[middle.name] = middle.points - reductionAmount;
      sixPoint[highest.name] = highest.points - reductionAmount;
    }
  }

  // Debug log to see calculations
  console.log('Six Point System Final Debug:', {
    currentHole: gameState.currentHole,
    beforeReduction,
    afterReduction: sixPoint,
    totalPoints: Object.values(sixPoint).reduce((sum, points) => sum + points, 0)
  });

  return sixPoint;
};

// Calculate Fourball scoring for 4 players (2 teams)
export const calculateFourball = (players: Player[], gameState: GameState, teams: { teamA: Player[], teamB: Player[] }) => {
  if (players.length !== 4 || !teams) return {};
  
  const { teamA, teamB } = teams;
  const fourballResults = {
    teamA: { name: 'Team A', holesWon: 0, players: teamA },
    teamB: { name: 'Team B', holesWon: 0, players: teamB }
  };

  // Calculate hole-by-hole results for completed holes
  // Include current hole if all players have scores entered
  const holesToCalculate = gameState.currentHole;
  
  for (let holeIndex = 0; holeIndex < holesToCalculate; holeIndex++) {
    // Get net scores for all players on this hole
    const teamAScores = teamA.map(player => {
      const score = gameState.scores[player.name][holeIndex];
      return score.net !== null ? score.net : null;
    }).filter(score => score !== null) as number[];
    
    const teamBScores = teamB.map(player => {
      const score = gameState.scores[player.name][holeIndex];
      return score.net !== null ? score.net : null;
    }).filter(score => score !== null) as number[];

    // Skip hole if either team doesn't have any complete scores
    if (teamAScores.length === 0 || teamBScores.length === 0) continue;

    // Get best ball (lowest net score) for each team
    const teamABest = Math.min(...teamAScores);
    const teamBBest = Math.min(...teamBScores);

    // Award hole to team with better score
    if (teamABest < teamBBest) {
      fourballResults.teamA.holesWon++;
    } else if (teamBBest < teamABest) {
      fourballResults.teamB.holesWon++;
    }
    // Ties don't award points to either team
  }

  return fourballResults;
};

// Calculate Foursomes scoring for 4 players (2 teams)
export const calculateFoursomes = (players: Player[], gameState: GameState, teams: { teamA: Player[], teamB: Player[] }) => {
  if (players.length !== 4 || !teams) return {};
  
  const { teamA, teamB } = teams;
  const foresomesResults = {
    teamA: { name: 'Team A', holesWon: 0, players: teamA },
    teamB: { name: 'Team B', holesWon: 0, players: teamB }
  };

  // In Foursomes, each team plays one ball, so we need team scores
  // For this implementation, we'll use the first player's score as the team score
  // In a real app, you'd have a different scoring interface for foursomes
  
  const holesToCalculate = gameState.currentHole;
  
  for (let holeIndex = 0; holeIndex < holesToCalculate; holeIndex++) {
    // Use first player's score as team score (simplified for now)
    const teamAScore = gameState.scores[teamA[0].name][holeIndex];
    const teamBScore = gameState.scores[teamB[0].name][holeIndex];

    if (teamAScore.net === null || teamBScore.net === null) continue;

    // Award hole to team with better score
    if (teamAScore.net < teamBScore.net) {
      foresomesResults.teamA.holesWon++;
    } else if (teamBScore.net < teamAScore.net) {
      foresomesResults.teamB.holesWon++;
    }
    // Ties don't award points to either team
  }

  return foresomesResults;
};

// Calculate Scramble scoring for 4 players (2 teams)
export const calculateScramble = (players: Player[], gameState: GameState, teams: { teamA: Player[], teamB: Player[] }) => {
  if (players.length !== 4 || !teams) return {};
  
  const { teamA, teamB } = teams;
  const scrambleResults = {
    teamA: { name: 'Team A', totalScore: 0, players: teamA },
    teamB: { name: 'Team B', totalScore: 0, players: teamB }
  };

  // In Scramble, teams select their best shot each time
  // For this implementation, we'll use the best gross score from each team
  
  const holesToCalculate = gameState.currentHole;
  
  for (let holeIndex = 0; holeIndex < holesToCalculate; holeIndex++) {
    // Get gross scores for all players on this hole
    const teamAScores = teamA.map(player => {
      const score = gameState.scores[player.name][holeIndex];
      return score.gross !== null ? score.gross : null;
    }).filter(score => score !== null) as number[];
    
    const teamBScores = teamB.map(player => {
      const score = gameState.scores[player.name][holeIndex];
      return score.gross !== null ? score.gross : null;
    }).filter(score => score !== null) as number[];

    // Skip hole if either team doesn't have any complete scores
    if (teamAScores.length === 0 || teamBScores.length === 0) continue;

    // Use best (lowest) score for each team
    const teamABest = Math.min(...teamAScores);
    const teamBBest = Math.min(...teamBScores);

    scrambleResults.teamA.totalScore += teamABest;
    scrambleResults.teamB.totalScore += teamBBest;
  }

  return scrambleResults;
};