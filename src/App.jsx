import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header.jsx';
import { GameCard } from './components/GameCard.jsx';
import { GamePlayer } from './components/GamePlayer.jsx';
import { AddGameModal } from './components/AddGameModal.jsx';
import { JsonViewerModal } from './components/JsonViewerModal.jsx';
import { CloakModal } from './components/CloakModal.jsx';
import { GoogleSitesEmbedModal } from './components/GoogleSitesEmbedModal.jsx';
import { PhoneGuideModal } from './components/PhoneGuideModal.jsx';
import { PanicScreen } from './components/PanicScreen.jsx';
import { DEFAULT_GAMES } from './data/defaultGames.js';
import { safeStorage } from './utils/storage.js';
import { SearchX } from 'lucide-react';

export default function App() {
  const [games, setGames] = useState(() => {
    const customGames = safeStorage.getJSON('niko_custom_games', []);
    const validCustom = Array.isArray(customGames) ? customGames : [];
    return [...DEFAULT_GAMES, ...validCustom];
  });
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    const saved = safeStorage.getJSON('niko_favorites', []);
    return Array.isArray(saved) ? saved : [];
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [highlightGameForJson, setHighlightGameForJson] = useState(null);
  const [isCloakModalOpen, setIsCloakModalOpen] = useState(false);
  const [isGoogleSitesModalOpen, setIsGoogleSitesModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isPanicActive, setIsPanicActive] = useState(false);

  // Load games from games.json or fallback gracefully without blanking
  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch('./games.json');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const customGames = safeStorage.getJSON('niko_custom_games', []);
            const validCustom = Array.isArray(customGames) ? customGames : [];
            setGames([...data, ...validCustom]);
          }
        }
      } catch (err) {
        console.warn("[Niko's Nightclub] Could not fetch ./games.json, using bundled defaults:", err);
      }
    }
    loadGames();
  }, []);

  // Keyboard navigation & safe Escape handling:
  // Prevents accidental Escape press from blanking into Panic Mode while playing or browsing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // 1. Close any open modal first
        if (isAddModalOpen || isJsonModalOpen || isCloakModalOpen || isGoogleSitesModalOpen || isPhoneModalOpen) {
          setIsAddModalOpen(false);
          setIsJsonModalOpen(false);
          setIsCloakModalOpen(false);
          setIsGoogleSitesModalOpen(false);
          setIsPhoneModalOpen(false);
          return;
        }

        // 2. If playing a game, return to arcade cabinet lobby
        if (selectedGame) {
          setSelectedGame(null);
          return;
        }
      }

      // Explicit Panic Mode keyboard shortcuts (Alt+P, Ctrl+Shift+X, or Ctrl+`)
      if ((e.altKey && (e.key === 'p' || e.key === 'P')) ||
          (e.ctrlKey && e.shiftKey && (e.key === 'X' || e.key === 'x')) ||
          (e.ctrlKey && e.key === '`')) {
        setIsPanicActive(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen, isJsonModalOpen, isCloakModalOpen, isGoogleSitesModalOpen, isPhoneModalOpen, selectedGame]);

  // Save favorites safely
  const handleToggleFavorite = (id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      safeStorage.setItem('niko_favorites', next);
      return next;
    });
  };

  // Add custom game safely
  const handleAddGame = (newGame) => {
    setGames(prev => {
      const updated = [newGame, ...(Array.isArray(prev) ? prev : DEFAULT_GAMES)];
      const customList = updated.filter(g => g && g.isCustom);
      safeStorage.setItem('niko_custom_games', customList);
      return updated;
    });
  };

  // Reset defaults safely
  const handleResetDefaults = () => {
    safeStorage.removeItem('niko_custom_games');
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
    const list = Array.isArray(games) && games.length > 0 ? games : DEFAULT_GAMES;
    return list.filter(game => {
      if (!game) return false;
      // Category filter
      if (selectedCategory === 'Favorites') {
        if (!favorites.includes(game.id)) return false;
      } else if (selectedCategory !== 'All') {
        if ((game.category || '').toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (game.title || '').toLowerCase().includes(q);
        const matchesDesc = (game.description || '').toLowerCase().includes(q);
        const matchesCat = (game.category || '').toLowerCase().includes(q);
        const matchesTags = Array.isArray(game.tags) && game.tags.some(t => (t || '').toLowerCase().includes(q));
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
    <div className="min-h-screen arcade-grid-bg text-slate-100 flex flex-col selection:bg-[#ff007f] selection:text-white relative">
      {/* Optional Ambient CRT Scanline Overlay across entire page */}
      {crtEnabled && (
        <div className="fixed inset-0 crt-overlay z-40 pointer-events-none opacity-40" />
      )}

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
        onOpenGoogleSitesModal={() => setIsGoogleSitesModalOpen(true)}
        onOpenPhoneModal={() => setIsPhoneModalOpen(true)}
        onTriggerPanic={() => setIsPanicActive(true)}
        favoritesCount={favorites.length}
        crtEnabled={crtEnabled}
        onToggleCrt={() => setCrtEnabled(prev => !prev)}
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
            crtEnabled={crtEnabled}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5">
            {/* Top 80's Arcade Marquee Banner */}
            <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#140b29] border-4 border-black pixel-shadow-black p-4 sm:p-5 relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-14 h-14 bg-[#00f0ff] border-2 border-black pixel-shadow-black flex items-center justify-center shrink-0">
                  <span className="text-3xl select-none">🕹️</span>
                </div>
                <div>
                  <h1 className="font-arcade text-sm sm:text-base md:text-lg text-white tracking-wider flex items-center gap-2 flex-wrap">
                    <span className="neon-glow-cyan">NIKO&apos;S NIGHTCLUB</span>
                    <span className="text-[10px] px-2 py-0.5 bg-[#ff007f] text-white border border-black font-bold">
                      1980s EDITION
                    </span>
                  </h1>
                  <p className="font-terminal text-base sm:text-lg text-pink-300 mt-0.5 tracking-wide">
                    Pure HTML5, CSS & JS coin-op classics configured as Iframes in <span className="text-[#39ff14]">games.json</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end relative z-10 flex-wrap sm:flex-nowrap">
                <div className="bg-black border-2 border-[#39ff14] px-3 py-1 text-center pixel-shadow-black">
                  <span className="block text-[9px] text-[#39ff14] font-arcade">ROMS</span>
                  <span className="font-terminal text-xl font-bold text-white">{games.length} READY</span>
                </div>
                <div className="bg-black border-2 border-[#00f0ff] px-3 py-1 text-center pixel-shadow-black">
                  <span className="block text-[9px] text-[#00f0ff] font-arcade">FORMAT</span>
                  <span className="font-terminal text-xl font-bold text-cyan-300">IFRAMES</span>
                </div>
                <div className="bg-black border-2 border-[#ffe600] px-3 py-1 text-center pixel-shadow-black">
                  <span className="block text-[9px] text-[#ffe600] font-arcade">STATUS</span>
                  <span className="font-terminal text-xl font-bold text-yellow-300">UNBLOCKED</span>
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
              <div className="flex flex-col items-center justify-center py-16 text-center bg-[#130b24] border-4 border-black pixel-shadow-black p-6 my-6">
                <div className="w-14 h-14 bg-black border-2 border-red-500 flex items-center justify-center text-red-500 mb-3 pixel-shadow-black">
                  <SearchX className="w-8 h-8" />
                </div>
                <h3 className="font-arcade text-sm text-red-400 tracking-wider">GAME OVER: NO MATCH</h3>
                <p className="font-terminal text-base text-slate-300 max-w-sm mt-2 mb-4">
                  {selectedCategory === 'Favorites'
                    ? "You have not saved any retro games to favorites yet. Press the star on any arcade cabinet!"
                    : `No arcade titles matched "${searchQuery}". Clear query or choose another genre.`}
                </p>
                <button
                  id="reset-filters-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="arcade-btn px-4 py-2 bg-[#ffe600] hover:bg-yellow-300 text-black font-arcade text-xs font-bold border-2 border-black pixel-shadow-black"
                >
                  SHOW ALL ROMS
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 80's Arcade Footer */}
      <footer className="border-t-4 border-black bg-[#0d0718] py-4 text-xs font-terminal text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-arcade text-xs text-white neon-glow-magenta">NIKO&apos;S NIGHTCLUB</span>
            <span className="text-[#39ff14]">●</span>
            <span className="text-pink-300">1980s Retro Arcade Machine</span>
            <span className="text-[#39ff14]">●</span>
            <span>Stored in <code className="text-yellow-400">games.json</code></span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <button
              id="footer-json-btn"
              onClick={() => {
                setHighlightGameForJson(null);
                setIsJsonModalOpen(true);
              }}
              className="text-cyan-300 hover:text-white underline font-terminal"
            >
              Inspect games.json Manifest
            </button>
            <span>•</span>
            <span className="text-green-400">
              Stealth: Press <kbd className="px-1.5 py-0.5 bg-black text-yellow-300 border border-yellow-400 font-arcade text-[9px]">Alt+P</kbd> or click Cloak for Panic Shield
            </span>
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

      <GoogleSitesEmbedModal
        isOpen={isGoogleSitesModalOpen}
        onClose={() => setIsGoogleSitesModalOpen(false)}
      />

      <PhoneGuideModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
      />
    </div>
  );
}
