import { useNavigate } from 'react-router-dom';

function LeaderboardScreen() {
  const navigate = useNavigate();

  // Mock leaderboard data
  const leaders = [
    { rank: 1, name: 'Mike Johnson', score: 4230, faction: 'lcs' },
    { rank: 2, name: 'Sarah Lee', score: 3800, faction: 'vct' },
    { rank: 3, name: 'Alex Chen', score: 3650, faction: 'lcs' },
    { rank: 4, name: 'Jordan Smith', score: 3100, faction: 'vct' },
    { rank: 5, name: 'Chris Kumar', score: 2900, faction: 'lcs' },
    { rank: 6, name: 'Taylor Brown', score: 2750, faction: 'vct' },
    { rank: 7, name: 'Casey Williams', score: 2500, faction: 'lcs' },
    { rank: 8, name: 'Morgan Davis', score: 2300, faction: 'vct' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/home')} className="mr-4 text-2xl">
            ←
          </button>
          <h1 className="text-2xl font-bold">🏆 Leaderboard</h1>
        </div>

        {/* Faction Tabs */}
        <div className="flex gap-2 mb-6">
          <button className="flex-1 py-2 bg-blue-600 rounded-lg font-semibold">
            All
          </button>
          <button className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
            🎮 LCS
          </button>
          <button className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
            🎯 VCT
          </button>
        </div>

        {/* Top 3 Podium */}
        <div className="flex justify-center items-end gap-2 mb-8">
          {/* 2nd place */}
          <div className="text-center">
            <div className="text-4xl mb-2">🥈</div>
            <div className="bg-gray-700 rounded-t-lg px-4 py-6">
              <div className="font-semibold text-sm">{leaders[1]?.name}</div>
              <div className="text-yellow-400">{leaders[1]?.score}</div>
            </div>
          </div>
          {/* 1st place */}
          <div className="text-center">
            <div className="text-5xl mb-2">🥇</div>
            <div className="bg-yellow-600/30 border border-yellow-500 rounded-t-lg px-6 py-8">
              <div className="font-bold">{leaders[0]?.name}</div>
              <div className="text-yellow-400 text-xl">{leaders[0]?.score}</div>
            </div>
          </div>
          {/* 3rd place */}
          <div className="text-center">
            <div className="text-4xl mb-2">🥉</div>
            <div className="bg-gray-700 rounded-t-lg px-4 py-4">
              <div className="font-semibold text-sm">{leaders[2]?.name}</div>
              <div className="text-yellow-400">{leaders[2]?.score}</div>
            </div>
          </div>
        </div>

        {/* Full List */}
        <div className="space-y-2">
          {leaders.slice(3).map((player) => (
            <div
              key={player.rank}
              className="flex items-center justify-between bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center gap-4">
                <span className="text-gray-400 w-6">#{player.rank}</span>
                <span className="font-semibold">{player.name}</span>
                <span className="text-sm">
                  {player.faction === 'lcs' ? '🎮' : '🎯'}
                </span>
              </div>
              <span className="text-yellow-400 font-semibold">{player.score}</span>
            </div>
          ))}
        </div>

        {/* Your Rank */}
        <div className="mt-6 bg-blue-900/30 border border-blue-700 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-gray-400">#47</span>
            <span className="font-semibold">You</span>
          </div>
          <span className="text-yellow-400 font-semibold">1,250</span>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardScreen;
