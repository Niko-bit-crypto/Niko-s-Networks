import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Maximize,
  Minimize,
  ExternalLink,
  Check,
  Code,
  Terminal,
  Info,
  Tv
} from 'lucide-react';

export const GamePlayer = ({
  game,
  onBack,
  onOpenJsonModal,
  crtEnabled,
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
    <div className="flex flex-col gap-4 max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
      {/* 80s Arcade Player Control Marquee */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-[#110924] border-4 border-black pixel-shadow-black p-3.5">
        <div className="flex items-center gap-3">
          <button
            id="player-back-btn"
            onClick={onBack}
            className="arcade-btn flex items-center gap-1.5 px-3 py-1.5 bg-[#00f0ff] hover:bg-[#4df4ff] text-black font-arcade text-[10px] font-bold border-2 border-black pixel-shadow-black"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>ARCADE</span>
          </button>

          <div>
            <h2 className="font-arcade text-sm sm:text-base text-white neon-glow-magenta flex items-center gap-2">
              <span>{game.title}</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-[#ffe600] text-black border border-black font-bold">
                {game.category.toUpperCase()}
              </span>
            </h2>
          </div>
        </div>

        {/* Machine Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="player-restart-btn"
            onClick={handleRestart}
            title="Reset arcade machine"
            className="arcade-btn p-2 bg-[#ff007f] hover:bg-pink-400 text-white border-2 border-black pixel-shadow-black"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            id="player-fullscreen-btn"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Cabinet fullscreen"}
            className="arcade-btn p-2 bg-[#ffe600] hover:bg-yellow-300 text-black border-2 border-black pixel-shadow-black"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>

          <button
            id="player-newtab-btn"
            onClick={handleOpenNewTab}
            title="Open game directly in a new window"
            className="arcade-btn p-2 bg-[#39ff14] hover:bg-green-400 text-black border-2 border-black pixel-shadow-black"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            id="player-copy-iframe-btn"
            onClick={handleCopyIframe}
            title="Copy stored Iframe tag"
            className="arcade-btn flex items-center gap-1.5 px-3 py-2 bg-[#20153f] hover:bg-[#2e1d5a] text-cyan-300 font-arcade text-[10px] font-bold border-2 border-black pixel-shadow-black"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Code className="w-3.5 h-3.5 text-yellow-400" />}
            <span className="hidden sm:inline">{copied ? 'COPIED!' : 'COPY IFRAME'}</span>
          </button>
        </div>
      </div>

      {/* 80's Arcade Cabinet Screen Bezel */}
      <div className="bg-[#180e30] border-4 border-black pixel-shadow-black p-2 sm:p-4 rounded-none relative">
        {/* Cabinet Marquee Label */}
        <div className="flex items-center justify-between pb-2 text-[10px] font-arcade text-pink-400 px-1 border-b-2 border-black mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            <span className="text-white neon-glow-cyan font-bold">NIKO&apos;S NETWORK CABINET #084</span>
          </div>
          <div className="text-yellow-300 hidden sm:block">
            ★ 25¢ INSERT COIN TO CONTINUE ★
          </div>
        </div>

        {/* Embedded CRT Screen Container */}
        <div
          ref={containerRef}
          id="game-iframe-stage"
          className={`relative w-full border-4 border-black bg-black shadow-inner flex flex-col items-center justify-center overflow-hidden ${
            isFullscreen ? 'h-screen w-screen border-none p-0' : 'h-[580px]'
          }`}
        >
          {/* Iframe with offline in-memory srcDoc fallback */}
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={game.srcDoc ? undefined : resolvedIframeSrc}
            srcDoc={game.srcDoc || undefined}
            title={game.title}
            className="w-full h-full border-0 bg-black"
            allow="autoplay; fullscreen; keyboard"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="eager"
          />

          {/* Optional Scanlines effect over the game stage if enabled */}
          {crtEnabled && (
            <div className="absolute inset-0 crt-overlay pointer-events-none opacity-60" />
          )}
        </div>

        {/* Arcade Coin Door Bar below monitor */}
        <div className="flex items-center justify-between pt-2 mt-2 border-t-2 border-black text-[11px] font-terminal text-cyan-300 px-2">
          <span className="flex items-center gap-1 text-[#39ff14]">
            <span>● MACHINE ACTIVE</span>
            <span>-</span>
            <span>60 FPS CRT REFRESH</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="text-yellow-300 font-arcade text-[9px] bg-black px-2 py-0.5 border border-yellow-400">
              COIN RETURN [PUSH]
            </span>
          </div>
        </div>
      </div>

      {/* Retro Info & Instruction Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Controls Card */}
        <div className="bg-[#110924] border-4 border-black pixel-shadow-black p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#39ff14] font-arcade text-xs neon-glow-green">
            <Terminal className="w-4 h-4" />
            <span>PLAYER CONTROLS</span>
          </div>
          <p className="font-terminal text-base sm:text-lg text-green-300 bg-black p-3 border-2 border-[#39ff14]/40 leading-snug tracking-wider">
            {game.controls}
          </p>
        </div>

        {/* About Game */}
        <div className="bg-[#110924] border-4 border-black pixel-shadow-black p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#00f0ff] font-arcade text-xs neon-glow-cyan">
            <Info className="w-4 h-4" />
            <span>ROM SPECS</span>
          </div>
          <p className="font-terminal text-base text-slate-300 leading-normal">
            {game.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-auto pt-2">
            {(game.tags || []).map((tag) => (
              <span key={tag} className="text-[9px] font-pixel bg-[#1f143a] text-yellow-300 px-2 py-0.5 border border-yellow-400/30">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* JSON Manifest Card */}
        <div className="bg-[#110924] border-4 border-black pixel-shadow-black p-4 flex flex-col justify-between gap-2">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#ffe600] font-arcade text-xs neon-glow-yellow">
                <Code className="w-4 h-4" />
                <span>JSON ENTRY</span>
              </div>
              <button
                id="toggle-json-snippet-btn"
                onClick={() => setShowJsonSnippet(!showJsonSnippet)}
                className="text-xs font-arcade text-pink-400 hover:text-white underline"
              >
                {showJsonSnippet ? 'HIDE' : 'EXPAND'}
              </button>
            </div>
            <p className="font-terminal text-sm text-slate-300 mt-1">
              Live iframe mapping in public <code className="text-yellow-400">games.json</code>.
            </p>
          </div>

          {showJsonSnippet ? (
            <pre className="text-[11px] bg-black p-2 border-2 border-yellow-400 text-yellow-300 font-terminal overflow-x-auto max-h-36">
              {JSON.stringify(
                {
                  id: game.id,
                  title: game.title,
                  category: game.category,
                  iframeSrc: game.iframeSrc,
                },
                null,
                2
              )}
            </pre>
          ) : (
            <button
              id="open-full-json-btn"
              onClick={onOpenJsonModal}
              className="arcade-btn w-full py-2 bg-[#ffe600] hover:bg-yellow-300 text-black font-arcade text-[10px] font-bold border-2 border-black pixel-shadow-black flex items-center justify-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>OPEN games.json</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
