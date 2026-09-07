import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Sparkles,
  Loader2,
  Code2,
  FileCode,
  Zap
} from 'lucide-react';

export const GoogleSitesEmbedModal = ({ isOpen, onClose }) => {
  const [embedCode, setEmbedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedAppsScript, setCopiedAppsScript] = useState(false);
  const [activeTab, setActiveTab] = useState('embed'); // 'embed' | 'appscript' | 'vercel'

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

  const appsScriptCode = `function doGet() {
  return HtmlService.createHtmlOutput(
    '<iframe src="https://elifowler4113.github.io/nikos-network/" style="position:fixed;top:0;left:0;width:100vw;height:100vh;border:none;margin:0;padding:0;overflow:hidden;" allow="autoplay; fullscreen; keyboard" allowfullscreen></iframe>'
  )
  .setTitle("Study Lab")
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}`;

  const handleCopyAppsScript = async () => {
    try {
      await navigator.clipboard.writeText(appsScriptCode);
      setCopiedAppsScript(true);
      setTimeout(() => setCopiedAppsScript(false), 3000);
    } catch (err) {
      console.error('Apps script copy failed:', err);
    }
  };

  const handleDownload = () => {
    if (!embedCode) return;
    const blob = new Blob([embedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nikos-network-google-sites-fixed.html';
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
            <div className="w-8 h-8 bg-[#39ff14] border-2 border-black pixel-shadow-black flex items-center justify-center text-black">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-arcade text-xs sm:text-sm text-yellow-300 tracking-wider flex items-center gap-2">
                <span>GOOGLE SITES UNBLOCK TOOLKIT</span>
                <span className="bg-green-500 text-black px-1.5 py-0.5 text-[8px] font-bold uppercase border border-black">
                  FIXED
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Run Niko&apos;s Network on Google infrastructure without blank screens or filters
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
            onClick={() => setActiveTab('embed')}
            className={`px-3 py-2 text-xs font-arcade border-t-2 border-x-2 border-black transition flex items-center gap-1.5 ${
              activeTab === 'embed'
                ? 'bg-[#ff007f] text-white font-bold'
                : 'bg-black/40 text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>1. FIXED EMBED CODE</span>
          </button>

          <button
            onClick={() => setActiveTab('appscript')}
            className={`px-3 py-2 text-xs font-arcade border-t-2 border-x-2 border-black transition flex items-center gap-1.5 ${
              activeTab === 'appscript'
                ? 'bg-[#39ff14] text-black font-bold'
                : 'bg-black/40 text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2. GOOGLE SCRIPT (100% UNBLOCKED)</span>
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
          
          {/* TAB 1: Fixed Embed Code */}
          {activeTab === 'embed' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/60 border border-emerald-500/40 p-3 flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-200 leading-relaxed">
                  <span className="font-bold text-white">Why it went blank before: </span>
                  Google Sites sandboxes block modern <code className="bg-black/50 px-1 rounded text-pink-300">type=&quot;module&quot;</code> scripts with CORS errors. We updated the bundler to output <strong>classic scripts</strong> without modules, so Chrome executes it inside Google Sites!
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleCopyEmbed}
                  disabled={loading || !embedCode}
                  className={`arcade-btn flex items-center gap-2 px-4 py-2.5 font-arcade text-xs font-bold border-2 border-black pixel-shadow-black transition ${
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
                      <span>{loading ? 'PREPARING CODE...' : 'COPY FIXED EMBED CODE'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  disabled={loading || !embedCode}
                  className="arcade-btn flex items-center gap-1.5 px-3 py-2.5 bg-[#251448] hover:bg-[#341d66] text-cyan-300 font-arcade text-xs border-2 border-black pixel-shadow-black transition"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD .HTML FILE</span>
                </button>
              </div>

              <div className="space-y-2 text-xs bg-black/40 border border-purple-500/30 p-3.5">
                <div className="font-bold text-yellow-300 uppercase tracking-wide">
                  How to paste into Google Sites:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>In Google Sites, click <strong>Insert</strong> &rarr; <strong>Embed (&lt;&gt;)</strong>.</li>
                  <li>Click the <strong className="text-white">Embed code</strong> tab at the top.</li>
                  <li>Paste (<kbd className="bg-slate-800 px-1 py-0.5 border border-slate-600 text-white">Ctrl + V</kbd>) and click <strong>Next</strong> &rarr; <strong>Insert</strong>.</li>
                  <li>Drag the box corners so it fills the screen!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: Google Apps Script Web App */}
          {activeTab === 'appscript' && (
            <div className="space-y-4">
              <div className="bg-blue-950/60 border border-blue-500/40 p-3 text-xs text-blue-200 leading-relaxed">
                <span className="font-bold text-white">The Ultimate School Bypass: </span>
                Google Apps Script runs directly on <code className="bg-black/50 px-1 rounded text-cyan-300">script.google.com</code>. Your school Chromebook filter <strong>can never block this domain</strong> because it is an official Google Workspace tool.
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Copy this 6-line Google Script:</span>
                  <button
                    onClick={handleCopyAppsScript}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#39ff14] text-black font-arcade text-[10px] font-bold border border-black hover:bg-green-400"
                  >
                    {copiedAppsScript ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAppsScript ? 'COPIED!' : 'COPY CODE'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-black border border-purple-500/40 text-green-400 font-mono text-[11px] overflow-x-auto selection:bg-pink-600 selection:text-white">
                  {appsScriptCode}
                </pre>
              </div>

              <div className="space-y-2 text-xs bg-black/40 border border-purple-500/30 p-3.5">
                <div className="font-bold text-cyan-300 uppercase tracking-wide">
                  Deploying in 60 seconds:
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Open a new tab and visit <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-yellow-300 underline font-bold">script.google.com</a>.</li>
                  <li>Click <strong className="text-white">+ New project</strong> (top left).</li>
                  <li>Replace everything with the code above and click the blue <strong className="text-white">Deploy</strong> button &rarr; <strong className="text-white">New deployment</strong>.</li>
                  <li>Click the gear icon ⚙️ &rarr; choose <strong className="text-white">Web app</strong>.</li>
                  <li>Set &quot;Who has access&quot; to <strong className="text-green-400">Anyone</strong> and click <strong className="text-white">Deploy</strong>.</li>
                  <li>Copy your new <code className="text-cyan-300">https://script.google.com/.../exec</code> URL!</li>
                  <li>In Google Sites, click <strong>Insert &rarr; Embed &rarr; By URL</strong> and paste it!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: Vercel Mirror */}
          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div className="bg-purple-950/60 border border-purple-500/40 p-3 text-xs text-purple-200 leading-relaxed">
                <span className="font-bold text-white">Why Vercel works: </span>
                School filters block <code className="bg-black/50 px-1 rounded text-red-300">*.github.io</code> because students make games there. But <code className="bg-black/50 px-1 rounded text-cyan-300">*.vercel.app</code> is categorized as <em>&quot;Software Engineering &amp; Education&quot;</em> in Securly/GoGuardian databases, so it sails right past the filter!
              </div>

              <div className="space-y-2 text-xs bg-black/40 border border-purple-500/30 p-3.5">
                <div className="font-bold text-cyan-300 uppercase tracking-wide">
                  Connect GitHub to Vercel (100% Free):
                </div>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>Go to <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-yellow-300 underline font-bold">vercel.com/new</a> and click <strong>&quot;Continue with GitHub&quot;</strong>.</li>
                  <li>Select your <strong className="text-white">nikos-network</strong> repository and click <strong>Import</strong>.</li>
                  <li>Leave everything as default and click the blue <strong>Deploy</strong> button.</li>
                  <li>In 30 seconds, Vercel gives you a live link like <code className="text-green-400">https://nikos-network.vercel.app</code>.</li>
                  <li>You can open that link directly on your Chromebook, or embed it in Google Sites with <strong>Embed &rarr; By URL</strong>!</li>
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#170c2d] border-t-2 border-black flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-arcade text-[10px] text-green-300">CHROMEBOOK ANTI-FILTER ACTIVE</span>
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
