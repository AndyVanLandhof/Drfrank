import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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

  const shouldReduceMotion = useReducedMotion();
  const variants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  let page: JSX.Element;
  switch (currentPage) {
    case "course":
      page = (
        <CoursePage
          onBack={() => setCurrentPage("landing")}
          onContinue={(course, teeBox) => {
            setSelectedCourse(course);
            setSelectedTeeBox(teeBox);
            setCurrentPage("playerSetup");
          }}
        />
      );
      break;
    case "playerSetup":
      page = (
        <PlayerSetup
          selectedTeeBox={selectedTeeBox!}
          onBack={() => setCurrentPage("course")}
          onContinue={(playerData) => {
            setPlayers(playerData);
            setCurrentPage("handicapSummary");
          }}
        />
      );
      break;
    case "handicapSummary":
      page = (
        <HandicapSummary
          players={players}
          selectedTeeBox={selectedTeeBox!}
          selectedCourse={selectedCourse!}
          onBack={() => setCurrentPage("playerSetup")}
          onContinue={() => {
            if (players.length === 4) {
              setCurrentPage("teams");
            } else {
              setCurrentPage("format");
            }
          }}
        />
      );
      break;
    case "teams":
      page = (
        <TeamsPage
          players={players}
          selectedCourse={selectedCourse}
          onBack={() => setCurrentPage("handicapSummary")}
          onContinue={(teamData) => {
            setTeams(teamData);
            setCurrentPage("format");
          }}
        />
      );
      break;
    case "format":
      page = (
        <FormatPage
          players={players}
          onBack={() => {
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
      );
      break;
    case "game":
      page = (
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
      );
      break;
    case "results":
      page = (
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
      );
      break;
    default:
      page = <LandingPage onPlayGolf={() => setCurrentPage("course")} />;
  }

  return (
    <div className="min-h-screen bg-background" style={{ backgroundColor: 'hsl(145, 65%, 20%)' }}>
      <AnimatePresence mode="wait" initial={!shouldReduceMotion}>
        <motion.div
          key={currentPage}
          {...(shouldReduceMotion
            ? {}
            : { initial: "initial", animate: "animate", exit: "exit", variants, transition: { duration: 0.18, ease: "easeOut" } })}
        >
          {page}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}