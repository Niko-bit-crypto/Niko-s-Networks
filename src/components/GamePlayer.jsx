import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Maximize,
  Minimize,
  ExternalLink,
  Code,
  Check,
  Keyboard,
  Info
} from 'lucide-react';

export const GamePlayer = ({
  game,
  onBack,
  onOpenJsonModal,
}) => {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showJsonSnippet, setShowJsonSnippet] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error('Failed to enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error('Failed to exit fullscreen:', err);
      });
    }
  };

  const handleRestart = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleCopyIframe = () => {
    navigator.clipboard.writeText(game.iframeCode || `<iframe src="${game.iframeSrc}" width="100%" height="100%" frameborder="0"></iframe>`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resolveSrc = (src) => {
    if (!src) return '';
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    if (src.startsWith('./')) return src;
    if (src.startsWith('/')) return '.' + src;
    return './' + src;
  };

  const resolvedIframeSrc = resolveSrc(game.iframeSrc);

  const handleOpenNewTab = () => {
    window.open(resolvedIframeSrc, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col gap-4 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-3">
          <button
            id="player-back-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Catalog</span>
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-100 flex items-center gap-2">
              <span>{game.title}</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {game.category}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="player-restart-btn"
            onClick={handleRestart}
            title="Reload game frame"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 rounded-lg border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            id="player-fullscreen-btn"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 rounded-lg border border-slate-700 transition"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          <button
            id="player-newtab-btn"
            onClick={handleOpenNewTab}
            title="Open game directly in a new tab"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 rounded-lg border border-slate-700 transition"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            id="player-copy-iframe-btn"
            onClick={handleCopyIframe}
            title="Copy stored Iframe tag"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Iframe'}</span>
          </button>
        </div>
      </div>

      {/* Embedded Iframe Stage */}
      <div
        ref={containerRef}
        id="game-iframe-stage"
        className={`relative w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col items-center justify-center ${
          isFullscreen ? 'h-screen w-screen rounded-none border-none p-0' : 'h-[580px]'
        }`}
      >
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={resolvedIframeSrc}
          title={game.title}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; keyboard"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          loading="eager"
        />
      </div>

      {/* Game Details & Controls Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Controls Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Keyboard className="w-4 h-4" />
            <span>Controls & Instructions</span>
          </div>
          <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
            {game.controls}
          </p>
        </div>

        {/* About Game */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Info className="w-4 h-4" />
            <span>About Game</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {game.description}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
            {game.tags.map((tag) => (
              <span key={tag} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* JSON & Storage Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-2">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Code className="w-4 h-4" />
                <span>JSON Iframe Entry</span>
              </div>
              <button
                id="toggle-json-snippet-btn"
                onClick={() => setShowJsonSnippet(!showJsonSnippet)}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                {showJsonSnippet ? 'Hide' : 'Inspect'}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Stored as an iframe object in the public <code className="text-amber-400 font-mono">games.json</code> manifest.
            </p>
          </div>

          {showJsonSnippet ? (
            <pre className="text-[10px] bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300 font-mono overflow-x-auto max-h-36">
              {JSON.stringify(
                {
                  id: game.id,
                  title: game.title,
                  category: game.category,
                  iframeSrc: game.iframeSrc,
                  iframeCode: game.iframeCode,
                },
                null,
                2
              )}
            </pre>
          ) : (
            <button
              id="open-full-json-btn"
              onClick={onOpenJsonModal}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <Code className="w-3.5 h-3.5 text-amber-400" />
              <span>View games.json</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
