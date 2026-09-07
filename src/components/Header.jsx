import React from 'react';
import { Search, Plus, Terminal, Shield, EyeOff, Sparkles, Tv, ShieldCheck, Smartphone } from 'lucide-react';

const CATEGORIES = [
  { label: 'All', color: 'border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.4)]', bgActive: 'bg-cyan-500 text-black shadow-[3px_3px_0px_#000]' },
  { label: 'Arcade', color: 'border-pink-500 text-pink-300 shadow-[0_0_8px_rgba(255,0,127,0.4)]', bgActive: 'bg-pink-500 text-black shadow-[3px_3px_0px_#000]' },
  { label: 'Puzzle', color: 'border-purple-400 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.4)]', bgActive: 'bg-purple-500 text-black shadow-[3px_3px_0px_#000]' },
  { label: 'Action', color: 'border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.4)]', bgActive: 'bg-amber-400 text-black shadow-[3px_3px_0px_#000]' },
  { label: 'Classic', color: 'border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.4)]', bgActive: 'bg-emerald-400 text-black shadow-[3px_3px_0px_#000]' },
  { label: 'Favorites', color: 'border-yellow-300 text-yellow-300 shadow-[0_0_8px_rgba(253,224,71,0.4)]', bgActive: 'bg-yellow-300 text-black shadow-[3px_3px_0px_#000]' }
];

