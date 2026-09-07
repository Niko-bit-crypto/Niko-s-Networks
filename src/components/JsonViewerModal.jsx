import React, { useState } from 'react';
import { X, Copy, Check, Download, RefreshCw, Terminal } from 'lucide-react';

export const JsonViewerModal = ({
  isOpen,
  onClose,
  games,
  onResetDefaults,
  selectedGameForHighlight,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(
    selectedGameForHighlight
      ? selectedGameForHighlight
      : games.map(g => ({
          id: g.id,
          title: g.title,
          category: g.category,
          description: g.description,
          iframeSrc: g.iframeSrc,
          iframeCode: g.iframeCode,
          controls: g.controls,
          badge: g.badge,
          plays: g.plays,
          rating: g.rating,
          tags: g.tags,
        })),
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'games.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-[#120826] border-4 border-black pixel-shadow-black max-w-3xl w-full flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-[#1f0e3e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#ffe600] border-2 border-black flex items-center justify-center pixel-shadow-black">
              <Terminal className="w-4 h-4 text-black stroke-[3]" />
            </div>
            <div>
              <h3 className="font-arcade text-xs text-white neon-glow-yellow flex items-center gap-2">
                <span>{selectedGameForHighlight ? `ROM: ${selectedGameForHighlight.title}` : 'games.json ARCADE MANIFEST'}</span>
                <span className="text-[9px] bg-black text-[#39ff14] px-1.5 py-0.5 border border-[#39ff14]">
                  {games.length} ROMS LOADED
                </span>
              </h3>
              <p className="font-terminal text-sm text-pink-300">
                JSON-CONFIGURED IFRAME CARTRIDGE REGISTRY
              </p>
            </div>
          </div>
          <button
            id="close-json-modal-btn"
            onClick={onClose}
            className="arcade-btn p-1 bg-red-600 text-white border-2 border-black pixel-shadow-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* JSON Code Viewer - Retro Terminal Style */}
        <div className="p-4 bg-black flex-1 overflow-auto border-b-4 border-black relative">
          <pre className="font-terminal text-base text-[#39ff14] leading-tight selection:bg-[#39ff14] selection:text-black">
            {jsonString}
          </pre>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#170c30] text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              id="reset-json-defaults-btn"
              onClick={onResetDefaults}
              className="arcade-btn flex items-center gap-1.5 px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 font-arcade text-[9px] border-2 border-black pixel-shadow-black"
              title="Reset catalog back to original games.json defaults"
            >
              <RefreshCw className="w-3 h-3" />
              <span>RESET ROMS</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="download-json-btn"
              onClick={handleDownload}
              className="arcade-btn flex items-center gap-1.5 px-3 py-1.5 bg-[#00f0ff] hover:bg-cyan-300 text-black font-arcade text-[9px] font-bold border-2 border-black pixel-shadow-black"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD</span>
            </button>
            <button
              id="copy-json-btn"
              onClick={handleCopy}
              className="arcade-btn flex items-center gap-1.5 px-3 py-1.5 bg-[#ffe600] hover:bg-yellow-300 text-black font-arcade text-[9px] font-bold border-2 border-black pixel-shadow-black"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5 text-black" />}
              <span>{copied ? 'COPIED!' : 'COPY JSON'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
