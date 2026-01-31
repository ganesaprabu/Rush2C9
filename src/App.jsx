import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './components/screens/SplashScreen';
import NameEntryScreen from './components/screens/NameEntryScreen';
import GameScreen from './components/screens/GameScreen';
import LeaderboardScreen from './components/screens/LeaderboardScreen';
import DashboardScreen from './components/screens/DashboardScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main flow */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/name-entry" element={<NameEntryScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/leaderboard" element={<LeaderboardScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />

        {/* Redirects for old routes */}
        <Route path="/register" element={<Navigate to="/name-entry" replace />} />
        <Route path="/login" element={<Navigate to="/name-entry" replace />} />
        <Route path="/home" element={<Navigate to="/name-entry" replace />} />

        {/* Catch all - redirect to name entry */}
        <Route path="*" element={<Navigate to="/name-entry" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
