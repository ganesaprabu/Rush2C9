import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AVATAR_CATEGORIES } from '../../data/gameData';

function RegistrationScreen() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (firstName && lastName && selectedAvatar) {
      // TODO: Save to localStorage/Firebase
      console.log('Registering:', { firstName, lastName, avatar: selectedAvatar });
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, Traveler!</h1>
          <p className="text-gray-400">Enter your name and pick a secret avatar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name inputs */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-4 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-4 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Avatar Categories */}
          <div>
            <p className="text-sm text-gray-400 mb-3">Pick your secret avatar (like a PIN):</p>
            <div className="flex gap-2 flex-wrap justify-center mb-4">
              {Object.entries(AVATAR_CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(key);
                    setSelectedAvatar(null);
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
                    onClick={() => setSelectedAvatar(icon)}
                    className={`text-3xl p-3 rounded-lg transition-all ${
                      selectedAvatar === icon
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
            disabled={!firstName || !lastName || !selectedAvatar}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-500 hover:to-cyan-500 transition-all"
          >
            Start Your Journey
          </button>
        </form>

        {/* Already registered link */}
        <p className="text-center mt-6 text-gray-500">
          Already registered?{' '}
          <button onClick={() => navigate('/login')} className="text-blue-400 hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegistrationScreen;
