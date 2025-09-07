import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Card } from './ui/card';
import { Player, GameState } from '../types/game';

interface MatchStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameState: GameState;
  players: Player[];
  selectedFormats: string[];
  teams?: { teamA: Player[], teamB: Player[] } | null;
  calculateMatchStatus: () => string[];
  calculateCumulativeScores: () => Array<{
    name: string;
    grossTotal: number;
    stablefordTotal: number;
    holesCompleted: number;
    sixPointTotal?: number;
  }>;
}

export function MatchStatusDialog({ 
  open, 
  onOpenChange, 
  gameState, 
  players, 
  selectedFormats,
  teams,
  calculateMatchStatus, 
  calculateCumulativeScores 
}: MatchStatusDialogProps) {
  // Recompute match status on open to include current-hole updates
  const statusLines = calculateMatchStatus();
  const cumulative = calculateCumulativeScores();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="w-36 h-36 rounded-xl text-3xl font-playfair bg-transparent border-2 border-augusta-yellow text-augusta-yellow hover:bg-augusta-yellow/10 transition-colors flex flex-col items-center justify-center p-3">
          <span className="text-center leading-tight">Match Status</span>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-background border-2 border-augusta-yellow rounded-3xl max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair text-augusta-yellow text-center">
            Match Status
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            <span className="text-2xl font-playfair text-augusta-yellow-dark">
              After {gameState.currentHole} hole{gameState.currentHole > 1 ? 's' : ''}
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 p-4">
          {/* Overall Match Status */}
          <div className="text-center">
            <div className="space-y-4">
              {(() => {
                const statuses = statusLines;
                const isThreePlayerSixPointMain = selectedFormats.includes('sixpoint') && players.length === 3;
                const principalPrefixes = [
                  'All Square',
                  'wins',
                  'is',
                  'Fourball',
                  'Foursomes',
                  'Scramble',
                ];
                const sideGamePrefixes = [
                  'Nassau',
                  'No skins',
                  'Tied with',
                  'has',
                  'Skins',
                ];

                const filteredStatuses = isThreePlayerSixPointMain
                  ? statuses.filter(s => !s.trim().startsWith('Six Point'))
                  : statuses;

                const principal: string[] = [];
                const side: string[] = [];
                filteredStatuses.forEach((s) => {
                  const trimmed = s.trim();
                  if (principalPrefixes.some((p) => trimmed.startsWith(p))) principal.push(trimmed);
                  else if (sideGamePrefixes.some((p) => trimmed.startsWith(p))) side.push(trimmed);
                  else if (trimmed.includes('Team A') || trimmed.includes('Team B')) principal.push(trimmed);
                  else side.push(trimmed);
                });

                const renderPrincipal = (status: string, key: string) => {
                  let displayStatus = status.replace(':', '');
                  if (displayStatus.includes('Team A') || displayStatus.includes('Team B')) {
                    const parts = displayStatus.split(' Team');
                    if (parts.length === 2) {
                      const formatName = parts[0];
                      const teamResult = 'Team' + parts[1];
                      return (
                        <div key={key} className="space-y-1">
                          <p className="text-3xl font-playfair text-augusta-yellow-dark">{formatName}</p>
                          <p className="text-5xl font-playfair text-augusta-yellow">{teamResult}</p>
                        </div>
                      );
                    }
                  }
                  return (
                    <p key={key} className="text-5xl font-playfair text-augusta-yellow">{displayStatus}</p>
                  );
                };

                return (
                  <>
                    {isThreePlayerSixPointMain && (
                      <div className="space-y-2">
                        <p className="text-3xl font-playfair text-augusta-yellow-dark">Six Points System</p>
                        <div className="space-y-1">
                          {[...cumulative]
                            .sort((a, b) => (b.sixPointTotal || 0) - (a.sixPointTotal || 0))
                            .map((p) => (
                              <p key={p.name} className="text-2xl font-playfair text-augusta-yellow">
                                {p.name} - {p.sixPointTotal || 0} points
                              </p>
                            ))}
                        </div>
                      </div>
                    )}
                    {principal.map((s, i) => renderPrincipal(s, `p-${i}`))}
                    {side.length > 0 && (
                      <div className="pt-4">
                        <p className="text-base font-playfair text-augusta-yellow-dark">Side Games</p>
                        <div className="mt-2 space-y-2">
                          {side.map((s, i) => (
                            <p key={`s-${i}`} className="text-xl font-playfair text-augusta-yellow">{s.replace(':', ': ')}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Individual Player Scores */}
          <div className="space-y-2">
            <h3 className="text-base font-playfair text-augusta-yellow-dark text-center">
              Player Scores
            </h3>
            {calculateCumulativeScores().map((player) => {
              // Determine team membership for 4-player games
              let teamLabel = '';
              if (teams && players.length === 4) {
                if (teams.teamA.some(p => p.name === player.name)) {
                  teamLabel = 'Team A';
                } else if (teams.teamB.some(p => p.name === player.name)) {
                  teamLabel = 'Team B';
                }
              }
              
              return (
                <Card key={player.name} className="p-3 border-2 border-augusta-yellow bg-transparent">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-base font-playfair text-augusta-yellow">
                        {player.name}
                      </span>
                      {teamLabel && (
                        <span className="text-xs font-playfair text-augusta-yellow-dark">
                          {teamLabel}
                        </span>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-augusta-yellow">
                        Gross: {player.grossTotal}
                      </div>
                      <div className="text-augusta-yellow-dark">
                        Stableford: {player.stablefordTotal}
                        {selectedFormats.includes("sixpoint") && players.length === 3 && (
                          <span className="ml-2">
                            Six Point: {player.sixPointTotal || 0}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}