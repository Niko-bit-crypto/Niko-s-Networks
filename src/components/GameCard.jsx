import React from 'react';
import { Star, Play, Code2, Flame } from 'lucide-react';

const GAME_ICONS = {
  snake: '🐍',
  tetris: '🧱',
  pong: '🏓',
  breakout: '⚡',
  '2048': '🔢',
  flappy: '🐥',
  runner: '🦖',
  'space-invaders': '👾',
};

export const GameCard = ({
  game,
  isFavorite,
  onToggleFavorite,
  onSelectGame,
  onViewIframeCode,
}) => {
  const getBadgeColor = (cat) => {
    switch (cat.toLowerCase()) {
      case 'arcade':
        return 'bg-pink-600 text-white border-black';
      case 'puzzle':
        return 'bg-purple-600 text-white border-black';
      case 'action':
        return 'bg-amber-500 text-black border-black';
      case 'classic':
        return 'bg-emerald-500 text-black border-black';
      default:
        return 'bg-cyan-500 text-black border-black';
    }
  };

  const gameIcon = GAME_ICONS[game.id] || '🕹️';

  return (
    <div
      id={`game-card-${game.id}`}
      className="group relative flex flex-col bg-[#120b22] border-4 border-black pixel-shadow-black hover:border-[#ff007f] hover:pixel-shadow-magenta transition-all duration-150"
    >
      {/* Arcade Cabinet Top Marquee Screen */}
      <div 
        onClick={() => onSelectGame(game)}
        className="relative h-44 bg-gradient-to-b from-[#1f113a] via-[#0d071a] to-[#080410] p-3 flex flex-col justify-between cursor-pointer overflow-hidden select-none border-b-4 border-black"
      >
        {/* Subtle retro scanlines & grid in card */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff007f15_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff15_1px,transparent_1px)] bg-[size:16px_16px]" />
        <div className="absolute inset-0 crt-overlay opacity-40" />

        {/* Top Badges & Status */}
        <div className="relative z-10 flex items-center justify-between">
          <span className={`px-2 py-0.5 text-[9px] font-arcade uppercase border-2 shadow-[2px_2px_0px_#000] font-bold ${getBadgeColor(game.category)}`}>
            {game.category}
          </span>
          {game.badge && (
            <span className="px-2 py-0.5 text-[9px] font-arcade uppercase bg-yellow-400 text-black border-2 border-black font-bold shadow-[2px_2px_0px_#000] flex items-center gap-1">
              <Flame className="w-2.5 h-2.5 text-red-600 fill-red-600" />
              <span>{game.badge}</span>
            </span>
          )}
        </div>

        {/* Center 80s Arcade Pixel Icon & Play Target */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto group">
          <div className="w-16 h-16 bg-[#000]/80 border-2 border-[#00f0ff] flex items-center justify-center pixel-shadow-cyan group-hover:scale-110 group-hover:border-yellow-400 group-hover:pixel-shadow-yellow transition-all">
            <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
              {gameIcon}
            </span>
          </div>
          <span className="text-[9px] font-arcade text-cyan-300 mt-2 tracking-widest opacity-80 group-hover:opacity-100 group-hover:text-yellow-300 animate-arcade-blink">
            [PRESS START]
          </span>
        </div>

        {/* Bottom Card Meta / Hi-Score */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-terminal text-pink-300">
          <div className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 border border-pink-500/30">
            <span>PLAYS:</span>
            <span className="text-white font-bold">{game.plays.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 border border-yellow-500/30 text-yellow-300">
            <span>★</span>
            <span className="font-bold">{game.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Arcade Cartridge Body */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3 bg-[#130b24]">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onSelectGame(game)}
              className="font-arcade text-xs text-white group-hover:text-cyan-300 transition-colors cursor-pointer leading-snug tracking-wide"
            >
              {game.title}
            </h3>
            <button
              id={`fav-btn-${game.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(game.id);
              }}
              title={isFavorite ? "Remove favorite" : "Add to favorites"}
              className="p-1 text-slate-500 hover:text-yellow-400 transition hover:scale-110"
            >
              <Star
                className={`w-4 h-4 ${
                  isFavorite ? 'text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_5px_#ffe600]' : 'text-slate-500'
                }`}
              />
            </button>
          </div>

          <p className="font-terminal text-sm text-slate-300 line-clamp-2 mt-2 leading-relaxed">
            {game.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {(game.tags || []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-pixel bg-[#1e1338] text-pink-300 px-1.5 py-0.5 border border-pink-500/30"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Controls: Play & Code */}
        <div className="flex items-center gap-2 pt-2 border-t-2 border-[#201540]">
          <button
            id={`play-btn-${game.id}`}
            onClick={() => onSelectGame(game)}
            className="arcade-btn flex-1 py-2 bg-[#39ff14] hover:bg-[#52ff33] text-black font-arcade text-[10px] font-bold border-2 border-black pixel-shadow-black flex items-center justify-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-black text-black" />
            <span>PLAY NOW</span>
          </button>

          <button
            id={`inspect-iframe-btn-${game.id}`}
            onClick={() => onViewIframeCode(game)}
            title="Inspect Iframe embed definition"
            className="arcade-btn p-2 bg-[#1f1338] hover:bg-[#2d1b54] text-cyan-300 border-2 border-black pixel-shadow-black"
          >
            <Code2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
