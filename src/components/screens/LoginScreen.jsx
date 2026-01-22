import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AVATAR_CATEGORIES } from '../../data/gameData';
import { validatePlayer, playerExists } from '../../services/playerService';

function LoginScreen() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(null);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (selectedCategory === null || selectedAvatarIndex === null) {
      setError('Please select your avatar');
      return;
    }

    // Check if player exists first
    if (!playerExists(firstName, lastName)) {
      setError('No account found with this name. Please register first.');
      return;
    }

    // Validate credentials (name + avatar)
    const isValid = validatePlayer(firstName, lastName, selectedCategory, selectedAvatarIndex);

    if (isValid) {
      navigate('/home');
    } else {
      setAttempts(attempts + 1);
      if (attempts >= 2) {
        setError('Wrong avatar. Hint: Remember your secret avatar!');
      } else {
        setError('Wrong avatar. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-gray-400">Enter your name and secret avatar to sign in</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name inputs */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase())}
              className="w-full p-4 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              maxLength={20}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase())}
              className="w-full p-4 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              maxLength={20}
              required
            />
          </div>

          {/* Avatar Categories */}
          <div>
            <p className="text-sm text-gray-400 mb-3">Select your secret avatar:</p>
            <div className="flex gap-2 flex-wrap justify-center mb-4">
              {Object.entries(AVATAR_CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(key);
                    setSelectedAvatarIndex(null);
                  }}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedCategory === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Avatar Grid */}
            {selectedCategory && (
              <div className="grid grid-cols-5 gap-3">
                {AVATAR_CATEGORIES[selectedCategory].icons.map((icon, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatarIndex(idx)}
                    className={`text-3xl p-3 rounded-lg transition-all ${
                      selectedAvatarIndex === idx
                        ? 'bg-blue-600 scale-110'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!firstName || !lastName || selectedAvatarIndex === null}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-500 hover:to-cyan-500 transition-all"
          >
            Sign In
          </button>
        </form>

        {/* New player link */}
        <p className="text-center mt-6 text-gray-500">
          New player?{' '}
          <button onClick={() => navigate('/register')} className="text-blue-400 hover:underline">
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginScreen;
