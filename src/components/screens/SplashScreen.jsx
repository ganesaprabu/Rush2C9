import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SplashScreen() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Fade in after image loads
    setTimeout(() => setLoaded(true), 100);

    // Auto-navigate after 4 seconds
    const timer = setTimeout(() => {
      navigate('/name-entry');
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#0a0a0f]">
      {/* Full screen splash image - cover on mobile, contain on desktop */}
      <img
        src="/splash.png"
        alt="Rush2C9 - Race to the Arena"
        className={`w-full h-full object-cover md:object-contain object-center absolute inset-0 transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Loading indicator at bottom */}
      <div className={`absolute bottom-16 left-0 right-0 flex flex-col items-center transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Animated loading bar */}
        <div className="w-32 h-1 bg-gray-800/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #ef4444)',
              animation: 'loadingBar 2.5s ease-in-out infinite',
            }}
          />
        </div>
        <p className="mt-3 text-base font-semibold text-gray-300" style={{ animation: 'pulse 2s infinite' }}>
          Loading...
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes loadingBar {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 0%; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default SplashScreen;
