import React from 'react';
import { Play, Star, Eye, Code2 } from 'lucide-react';

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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'puzzle':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'action':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'classic':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div
      id={`game-card-${game.id}`}
      className="group relative flex flex-col bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-200"
    >
      {/* Visual Header / Banner */}
      <div 
        onClick={() => onSelectGame(game)}
        className="relative h-40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 flex flex-col justify-between cursor-pointer overflow-hidden select-none"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-30 group-hover:opacity-50 transition-opacity" />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${getBadgeColor(game.category)}`}>
            {game.category}
          </span>
          {game.badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/30">
              {game.badge}
            </span>
          )}
        </div>

        {/* Center Game Graphic / Play Hover Icon */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-all duration-200 shadow-md">
            <Play className="w-5 h-5 text-slate-300 fill-slate-300 group-hover:text-slate-950 group-hover:fill-slate-950 ml-0.5 transition-colors" />
          </div>
        </div>

        {/* Bottom meta */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{game.plays.toLocaleString()} plays</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <span>★</span>
            <span>{game.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onSelectGame(game)}
              className="font-bold text-base text-slate-100 group-hover:text-emerald-400 transition-colors cursor-pointer"
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
              className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition"
            >
              <Star
                className={`w-4 h-4 ${
                  isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-500'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
            {game.description}
          </p>
        </div>

        {/* Controls Pill Snippet */}
        <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 font-mono truncate">
          <span className="text-emerald-400 font-bold">Controls: </span>
          {game.controls}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
          <button
            id={`play-now-btn-${game.id}`}
            onClick={() => onSelectGame(game)}
            className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Play Now</span>
          </button>
          <button
            id={`iframe-code-btn-${game.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onViewIframeCode(game);
            }}
            title="Inspect stored Iframe element"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            <Code2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
