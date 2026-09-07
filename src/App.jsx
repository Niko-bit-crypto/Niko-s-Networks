import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header.jsx';
import { GameCard } from './components/GameCard.jsx';
import { GamePlayer } from './components/GamePlayer.jsx';
import { AddGameModal } from './components/AddGameModal.jsx';
import { JsonViewerModal } from './components/JsonViewerModal.jsx';
import { CloakModal } from './components/CloakModal.jsx';
import { PanicScreen } from './components/PanicScreen.jsx';
import { DEFAULT_GAMES } from './data/defaultGames.js';
import { Gamepad2, SearchX } from 'lucide-react';

export default function App() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('unblocked_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [highlightGameForJson, setHighlightGameForJson] = useState(null);
  const [isCloakModalOpen, setIsCloakModalOpen] = useState(false);
  const [isPanicActive, setIsPanicActive] = useState(false);

  // Load games from games.json or fallback
  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch('./games.json');
        if (res.ok) {
          const data = await res.json();
          const customSaved = localStorage.getItem('unblocked_custom_games');
          const customGames = customSaved ? JSON.parse(customSaved) : [];
          setGames([...data, ...customGames]);
        } else {
          setGames(DEFAULT_GAMES);
        }
      } catch (err) {
        console.warn('Could not fetch /games.json, using bundled defaults:', err);
        setGames(DEFAULT_GAMES);
      }
    }
    loadGames();
  }, []);

  // Listen for ESC key for instant Panic Mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPanicActive(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save favorites to localStorage
  const handleToggleFavorite = (id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem('unblocked_favorites', JSON.stringify(next));
      return next;
    });
  };

  // Add custom game
  const handleAddGame = (newGame) => {
    setGames(prev => {
      const updated = [newGame, ...prev];
      const customList = updated.filter(g => g.isCustom);
      localStorage.setItem('unblocked_custom_games', JSON.stringify(customList));
      return updated;
    });
  };

  // Reset defaults
  const handleResetDefaults = () => {
    localStorage.removeItem('unblocked_custom_games');
    setGames(DEFAULT_GAMES);
    setIsJsonModalOpen(false);
  };

  // Open JSON modal specifically for a single game's iframe definition
  const handleViewIframeCode = (game) => {
    setHighlightGameForJson(game);
    setIsJsonModalOpen(true);
  };

  // Filter games
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      // Category filter
      if (selectedCategory === 'Favorites') {
        if (!favorites.includes(game.id)) return false;
      } else if (selectedCategory !== 'All') {
        if (game.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = game.title.toLowerCase().includes(q);
        const matchesDesc = game.description.toLowerCase().includes(q);
        const matchesCat = game.category.toLowerCase().includes(q);
        const matchesTags = (game.tags || []).some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesTags) return false;
      }

      return true;
    });
  }, [games, selectedCategory, searchQuery, favorites]);

  // If panic is active, show the camouflage screen
  if (isPanicActive) {
    return <PanicScreen onExitPanic={() => setIsPanicActive(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenJsonModal={() => {
          setHighlightGameForJson(null);
          setIsJsonModalOpen(true);
        }}
        onOpenCloakModal={() => setIsCloakModalOpen(true)}
        onTriggerPanic={() => setIsPanicActive(true)}
        favoritesCount={favorites.length}
      />

      {/* Main Content */}
      <main className="flex-1 pb-16">
        {selectedGame ? (
          <GamePlayer
            game={selectedGame}
            onBack={() => setSelectedGame(null)}
            onOpenJsonModal={() => {
              setHighlightGameForJson(selectedGame);
              setIsJsonModalOpen(true);
            }}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {/* Top Subheader Banner */}
            <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/80 p-5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                    <span>Unblocked Arcade & Puzzle Hub</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold font-mono">
                      v1.0
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pure HTML5, CSS & JS games stored as JSON-configured Iframes. Zero blockers, zero ads.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
                <div className="bg-slate-950/70 border border-slate-800 px-3.5 py-1.5 rounded-xl text-center">
                  <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">Catalog</span>
                  <span className="text-sm font-extrabold text-emerald-400">{games.length} Games</span>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 px-3.5 py-1.5 rounded-xl text-center">
                  <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">Format</span>
                  <span className="text-sm font-extrabold text-sky-400">JSON Iframes</span>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 px-3.5 py-1.5 rounded-xl text-center">
                  <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">Storage</span>
                  <span className="text-sm font-extrabold text-amber-400">games.json</span>
                </div>
              </div>
            </div>

            {/* Grid of Games */}
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isFavorite={favorites.includes(game.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectGame={setSelectedGame}
                    onViewIframeCode={handleViewIframeCode}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
                  <SearchX className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-200">No games matched your query</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                  {selectedCategory === 'Favorites'
                    ? "You haven't added any games to your favorites yet. Click the star on any game card to bookmark it!"
                    : `No results found for "${searchQuery}". Try searching for another title or clear the filter.`}
                </p>
                <button
                  id="reset-filters-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
                >
                  Show All Games
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Unblocked Games</span>
            <span>•</span>
            <span>Stored as an Iframe in <code className="text-amber-400 font-mono">games.json</code></span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              id="footer-json-btn"
              onClick={() => {
                setHighlightGameForJson(null);
                setIsJsonModalOpen(true);
              }}
              className="hover:text-slate-300 underline"
            >
              View JSON Manifest
            </button>
            <span>•</span>
            <span>Hotkeys: Press <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">ESC</kbd> for Panic Cloak</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGame={handleAddGame}
      />

      <JsonViewerModal
        isOpen={isJsonModalOpen}
        onClose={() => {
          setIsJsonModalOpen(false);
          setHighlightGameForJson(null);
        }}
        games={games}
        onResetDefaults={handleResetDefaults}
        selectedGameForHighlight={highlightGameForJson}
      />

      <CloakModal
        isOpen={isCloakModalOpen}
        onClose={() => setIsCloakModalOpen(false)}
      />
    </div>
  );
}