export const Header = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenAddModal,
  onOpenJsonModal,
  onOpenCloakModal,
  onOpenGoogleSitesModal,
  onOpenPhoneModal,
  onTriggerPanic,
  favoritesCount,
  crtEnabled,
  onToggleCrt,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0d0718]/95 backdrop-blur-md border-b-4 border-black pixel-shadow-black">
      {/* 80s Arcade Ticker Banner */}
      <div className="bg-black/90 border-b-2 border-[#ff007f] py-1 px-4 text-[11px] sm:text-xs font-arcade flex items-center justify-between overflow-x-auto select-none">
        <div className="flex items-center gap-6 text-[#00f0ff] min-w-max">
          <span className="flex items-center gap-1.5">
            <span className="text-red-500">1UP</span>
            <span className="text-white">08450</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-yellow-400">HIGH SCORE</span>
            <span className="text-white">99990</span>
          </span>
          <span className="text-pink-400 hidden md:inline animate-arcade-blink">
            ★ INSERT COIN TO PLAY ★
          </span>
        </div>

        <div className="flex items-center gap-4 text-[#39ff14] min-w-max text-[10px] sm:text-[11px]">
          <span className="hidden sm:inline text-purple-400">LEVEL: 80s</span>
          <span className="bg-[#1b1035] px-2 py-0.5 border border-green-500/50 text-green-300 font-terminal text-sm">
            CREDITS: 99
          </span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap md:flex-nowrap">
          {/* Logo / Brand Name */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => onSelectCategory('All')}
          >
            {/* Retro Pixel Cabinet Icon */}
            <div className="w-11 h-11 bg-[#ff007f] border-2 border-black pixel-shadow-black flex items-center justify-center relative group-hover:bg-[#00f0ff] transition-colors">
              <span className="text-2xl leading-none select-none">👾</span>
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-yellow-400 border border-black" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-arcade text-base sm:text-lg tracking-wider text-white neon-glow-magenta group-hover:neon-glow-cyan transition-all">
                  NIKO&apos;S <span className="text-[#00f0ff]">NIGHTCLUB</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 bg-yellow-400 text-black font-arcade text-[9px] border border-black font-bold">
                  80s ARCADE
                </span>
              </div>
              <p className="text-sm font-terminal text-pink-300 tracking-wider flex items-center gap-1">
                <span>PRESS START</span>
                <span className="text-[#39ff14]">●</span>
                <span className="text-cyan-300">IFRAME COIN-OP SYSTEM</span>
              </p>
            </div>
          </div>

          {/* Retro Search Bar */}
          <div className="flex-1 max-w-sm order-3 md:order-2 w-full md:w-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="game-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="SEARCH GAME ROMS..."
                className="w-full bg-black/90 border-2 border-[#00f0ff] text-green-400 font-terminal text-lg tracking-wider pl-9 pr-14 py-1.5 placeholder-cyan-700 focus:outline-none focus:border-[#ff007f] focus:shadow-[0_0_10px_#ff007f] transition-all"
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-arcade text-pink-400 hover:text-white px-1"
                >
                  CLR
                </button>
              )}
            </div>
          </div>

          {/* Arcade Controls & Actions */}
          <div className="flex items-center gap-2 order-2 md:order-3 ml-auto md:ml-0">
            {/* CRT Effect Toggle */}
            <button
              id="crt-toggle-btn"
              onClick={onToggleCrt}
              title={crtEnabled ? "Turn CRT scanlines off" : "Turn CRT scanlines on"}
              className={`arcade-btn flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-arcade border-2 border-black pixel-shadow-black ${
                crtEnabled
                  ? 'bg-[#39ff14] text-black font-bold'
                  : 'bg-[#1b1035] text-green-400 hover:bg-[#251747]'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CRT:{crtEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Tab Cloak */}
            <button
              id="cloak-btn"
              onClick={onOpenCloakModal}
              title="Stealth camouflage mode"
              className="arcade-btn hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-arcade bg-[#00f0ff] hover:bg-[#4df4ff] text-black font-bold border-2 border-black pixel-shadow-black"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>CLOAK</span>
            </button>

            {/* JSON ROMs */}
            <button
              id="json-config-btn"
              onClick={onOpenJsonModal}
              title="View JSON game configuration"
              className="arcade-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-arcade bg-[#ffe600] hover:bg-yellow-300 text-black font-bold border-2 border-black pixel-shadow-black"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JSON</span>
            </button>

            {/* Google Sites Anti-Block Embed Code Button */}
            <button
              id="google-sites-embed-btn"
              onClick={onOpenGoogleSitesModal}
              title="Get 100% Unblocked Google Sites Embed Code"
              className="arcade-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-arcade bg-[#39ff14] hover:bg-green-400 text-black font-bold border-2 border-black pixel-shadow-black"
            >
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">G-SITES</span>
            </button>

            {/* Mobile / Phone Guide Button */}
            <button
              id="phone-guide-btn"
              onClick={onOpenPhoneModal}
              title="Play on phone / mobile touch controls guide"
              className="arcade-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-arcade bg-[#ff007f] hover:bg-pink-400 text-white font-bold border-2 border-black pixel-shadow-black"
            >
              <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">PHONE</span>
            </button>

            {/* Add Game */}
            <button
              id="add-game-btn"
              onClick={onOpenAddModal}
              className="arcade-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-arcade bg-[#ff007f] hover:bg-pink-400 text-white font-bold border-2 border-black pixel-shadow-black"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD ROM</span>
            </button>

            {/* Panic Button */}
            <button
              id="panic-btn"
              onClick={onTriggerPanic}
              title="Emergency stealth camouflage (Alt+P or Click)"
              className="arcade-btn inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-arcade bg-red-600 hover:bg-red-500 text-white font-bold border-2 border-black pixel-shadow-black animate-pulse"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">PANIC!</span>
            </button>
          </div>
        </div>

        {/* Arcade Cabinet Button Category Selector */}
        <div className="flex items-center gap-2 pt-2.5 overflow-x-auto no-scrollbar border-t-2 border-[#201540] mt-2">
          <span className="text-[10px] font-arcade text-pink-400 tracking-wider mr-1 hidden sm:inline select-none">
            GENRE:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                id={`category-tab-${cat.label.toLowerCase()}`}
                onClick={() => onSelectCategory(cat.label)}
                className={`arcade-btn px-3 py-1 text-[10px] font-arcade border-2 border-black pixel-shadow-black transition-all whitespace-nowrap ${
                  isSelected
                    ? cat.bgActive
                    : 'bg-[#150d29] text-slate-300 hover:text-white hover:bg-[#231745]'
                }`}
              >
                {cat.label === 'Favorites' ? (
                  <span className="flex items-center gap-1">
                    <span>★ FAVS</span>
                    {favoritesCount > 0 && (
                      <span className="px-1 bg-black text-yellow-400 text-[9px] rounded-none">
                        {favoritesCount}
                      </span>
                    )}
                  </span>
                ) : (
                  cat.label.toUpperCase()
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
