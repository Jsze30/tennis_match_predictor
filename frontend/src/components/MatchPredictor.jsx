import React, { useState, useEffect, useMemo, useRef } from 'react';
import Aurora from './Aurora';

function MatchPredictor() {
  const [players, setPlayers] = useState([]);
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [player1Input, setPlayer1Input] = useState('');
  const [player2Input, setPlayer2Input] = useState('');
  const [showPlayer1Dropdown, setShowPlayer1Dropdown] = useState(false);
  const [showPlayer2Dropdown, setShowPlayer2Dropdown] = useState(false);
  const [surface, setSurface] = useState('overall');
  const [showOdds, setShowOdds] = useState(false);
  const [loading, setLoading] = useState(true);

  const player1Ref = useRef(null);
  const player2Ref = useRef(null);

  useEffect(() => {
    // Fetch and parse the CSV data
    fetch('/player_elo_ratings.csv')
      .then(response => response.text())
      .then(data => {
        const lines = data.split('\n').slice(1); // Skip header
        const parsedPlayers = lines
          .filter(line => line.trim())
          .map(line => {
            const [player, elo_overall, elo_hard, elo_clay, elo_grass] = line.split(',');
            return {
              name: player,
              elo_overall: parseFloat(elo_overall),
              elo_hard: parseFloat(elo_hard),
              elo_clay: parseFloat(elo_clay),
              elo_grass: parseFloat(elo_grass)
            };
          });
        setPlayers(parsedPlayers);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading player data:', error);
        setLoading(false);
      });
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (player1Ref.current && !player1Ref.current.contains(event.target)) {
        setShowPlayer1Dropdown(false);
      }
      if (player2Ref.current && !player2Ref.current.contains(event.target)) {
        setShowPlayer2Dropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPlayers1 = useMemo(() => {
    if (!player1Input) return [];
    return players
      .filter(p => p.name.toLowerCase().includes(player1Input.toLowerCase()))
      .slice(0, 10);
  }, [player1Input, players]);

  const filteredPlayers2 = useMemo(() => {
    if (!player2Input) return [];
    return players
      .filter(p => p.name.toLowerCase().includes(player2Input.toLowerCase()))
      .slice(0, 10);
  }, [player2Input, players]);

  const calculateOdds = () => {
    if (!player1 || !player2) return null;

    const eloKey = `elo_${surface}`;
    const elo1 = player1[eloKey];
    const elo2 = player2[eloKey];

    // Calculate win probability using ELO formula
    const expectedScore1 = 1 / (1 + Math.pow(10, (elo2 - elo1) / 400));
    const expectedScore2 = 1 - expectedScore1;

    return {
      player1Probability: (expectedScore1 * 100).toFixed(2),
      player2Probability: (expectedScore2 * 100).toFixed(2),
      player1Odds: (1 / expectedScore1).toFixed(2),
      player2Odds: (1 / expectedScore2).toFixed(2)
    };
  };

  const handleCalculateOdds = () => {
    if (player1 && player2) {
      setShowOdds(true);
    }
  };

  const odds = showOdds ? calculateOdds() : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
        <Aurora />
        <div className="relative z-10 backdrop-blur-xl bg-slate-900/40 border border-slate-700/50 rounded-3xl shadow-2xl p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
          <p className="text-lg font-medium text-slate-200">Loading player data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-0 w-screen h-screen">
        <Aurora />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Tennis Match Predictor
          </h1>
          <p className="text-slate-400">Powered by ELO Rating System</p>
        </div>

        {/* Main Card */}
        <div className="backdrop-blur-xl bg-slate-900/70 border border-slate-700/50 rounded-3xl shadow-2xl p-6 md:p-10">

          {/* Surface Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
              Court Surface
            </label>
            <div className="flex gap-2 flex-wrap">
              {['overall', 'hard', 'clay', 'grass'].map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setSurface(s);
                    setShowOdds(false);
                  }}
                  className={`px-5 py-2.5 rounded-xl capitalize font-medium transition-all ${
                    surface === s
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-8">
            {/* Player 1 Search */}
            <div className="relative" ref={player1Ref}>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Player 1
              </label>
              <input
                type="text"
                value={player1Input}
                onChange={(e) => {
                  setPlayer1Input(e.target.value);
                  setShowPlayer1Dropdown(true);
                  setPlayer1(null);
                  setShowOdds(false);
                }}
                onFocus={() => setShowPlayer1Dropdown(true)}
                placeholder="Search player..."
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-100 placeholder-slate-500"
              />
              {showPlayer1Dropdown && filteredPlayers1.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                  {filteredPlayers1.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setPlayer1(p);
                        setPlayer1Input(p.name);
                        setShowPlayer1Dropdown(false);
                        setShowOdds(false);
                      }}
                      className="px-4 py-2.5 hover:bg-slate-700 cursor-pointer transition-colors border-b border-slate-700/50 last:border-b-0"
                    >
                      <div className="font-medium text-slate-200">{p.name}</div>
                      <div className="text-xs text-slate-400">ELO: {p.elo_overall.toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              )}
              {player1 && (
                <div className="mt-2 text-xs text-green-400 font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {player1.name} selected
                </div>
              )}
            </div>

            {/* Player 2 Search */}
            <div className="relative" ref={player2Ref}>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Player 2
              </label>
              <input
                type="text"
                value={player2Input}
                onChange={(e) => {
                  setPlayer2Input(e.target.value);
                  setShowPlayer2Dropdown(true);
                  setPlayer2(null);
                  setShowOdds(false);
                }}
                onFocus={() => setShowPlayer2Dropdown(true)}
                placeholder="Search player..."
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-slate-100 placeholder-slate-500"
              />
              {showPlayer2Dropdown && filteredPlayers2.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                  {filteredPlayers2.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setPlayer2(p);
                        setPlayer2Input(p.name);
                        setShowPlayer2Dropdown(false);
                        setShowOdds(false);
                      }}
                      className="px-4 py-2.5 hover:bg-slate-700 cursor-pointer transition-colors border-b border-slate-700/50 last:border-b-0"
                    >
                      <div className="font-medium text-slate-200">{p.name}</div>
                      <div className="text-xs text-slate-400">ELO: {p.elo_overall.toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              )}
              {player2 && (
                <div className="mt-2 text-xs text-green-400 font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {player2.name} selected
                </div>
              )}
            </div>
          </div>

          {/* Calculate Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={handleCalculateOdds}
              disabled={!player1 || !player2}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                player1 && player2
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:bg-blue-700'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Calculate Match Odds
            </button>
          </div>

          {/* Results */}
          {player1 && player2 && odds && (
            <div className="mt-8 pt-8 border-t border-slate-700">
              <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Match Prediction
              </h3>
              
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-gradient-to-br from-blue-500/10 to-slate-800/50 border border-blue-500/30 p-6 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-blue-400">
                      {player1.name}
                    </h4>
                    <div className="w-2 h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-500/50"></div>
                  </div>
                  <p className="text-5xl font-bold text-blue-400 mb-1">
                    {odds.player1Probability}%
                  </p>
                  <p className="text-xs text-slate-400 font-medium mb-4 uppercase tracking-wider">
                    Win Probability
                  </p>
                  <div className="border-t border-blue-500/20 pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-400">Decimal Odds</span>
                      <span className="text-lg font-bold text-slate-200">{odds.player1Odds}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-400">{surface.charAt(0).toUpperCase() + surface.slice(1)} ELO</span>
                      <span className="text-lg font-bold text-slate-200">{player1[`elo_${surface}`].toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-slate-800/50 border border-purple-500/30 p-6 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-purple-400">
                      {player2.name}
                    </h4>
                    <div className="w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-500/50"></div>
                  </div>
                  <p className="text-5xl font-bold text-purple-400 mb-1">
                    {odds.player2Probability}%
                  </p>
                  <p className="text-xs text-slate-400 font-medium mb-4 uppercase tracking-wider">
                    Win Probability
                  </p>
                  <div className="border-t border-purple-500/20 pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-400">Decimal Odds</span>
                      <span className="text-lg font-bold text-slate-200">{odds.player2Odds}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-400">{surface.charAt(0).toUpperCase() + surface.slice(1)} ELO</span>
                      <span className="text-lg font-bold text-slate-200">{player2[`elo_${surface}`].toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MatchPredictor;
