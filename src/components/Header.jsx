import React from 'react';
import { Gamepad2, Search, PlusCircle, Code, Shield, EyeOff, Star } from 'lucide-react';

const CATEGORIES = [
  { label: 'All' },
  { label: 'Arcade' },
  { label: 'Puzzle' },
  { label: 'Action' },
  { label: 'Classic' },
  { label: 'Favorites' }
];

export const Header = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenAddModal,
  onOpenJsonModal,
  onOpenCloakModal,
  onTriggerPanic,
  favoritesCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => onSelectCategory('All')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Gamepad2 className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wider text-slate-100 uppercase">
                  Unblocked <span className="text-emerald-400">Games</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  HTML5
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">JSON-Configured Iframe Hub</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="game-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search games or tags..."
                className="w-full bg-slate-950/80 border border-slate-700/80 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Utility Tools */}
          <div className="flex items-center gap-2">
            <button
              id="cloak-btn"
              onClick={onOpenCloakModal}
              title="Disguise browser tab"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-slate-100 rounded-lg border border-slate-700 transition"
            >
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>Tab Cloak</span>
            </button>

            <button
              id="json-config-btn"
              onClick={onOpenJsonModal}
              title="View & Edit JSON database"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-slate-100 rounded-lg border border-slate-700 transition"
            >
              <Code className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">JSON</span>
            </button>

            <button
              id="add-game-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Game</span>
            </button>

            <button
              id="panic-btn"
              onClick={onTriggerPanic}
              title="Panic button (Press ESC anytime)"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Panic [ESC]</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar border-t border-slate-800/80">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                id={`category-tab-${cat.label.toLowerCase()}`}
                onClick={() => onSelectCategory(cat.label)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/30'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                {cat.label === 'Favorites' && <Star className={`w-3 h-3 ${isSelected ? 'text-slate-950 fill-slate-950' : 'text-amber-400'}`} />}
                <span>{cat.label}</span>
                {cat.label === 'Favorites' && favoritesCount > 0 && (
                  <span className={`text-[10px] px-1 rounded font-mono ${isSelected ? 'bg-slate-900 text-emerald-400' : 'bg-slate-700 text-amber-300'}`}>
                    {favoritesCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
