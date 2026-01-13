import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Trophy, User, Globe, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  playerName: string;
  playerImage?: string;
  score: number;
  level: number;
  date: string;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'local' | 'global'>('local');
  const [localScores, setLocalScores] = useState<LeaderboardEntry[]>([]);
  const [globalScores, setGlobalScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLocalScores();
    loadGlobalScores();
  }, [user]);

  const loadLocalScores = () => {
    // Load from localStorage (user-specific scores)
    const saved = localStorage.getItem('snakecraft_local_scores');
    if (saved) {
      const scores: LeaderboardEntry[] = JSON.parse(saved);
      setLocalScores(scores.sort((a, b) => b.level - a.level || b.score - a.score).slice(0, 10));
    }
  };

  const loadGlobalScores = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call to your backend
      // const response = await fetch('/api/leaderboard');
      // const data = await response.json();
      // setGlobalScores(data);
      
      // Mock data for now
      setGlobalScores([
        {
          id: '1',
          playerName: 'Pro Player',
          score: 15000,
          level: 25,
          date: new Date().toISOString()
        },
        {
          id: '2',
          playerName: 'Snake Master',
          score: 12500,
          level: 20,
          date: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Failed to load global scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLocalScore = (score: number, level: number) => {
    if (!user) return;

    const newEntry: LeaderboardEntry = {
      id: `${Date.now()}-${user.id}`,
      playerName: user.fullName || user.username || 'Player',
      playerImage: user.imageUrl,
      score,
      level,
      date: new Date().toISOString(),
      isCurrentUser: true
    };

    const current = [...localScores, newEntry];
    const sorted = current.sort((a, b) => b.level - a.level || b.score - a.score).slice(0, 10);
    
    setLocalScores(sorted);
    localStorage.setItem('snakecraft_local_scores', JSON.stringify(sorted));
  };

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-gray-500 font-bold">#{index + 1}</span>;
    }
  };

  const renderScoreList = (scores: LeaderboardEntry[]) => {
    if (scores.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Nessun punteggio ancora</p>
          <p className="text-sm mt-2">Gioca per apparire in classifica!</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {scores.map((entry, index) => (
          <div
            key={entry.id}
            className={`
              flex items-center gap-4 p-4 rounded-lg transition-all
              ${entry.isCurrentUser 
                ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-2 border-purple-500' 
                : 'bg-gray-800/50 hover:bg-gray-700/50'
              }
            `}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-12 flex items-center justify-center">
              {getMedalIcon(index)}
            </div>

            {/* Player Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {entry.playerImage ? (
                <img 
                  src={entry.playerImage} 
                  alt={entry.playerName}
                  className="w-10 h-10 rounded-full border-2 border-purple-500"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{entry.playerName}</p>
                <p className="text-xs text-gray-400">
                  {new Date(entry.date).toLocaleDateString('it-IT')}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-bold text-yellow-400">{entry.score.toLocaleString()}</p>
              <p className="text-sm text-purple-400">Livello {entry.level}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-purple-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            Classifica SnakeCraft
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('local')}
            className={`
              flex-1 py-4 px-6 font-bold transition-all flex items-center justify-center gap-2
              ${activeTab === 'local'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }
            `}
          >
            <User className="w-5 h-5" />
            Locale
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`
              flex-1 py-4 px-6 font-bold transition-all flex items-center justify-center gap-2
              ${activeTab === 'global'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }
            `}
          >
            <Globe className="w-5 h-5" />
            Mondiale
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          ) : (
            renderScoreList(activeTab === 'local' ? localScores : globalScores)
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 p-4 flex justify-between items-center border-t border-gray-700">
          {user ? (
            <div className="flex items-center gap-2">
              <img 
                src={user.imageUrl} 
                alt={user.fullName || 'User'}
                className="w-8 h-8 rounded-full border-2 border-purple-500"
              />
              <span className="text-sm text-gray-400">
                Connesso come <span className="text-white font-bold">{user.fullName || user.username}</span>
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Accedi per salvare i tuoi punteggi</p>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-bold transition-all"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

// Export helper function to add scores
export const saveLeaderboardScore = (score: number, level: number, user?: any) => {
  if (!user) return;

  const saved = localStorage.getItem('snakecraft_local_scores');
  const current: LeaderboardEntry[] = saved ? JSON.parse(saved) : [];

  const newEntry: LeaderboardEntry = {
    id: `${Date.now()}-${user.id}`,
    playerName: user.fullName || user.username || 'Player',
    playerImage: user.imageUrl,
    score,
    level,
    date: new Date().toISOString(),
    isCurrentUser: true
  };

  current.push(newEntry);
  const sorted = current.sort((a, b) => b.level - a.level || b.score - a.score).slice(0, 10);
  localStorage.setItem('snakecraft_local_scores', JSON.stringify(sorted));
};
