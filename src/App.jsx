import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SplashScreen from './components/screens/SplashScreen';
import RegistrationScreen from './components/screens/RegistrationScreen';
import HomeScreen from './components/screens/HomeScreen';
import GameScreen from './components/screens/GameScreen';
import LeaderboardScreen from './components/screens/LeaderboardScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/register" element={<RegistrationScreen />} />
        <Route path="/login" element={<RegistrationScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/leaderboard" element={<LeaderboardScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
