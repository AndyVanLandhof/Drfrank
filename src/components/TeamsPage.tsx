import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Player } from '../types/game';
import { Course } from '../types/course';
import { AUGUSTA_SPRINGS_COURSE } from '../constants/course';

interface TeamsPageProps {
  players: Player[];
  selectedCourse?: Course | null;
  onBack: () => void;
  onContinue: (teamData: { teamA: Player[], teamB: Player[] } | null) => void;
}

export function TeamsPage({ players, selectedCourse, onBack, onContinue }: TeamsPageProps) {
  const [selectedPartner, setSelectedPartner] = useState<Player | null>(null);
  const [showStrokesDialog, setShowStrokesDialog] = useState(false);
  const [teamsFormed, setTeamsFormed] = useState(false);
  const [formedTeams, setFormedTeams] = useState<{ teamA: Player[], teamB: Player[] } | null>(null);

  // First player is always the main player
  const firstPlayer = players[0];
  const otherPlayers = players.slice(1);

  const handlePartnerSelection = (partner: Player) => {
    setSelectedPartner(partner);
    
    // Auto-form teams
    const teamA = [firstPlayer, partner];
    const teamB = otherPlayers.filter(p => p !== partner);
    
    setFormedTeams({ teamA, teamB });
    setTeamsFormed(true);
  };

  const handleSkipTeams = () => {
    onContinue(null);
  };

  const handleChooseFormat = () => {
    if (formedTeams) {
      onContinue(formedTeams);
    }
  };

  const handleBackToSelection = () => {
    setTeamsFormed(false);
    setSelectedPartner(null);
    setFormedTeams(null);
  };

  // Calculate strokes given for each player based on handicap differences
  const calculateStrokes = () => {
    const lowestHandicap = Math.min(...players.map(p => parseInt(p.handicap) || 0));
    return players.map(player => ({
      ...player,
      strokesReceived: (parseInt(player.handicap) || 0) - lowestHandicap
    }));
  };

  const strokesData = calculateStrokes();

  // Show teams confirmation view if teams have been formed
  if (teamsFormed && formedTeams) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="min-h-[calc(100vh-2rem)] border-4 border-augusta-yellow rounded-3xl flex flex-col">
          {/* Header and Content */}
          <div className="container mx-auto px-4 py-8 sm:py-12 flex-1">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-5-percent-larger sm:text-5-percent-larger font-playfair-black text-augusta-yellow">
                  Teams
                </h1>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Dialog open={showStrokesDialog} onOpenChange={setShowStrokesDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-transparent text-augusta-yellow-dark rounded-2xl px-8 py-4 text-2xl font-playfair hover:bg-augusta-yellow-dark/10 border-2 border-augusta-yellow-dark"
                    >
                      Strokes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-background border-4 border-augusta-yellow rounded-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-playfair text-augusta-yellow text-center">
                        Stroke Allocations
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 p-4">
                      {/* Players Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {strokesData.map((player, index) => (
                          <div key={index} className="bg-augusta-yellow/10 rounded-xl p-4 text-center">
                            <div className="text-augusta-yellow font-playfair font-bold">{player.name}</div>
                            <div className="text-augusta-yellow-dark font-playfair text-sm">HC: {player.handicap}</div>
                            <div className="text-augusta-yellow font-playfair text-sm">
                              {player.strokesReceived === 0 ? 'Scratch' : `+${player.strokesReceived} strokes`}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Hole-by-hole breakdown */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-playfair text-augusta-yellow text-center">
                          Strokes Given Per Hole
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Front 9 */}
                          <div className="space-y-2">
                            <h4 className="text-lg font-playfair text-augusta-yellow-dark text-center">Front 9</h4>
                            <div className="space-y-1 text-sm">
                              {(selectedCourse?.holes || AUGUSTA_SPRINGS_COURSE).slice(0, 9).map((hole, holeIndex) => {
                                const par = typeof hole.par === 'object' ? hole.par.white || hole.par.red || 4 : hole.par;
                                return (
                                  <div key={holeIndex} className="grid grid-cols-6 gap-2 py-1 border-b border-augusta-yellow/20">
                                    <div className="text-augusta-yellow font-playfair">{holeIndex + 1}</div>
                                    <div className="text-augusta-yellow-dark">Par {par}</div>
                                    {strokesData.map((player, playerIndex) => (
                                      <div key={playerIndex} className="text-augusta-yellow-dark text-center">
                                        {/* Stroke index calculation: holes 1-9 for handicaps 1-9, 10-18 for handicaps 10-18 */}
                                        {player.strokesReceived > holeIndex ? '●' : ''}
                                        {player.strokesReceived > holeIndex + 9 ? '●' : ''}
                                      </div>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Back 9 */}
                          <div className="space-y-2">
                            <h4 className="text-lg font-playfair text-augusta-yellow-dark text-center">Back 9</h4>
                            <div className="space-y-1 text-sm">
                              {AUGUSTA_SPRINGS_COURSE.slice(9, 18).map((hole, holeIndex) => (
                                <div key={holeIndex + 9} className="grid grid-cols-6 gap-2 py-1 border-b border-augusta-yellow/20">
                                  <div className="text-augusta-yellow font-playfair">{holeIndex + 10}</div>
                                  <div className="text-augusta-yellow-dark">Par {hole.par}</div>
                                  {strokesData.map((player, playerIndex) => (
                                    <div key={playerIndex} className="text-augusta-yellow-dark text-center">
                                      {player.strokesReceived > holeIndex + 9 ? '●' : ''}
                                      {player.strokesReceived > holeIndex + 18 ? '●' : ''}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center text-augusta-yellow-dark font-playfair text-sm">
                          ● = Stroke given on this hole
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Teams Display */}
              <div className="w-full max-w-4xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Team A */}
                  <div className="bg-augusta-yellow/20 rounded-2xl p-4 border-2 border-augusta-yellow">
                    <h3 className="text-2xl font-playfair text-augusta-yellow text-center mb-3">Team A</h3>
                    <div className="space-y-2">
                      <div className="text-center">
                        <div className="text-xl font-playfair text-augusta-yellow">
                          {formedTeams.teamA[0].name}
                        </div>
                        <div className="text-augusta-yellow-dark font-playfair text-base">
                          HC: {formedTeams.teamA[0].handicap}
                        </div>
                      </div>
                      <div className="text-center text-augusta-yellow-dark font-playfair text-lg">
                        playing with
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-playfair text-augusta-yellow">
                          {formedTeams.teamA[1].name}
                        </div>
                        <div className="text-augusta-yellow-dark font-playfair text-base">
                          HC: {formedTeams.teamA[1].handicap}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Team B */}
                  <div className="bg-augusta-yellow/20 rounded-2xl p-4 border-2 border-augusta-yellow">
                    <h3 className="text-2xl font-playfair text-augusta-yellow text-center mb-3">Team B</h3>
                    <div className="space-y-2">
                      <div className="text-center">
                        <div className="text-xl font-playfair text-augusta-yellow">
                          {formedTeams.teamB[0].name}
                        </div>
                        <div className="text-augusta-yellow-dark font-playfair text-base">
                          HC: {formedTeams.teamB[0].handicap}
                        </div>
                      </div>
                      <div className="text-center text-augusta-yellow-dark font-playfair text-lg">
                        playing with
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-playfair text-augusta-yellow">
                          {formedTeams.teamB[1].name}
                        </div>
                        <div className="text-augusta-yellow-dark font-playfair text-base">
                          HC: {formedTeams.teamB[1].handicap}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons - positioned at bottom */}
          <div className="container mx-auto px-4 pb-8 sm:pb-12">
            <div className="flex flex-col items-center space-y-4">
              <Button 
                onClick={handleChooseFormat}
                className="bg-augusta-yellow text-primary rounded-2xl w-40 h-32 text-2xl sm:text-3xl font-playfair hover:bg-augusta-yellow/90 border-2 border-augusta-yellow shadow-lg inset-border-augusta-green flex flex-col items-center justify-center"
              >
                <span>Choose</span>
                <span>Format</span>
              </Button>
              
              <Button 
                onClick={onBack}
                className="bg-transparent text-augusta-yellow-dark rounded-2xl px-8 py-4 text-2xl font-playfair hover:bg-augusta-yellow-dark/10 border-2 border-transparent"
              >
                Back to Players
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show partner selection view
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="min-h-[calc(100vh-2rem)] border-4 border-augusta-yellow rounded-3xl flex flex-col">
        {/* Header and Content */}
        <div className="container mx-auto px-4 py-8 sm:py-12 flex-1">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-5-percent-larger sm:text-5-percent-larger font-playfair-black text-augusta-yellow">
                Teams
              </h1>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button 
                onClick={handleSkipTeams}
                className="bg-transparent text-augusta-yellow-dark rounded-2xl px-8 py-4 text-2xl font-playfair hover:bg-augusta-yellow-dark/10 border-2 border-augusta-yellow-dark"
              >
                Skip Teams
              </Button>

              <Dialog open={showStrokesDialog} onOpenChange={setShowStrokesDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-transparent text-augusta-yellow-dark rounded-2xl px-8 py-4 text-2xl font-playfair hover:bg-augusta-yellow-dark/10 border-2 border-augusta-yellow-dark"
                  >
                    Strokes
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-background border-4 border-augusta-yellow rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-playfair text-augusta-yellow text-center">
                      Stroke Allocations
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 p-4">
                    {/* Players Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {strokesData.map((player, index) => (
                        <div key={index} className="bg-augusta-yellow/10 rounded-xl p-4 text-center">
                          <div className="text-augusta-yellow font-playfair font-bold">{player.name}</div>
                          <div className="text-augusta-yellow-dark font-playfair text-sm">HC: {player.handicap}</div>
                          <div className="text-augusta-yellow font-playfair text-sm">
                            {player.strokesReceived === 0 ? 'Scratch' : `+${player.strokesReceived} strokes`}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Hole-by-hole breakdown */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-playfair text-augusta-yellow text-center">
                        Strokes Given Per Hole
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Front 9 */}
                        <div className="space-y-2">
                          <h4 className="text-lg font-playfair text-augusta-yellow-dark text-center">Front 9</h4>
                          {/* Player initials header */}
                          <div className="grid grid-cols-6 gap-2 py-1 border-b-2 border-augusta-yellow/40">
                            <div className="text-augusta-yellow font-playfair font-bold">Hole</div>
                            <div className="text-augusta-yellow font-playfair font-bold">Par</div>
                            {strokesData.map((player, playerIndex) => (
                              <div key={playerIndex} className="text-augusta-yellow font-playfair font-bold text-center">
                                {player.name.charAt(0)}
                              </div>
                            ))}
                          </div>
                          <div className="space-y-1 text-sm">
                            {AUGUSTA_SPRINGS_COURSE.slice(0, 9).map((hole, holeIndex) => (
                              <div key={holeIndex} className="grid grid-cols-6 gap-2 py-1 border-b border-augusta-yellow/20">
                                <div className="text-augusta-yellow font-playfair">{holeIndex + 1}</div>
                                <div className="text-augusta-yellow-dark">Par {hole.par}</div>
                                {strokesData.map((player, playerIndex) => (
                                  <div key={playerIndex} className="text-augusta-yellow-dark text-center">
                                    {/* Stroke index calculation: holes 1-9 for handicaps 1-9, 10-18 for handicaps 10-18 */}
                                    {player.strokesReceived > holeIndex ? '●' : ''}
                                    {player.strokesReceived > holeIndex + 9 ? '●' : ''}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Back 9 */}
                        <div className="space-y-2">
                          <h4 className="text-lg font-playfair text-augusta-yellow-dark text-center">Back 9</h4>
                          {/* Player initials header */}
                          <div className="grid grid-cols-6 gap-2 py-1 border-b-2 border-augusta-yellow/40">
                            <div className="text-augusta-yellow font-playfair font-bold">Hole</div>
                            <div className="text-augusta-yellow font-playfair font-bold">Par</div>
                            {strokesData.map((player, playerIndex) => (
                              <div key={playerIndex} className="text-augusta-yellow font-playfair font-bold text-center">
                                {player.name.charAt(0)}
                              </div>
                            ))}
                          </div>
                          <div className="space-y-1 text-sm">
                            {AUGUSTA_SPRINGS_COURSE.slice(9, 18).map((hole, holeIndex) => (
                              <div key={holeIndex + 9} className="grid grid-cols-6 gap-2 py-1 border-b border-augusta-yellow/20">
                                <div className="text-augusta-yellow font-playfair">{holeIndex + 10}</div>
                                <div className="text-augusta-yellow-dark">Par {hole.par}</div>
                                {strokesData.map((player, playerIndex) => (
                                  <div key={playerIndex} className="text-augusta-yellow-dark text-center">
                                    {player.strokesReceived > holeIndex + 9 ? '●' : ''}
                                    {player.strokesReceived > holeIndex + 18 ? '●' : ''}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center text-augusta-yellow-dark font-playfair text-sm">
                        ● = Stroke given on this hole
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Team Selection Area */}
            <div className="w-full max-w-2xl space-y-6">
              {/* Main Player */}
              <div className="text-center">
                <div className="bg-augusta-yellow/20 rounded-2xl p-6 border-2 border-augusta-yellow">
                  <div className="text-3xl font-playfair text-augusta-yellow mb-2">
                    {firstPlayer.name}
                  </div>
                  <div className="text-augusta-yellow-dark font-playfair text-xl">
                    playing with...
                  </div>
                </div>
              </div>

              {/* Partner Selection */}
              <div className="space-y-4">
                <h3 className="text-2xl font-playfair text-augusta-yellow text-center">
                  Choose Your Partner
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {otherPlayers.map((player, index) => (
                    <button
                      key={index}
                      onClick={() => handlePartnerSelection(player)}
                      className="bg-augusta-yellow/10 hover:bg-augusta-yellow/20 border-2 border-augusta-yellow rounded-2xl p-4 transition-all duration-200 hover:scale-105"
                    >
                      <div className="text-augusta-yellow font-playfair text-xl">
                        {player.name}
                      </div>
                      <div className="text-augusta-yellow-dark font-playfair text-base">
                        HC: {player.handicap}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Teams Preview */}
              <div className="text-center text-augusta-yellow-dark font-playfair text-base">
                Once you select a partner, teams will be automatically formed
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons - positioned at bottom */}
        <div className="container mx-auto px-4 pb-8 sm:pb-12">
          <div className="flex flex-col items-center space-y-4">
            <Button 
              onClick={onBack}
              className="bg-transparent text-augusta-yellow-dark rounded-2xl px-8 py-4 text-2xl font-playfair hover:bg-augusta-yellow-dark/10 border-2 border-transparent"
            >
              Back to Players
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}