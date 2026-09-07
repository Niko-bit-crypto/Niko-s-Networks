import React, { useState } from 'react';
import { X, Copy, Check, Download, RefreshCw, Database } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Database className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <span>{selectedGameForHighlight ? `Iframe JSON: ${selectedGameForHighlight.title}` : 'games.json Configuration'}</span>
                <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
                  {games.length} Games Stored
                </span>
              </h3>
              <p className="text-xs text-slate-400">Each game is stored as an Iframe record in this JSON structure</p>
            </div>
          </div>
          <button
            id="close-json-modal-btn"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* JSON Code Viewer */}
        <div className="p-4 bg-slate-950 flex-1 overflow-auto">
          <pre className="text-xs font-mono text-emerald-400/90 leading-relaxed selection:bg-emerald-500 selection:text-slate-950">
            {jsonString}
          </pre>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-900 text-xs">
          <div className="flex items-center gap-2">
            <button
              id="reset-json-defaults-btn"
              onClick={onResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              title="Reset catalog back to original games.json defaults"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="download-json-btn"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
            <button
              id="copy-json-btn"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shadow-sm transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
