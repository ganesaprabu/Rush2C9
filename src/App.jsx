import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './components/screens/SplashScreen';
import RegistrationScreen from './components/screens/RegistrationScreen';
import LoginScreen from './components/screens/LoginScreen';
import HomeScreen from './components/screens/HomeScreen';
import GameScreen from './components/screens/GameScreen';
import LeaderboardScreen from './components/screens/LeaderboardScreen';
import { hasPlayer } from './services/playerService';

// Protected route wrapper - requires logged in player
function ProtectedRoute({ children }) {
  if (!hasPlayer()) {
    return <Navigate to="/register" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/register" element={<RegistrationScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomeScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <GameScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <LeaderboardScreen />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
