import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Gamepad2,
  Sparkles,
  Loader2,
  Code2,
  FileCode,
  Monitor
} from 'lucide-react';

export const GoogleSitesEmbedModal = ({ isOpen, onClose }) => {
  const [embedCode, setEmbedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('offline'); // 'offline' | 'embed' | 'vercel'

  useEffect(() => {
    if (isOpen && !embedCode) {
      setLoading(true);
      fetch('./google-sites-embed.html')
        .then(res => {
          if (res.ok) return res.text();
          return fetch('./embed.html').then(r => r.text());
        })
        .then(text => {
          setEmbedCode(text);
          setLoading(false);
        })
        .catch(err => {
          console.warn('Embed file fetch error:', err);
          setLoading(false);
        });
    }
  }, [isOpen, embedCode]);

  if (!isOpen) return null;

  const handleCopyEmbed = async () => {
    if (!embedCode) return;
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleDownloadArcade = () => {
    if (!embedCode) return;
    const blob = new Blob([embedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nikos-retro-arcade-offline.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#130b24] border-4 border-black pixel-shadow-magenta max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="bg-[#1f103b] border-b-4 border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#ff007f] border-2 border-black pixel-shadow-black flex items-center justify-center text-white">
              <Gamepad2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-arcade text-xs sm:text-sm text-yellow-300 tracking-wider flex items-center gap-2">
                <span>NIKO&apos;S 80&apos;S RETRO ARCADE PORTAL</span>
                <span className="bg-[#39ff14] text-black px-1.5 py-0.5 text-[8px] font-bold uppercase border border-black">
                  READY
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Download the standalone offline edition or grab the Google Sites embed code!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-black/40 hover:bg-red-600 text-slate-400 hover:text-white border-2 border-black transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#1a0e33] border-b-2 border-black px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('offline')}
            className={`px-3 py-2 text-xs font-arcade border-t-2 border-x-2 border-black transition flex items-center gap-1.5 ${
              activeTab === 'offline'
                ? 'bg-[#39ff14] text-black font-bold'
                : 'bg-black/40 text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>1. DOWNLOAD OFFLINE ARCADE (.HTML)</span>
          </button>

          <button
            onClick={() => setActiveTab('embed')}
            className={`px-3 py-2 text-xs font-arcade border-t-2 border-x-2 border-black transition flex items-center gap-1.5 ${
              activeTab === 'embed'
                ? 'bg-[#ff007f] text-white font-bold'
                : 'bg-black/40 text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>2. GOOGLE SITES EMBED</span>
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`px-3 py-2 text-xs font-arcade border-t-2 border-x-2 border-black transition flex items-center gap-1.5 ${
              activeTab === 'vercel'
                ? 'bg-[#00f0ff] text-black font-bold'
                : 'bg-black/40 text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>3. VERCEL MIRROR</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: OFFLINE ARCADE DOWNLOAD */}
          {activeTab === 'offline' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/70 border-2 border-emerald-500/50 p-4 rounded pixel-shadow-black">
                <div className="flex items-center gap-2 font-bold text-emerald-300 text-xs sm:text-sm mb-1.5 font-arcade">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>PLAY DIRECTLY ON ANY CHROMEBOOK OR PC (NO INTERNET NEEDED):</span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed space-y-1.5">
                  <p>This packages all 8 retro games (Snake, Tetris, Pong, Breakout, 2048, Flappy, Dino Runner, Space Invaders), 80s neon CRT visuals, sound effects, and controls into a <strong>single standalone .html file</strong>.</p>
                  <p>When you download it and double-click it, Chrome opens it straight from your computer (<code className="bg-black/60 px-1 py-0.5 rounded text-emerald-300 font-mono">file:///...</code>). <strong>No wifi or server connection required!</strong></p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDownloadArcade}
                  disabled={loading || !embedCode}
                  className="arcade-btn flex items-center gap-2.5 px-6 py-4 bg-[#39ff14] hover:bg-green-400 text-black font-arcade text-xs sm:text-sm font-bold border-2 border-black pixel-shadow-black transition transform active:scale-95"
                >
                  <Download className="w-5 h-5 stroke-[2.5]" />
                  <span>{loading ? 'PREPARING ARCADE...' : 'DOWNLOAD 80S ARCADE (.HTML)'}</span>
                </button>
              </div>

              <div className="space-y-2 text-xs bg-black/50 border border-purple-500/30 p-4 rounded">
                <div className="font-bold text-yellow-300 uppercase tracking-wide flex items-center gap-1.5 font-arcade text-[11px]">
                  <Monitor className="w-4 h-4 text-yellow-300" />
                  <span>How to open and play in 3 steps:</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>Click the green <strong className="text-white font-bold">&quot;DOWNLOAD 80S ARCADE (.HTML)&quot;</strong> button above.</li>
                  <li>Open your <strong>Downloads</strong> folder (or press <kbd className="bg-slate-800 px-1.5 py-0.5 border border-slate-600 text-white font-mono">Alt + Shift + M</kbd> on a Chromebook).</li>
                  <li>Double-click <strong className="text-emerald-300 font-mono">nikos-retro-arcade-offline.html</strong> — it opens right in your browser with all 8 games ready to play!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: Google Sites Embed Code */}
          {activeTab === 'embed' && (
            <div className="space-y-4">
              <div className="bg-fuchsia-950/60 border border-fuchsia-500/40 p-3.5 flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-fuchsia-400 shrink-0 mt-0.5" />
                <div className="text-xs text-fuchsia-200 leading-relaxed">
                  <span className="font-bold text-white">Classic Script Standalone: </span>
                  Google Sites blocks modern module scripts. This standalone code packages all games in classic scripts, complete with the 80s arcade styling and the <strong>↗ FULL TAB</strong> launcher!
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleCopyEmbed}
                  disabled={loading || !embedCode}
                  className={`arcade-btn flex items-center gap-2 px-5 py-3 font-arcade text-xs font-bold border-2 border-black pixel-shadow-black transition ${
                    copied
                      ? 'bg-green-400 text-black'
                      : 'bg-[#ff007f] hover:bg-pink-500 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>COPIED TO CLIPBOARD!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{loading ? 'PREPARING CODE...' : 'COPY RETRO EMBED CODE'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadArcade}
                  disabled={loading || !embedCode}
                  className="arcade-btn flex items-center gap-1.5 px-4 py-3 bg-[#251448] hover:bg-[#341d66] text-cyan-300 font-arcade text-xs border-2 border-black pixel-shadow-black transition"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD .HTML FILE</span>
                </button>
              </div>

              <div className="space-y-2 text-xs bg-black/40 border border-purple-500/30 p-3.5">
                <div className="font-bold text-yellow-300 uppercase tracking-wide font-arcade text-[10px]">
                  How to paste into Google Sites:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>In Google Sites, click <strong>Insert</strong> &rarr; <strong>Embed (&lt;&gt;)</strong>.</li>
                  <li>Click the <strong className="text-white">Embed code</strong> tab at the top.</li>
                  <li>Paste (<kbd className="bg-slate-800 px-1 py-0.5 border border-slate-600 text-white">Ctrl + V</kbd>) and click <strong>Next</strong> &rarr; <strong>Insert</strong>.</li>
                  <li>Drag the blue corner handles so the box fills your page!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: Vercel Mirror */}
          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div className="bg-purple-950/60 border border-purple-500/40 p-3.5 text-xs text-purple-200 leading-relaxed">
                <span className="font-bold text-white">Why Vercel works: </span>
                If GitHub Pages is restricted on your network, <code className="bg-black/50 px-1 rounded text-cyan-300">*.vercel.app</code> is categorized as <em>&quot;Software Engineering &amp; Development&quot;</em> in web categorizers, making it sail right through!
              </div>

              <div className="space-y-2 text-xs bg-black/40 border border-purple-500/30 p-3.5">
                <div className="font-bold text-cyan-300 uppercase tracking-wide font-arcade text-[10px]">
                  Connect GitHub to Vercel (100% Free):
                </div>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>Go to <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-yellow-300 underline font-bold">vercel.com/new</a> and click <strong>&quot;Continue with GitHub&quot;</strong>.</li>
                  <li>Select your <strong className="text-white">nikos-network</strong> repository and click <strong>Import</strong>.</li>
                  <li>Leave everything as default and click the blue <strong>Deploy</strong> button.</li>
                  <li>In 30 seconds, Vercel gives you a live link like <code className="text-green-400">https://nikos-network.vercel.app</code>.</li>
                  <li>You can open that link directly, or embed it into Google Sites using <strong>Embed &rarr; By URL</strong>!</li>
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#170c2d] border-t-2 border-black flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="font-arcade text-[10px] text-pink-300">80&apos;S SYNTHWAVE RETRO ARCADE</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-black hover:bg-slate-800 text-white font-arcade text-[10px] border border-slate-600"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};

