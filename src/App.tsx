import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { CoursePage } from "./components/CoursePage";
import { PlayerSetup } from "./components/PlayerSetup";
import { HandicapSummary } from "./components/HandicapSummary";
import { TeamsPage } from "./components/TeamsPage";
import { FormatPage } from "./components/FormatPage";
import { GameScreen } from "./components/GameScreen";
import { ResultsPage } from "./components/ResultsPage";

import { Player } from "./types/game";
import { Course, TeeBox } from "./types/course";

export interface GameResults {
  finalScores: Record<string, any>;
  formatResults: any;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<"landing" | "course" | "playerSetup" | "handicapSummary" | "teams" | "format" | "game" | "results">("landing");
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTeeBox, setSelectedTeeBox] = useState<TeeBox | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<{ teamA: Player[], teamB: Player[] } | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);

  if (currentPage === "course") {
    return (
      <div className="min-h-screen bg-background" style={{ backgroundColor: 'hsl(145, 65%, 20%)' }}>
        <CoursePage 
          onBack={() => setCurrentPage("landing")}
          onContinue={(course, teeBox) => {
            setSelectedCourse(course);
            setSelectedTeeBox(teeBox);
            setCurrentPage("playerSetup");
          }}
        />
      </div>
    );
  }

  if (currentPage === "playerSetup") {
    return (
      <div className="min-h-screen bg-background" style={{ backgroundColor: 'hsl(145, 65%, 20%)' }}>
        <PlayerSetup 
          selectedTeeBox={selectedTeeBox!}
          onBack={() => setCurrentPage("course")}
          onContinue={(playerData) => {
            setPlayers(playerData);
            setCurrentPage("handicapSummary");
          }}
        />
      </div>
    );
  }

  if (currentPage === "handicapSummary") {
    return (
      <div className="min-h-screen bg-background" style={{ backgroundColor: 'hsl(145, 65%, 20%)' }}>
        <HandicapSummary 
          players={players}
          selectedTeeBox={selectedTeeBox!}
          selectedCourse={selectedCourse!}
          onBack={() => setCurrentPage("playerSetup")}
          onContinue={() => {
            // Only show teams page if there are 4 players (for team formats)
            if (players.length === 4) {
              setCurrentPage("teams");
            } else {
              setCurrentPage("format");
            }
          }}
        />
      </div>
    );
  }

  if (currentPage === "teams") {
    return (
      <div className="min-h-screen bg-background" style={{ backgroundColor: 'hsl(145, 65%, 20%)' }}>
        <TeamsPage 
          players={players}
          selectedCourse={selectedCourse}
          onBack={() => setCurrentPage("handicapSummary")}
          onContinue={(teamData) => {
            setTeams(teamData);
            setCurrentPage("format");
          }}
        />
      </div>
    );
  }

  if (currentPage === "format") {
    return (
      <div className="min-h-screen bg-background" style={{ backgroundColor: 'hsl(145, 65%, 20%)' }}>
        <FormatPage 
          players={players}
          onBack={() => {
            // Go back to teams page if we have 4 players, otherwise handicap summary
            if (players.length === 4) {
              setCurrentPage("teams");
            } else {
              setCurrentPage("handicapSummary");
            }
          }}
          onContinue={(formats) => {
            setSelectedFormats(formats);
            setCurrentPage("game");
          }}
        />
      </div>
    );
  }

  if (currentPage === "game") {
    return (
      <div className="min-h-screen bg-background" style={{ backgroundColor: 'hsl(145, 65%, 20%)' }}>
        <GameScreen 
          players={players}
          selectedFormats={selectedFormats}
          teams={teams}
          selectedCourse={selectedCourse}
          onBack={() => setCurrentPage("format")}
          onGameComplete={(results) => {
            setGameResults(results);
            setCurrentPage("results");
          }}
        />
      </div>
    );
  }

  if (currentPage === "results") {
    return (
      <div className="min-h-screen bg-background" style={{ backgroundColor: 'hsl(145, 65%, 20%)' }}>
        <ResultsPage 
          players={players}
          selectedFormats={selectedFormats}
          gameResults={gameResults!}
          onNewRound={() => {
            setCurrentPage("landing");
            setSelectedCourse(null);
            setSelectedTeeBox(null);
            setPlayers([]);
            setTeams(null);
            setSelectedFormats([]);
            setGameResults(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ backgroundColor: 'hsl(145, 65%, 20%)' }}>
      <LandingPage onPlayGolf={() => setCurrentPage("course")} />
    </div>
  );
}