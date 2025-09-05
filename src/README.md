# Dr. Frank Golf App

A Vite + React golf scoring application for tracking scores across various game formats.

## Features

- Player setup with handicap tracking
- Multiple game formats:
  - 2 players: Match Play, Nassau, Skins
  - 3 players: Six Point System, Nassau, Skins  
  - 4 players: Fourball, Foursomes, Scramble, Nassau, Skins
- Real-time scoring with net scores and Stableford points
- Comprehensive results tracking

## Getting Started

1. Install dependencies:
```bash
npm i
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)
- Class Variance Authority (component variants)

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── figma/          # Figma-specific components
│   ├── LandingPage.jsx
│   ├── PlayerSetup.jsx
│   ├── TeamsPage.jsx
│   ├── FormatPage.jsx
│   ├── GameScreen.jsx
│   ├── ResultsPage.jsx
│   └── MatchStatusDialog.jsx
├── constants/          # App constants (course data)
├── utils/              # Utility functions (scoring logic)
├── main.jsx           # App entry point
├── App.jsx            # Main app component
└── index.css          # Global styles
```