import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasPlayer } from '../../services/playerService';

function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-navigate after 2 seconds
    // If player exists → home, otherwise → registration
    const timer = setTimeout(() => {
      if (hasPlayer()) {
        navigate('/home');
      } else {
        navigate('/register');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white">
      <div className="text-center">
        {/* Logo/Title */}
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Rush2C9
        </h1>
        <p className="text-xl text-gray-400 mb-8">Race to the Arena. Support Your Team.</p>

        {/* Loading animation */}
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Cloud9 branding */}
        <p className="mt-8 text-sm text-gray-500">
          A Cloud9 x JetBrains Hackathon Game
        </p>
      </div>
    </div>
  );
}

export default SplashScreen;
