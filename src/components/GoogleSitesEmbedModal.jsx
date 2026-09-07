import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
  Sparkles,
  Loader2
} from 'lucide-react';

export const GoogleSitesEmbedModal = ({ isOpen, onClose }) => {
  const [embedCode, setEmbedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('instructions'); // 'instructions' | 'code'

  useEffect(() => {
    if (isOpen && !embedCode) {
      setLoading(true);
      fetch('./embed.html')
        .then(res => {
          if (res.ok) return res.text();
          throw new Error('Could not fetch ./embed.html');
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

  const handleCopy = async () => {
    if (!embedCode) return;
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleDownload = () => {
    if (!embedCode) return;
    const blob = new Blob([embedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nikos-network-standalone.html';
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
                <span>GOOGLE SITES EMBEDDER</span>
                <span className="bg-green-600 text-black px-1.5 py-0.5 text-[8px] font-bold uppercase border border-black">
                  UNBLOCKED
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Host Niko&apos;s Network directly on Google&apos;s whitelisted servers
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

        {/* Why this works banner */}
        <div className="bg-emerald-950/60 border-b-2 border-emerald-500/40 p-3.5 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-200 leading-relaxed">
            <span className="font-bold text-white">Why this bypasses school filters: </span>
            When you embed using <span className="underline font-bold text-emerald-300">Embed Code</span> (instead of &quot;By URL&quot;), Google saves the entire game catalog directly onto Google&apos;s own infrastructure (<code className="bg-black/50 px-1 py-0.5 rounded text-emerald-300">googleusercontent.com</code>). Chromebook filters <strong className="text-white">cannot block Google</strong> without breaking Google Classroom and Google Docs!
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="p-4 bg-[#1a0e33] border-b-2 border-black flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
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
                  <span>EMBED CODE COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{loading ? 'PREPARING CODE...' : 'COPY EMBED CODE'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              disabled={loading || !embedCode}
              className="arcade-btn flex items-center gap-1.5 px-3 py-2.5 bg-[#251448] hover:bg-[#341d66] text-cyan-300 font-arcade text-xs border-2 border-black pixel-shadow-black transition"
              title="Download standalone HTML to run offline"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">DOWNLOAD .HTML</span>
            </button>
          </div>

          <div className="flex items-center bg-black/40 p-1 border border-purple-500/30">
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-3 py-1 text-xs font-semibold rounded-none transition ${
                activeTab === 'instructions'
                  ? 'bg-[#39ff14] text-black font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Instructions
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 text-xs font-semibold rounded-none transition ${
                activeTab === 'code'
                  ? 'bg-[#39ff14] text-black font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              View Code
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'instructions' ? (
            <div className="space-y-4">
              <h3 className="font-arcade text-xs text-cyan-300 flex items-center gap-2">
                <span>3-STEP GOOGLE SITES SETUP:</span>
              </h3>

              {/* Step 1 */}
              <div className="flex gap-3.5 items-start bg-black/40 border border-purple-500/30 p-3.5">
                <div className="w-6 h-6 rounded bg-pink-600 text-white font-arcade text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="text-xs space-y-1">
                  <div className="font-bold text-white">Click &quot;Copy Embed Code&quot; Above</div>
                  <p className="text-slate-300">
                    This copies the complete standalone HTML bundle (including all 8 games) directly into your clipboard.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3.5 items-start bg-black/40 border border-purple-500/30 p-3.5">
                <div className="w-6 h-6 rounded bg-cyan-600 text-white font-arcade text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="text-xs space-y-1">
                  <div className="font-bold text-white">
                    In Google Sites, choose &quot;Embed Code&quot; (NOT &quot;By URL&quot;)
                  </div>
                  <p className="text-slate-300">
                    On your Google Site, click <strong className="text-white">Insert</strong> in the right sidebar, then click <strong className="text-white">Embed (&lt;&gt;)</strong>. Select the <strong className="text-yellow-300">Embed code</strong> tab at the top.
                  </p>
                  <p className="text-slate-400 italic">
                    Paste (<kbd className="bg-slate-800 px-1 py-0.5 border border-slate-600 text-white">Ctrl + V</kbd>) into the box and click <strong className="text-white">Next</strong> &rarr; <strong className="text-white">Insert</strong>.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3.5 items-start bg-black/40 border border-purple-500/30 p-3.5">
                <div className="w-6 h-6 rounded bg-yellow-500 text-black font-arcade text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="text-xs space-y-1">
                  <div className="font-bold text-white">Expand Box &amp; Publish</div>
                  <p className="text-slate-300">
                    Click the embedded game box and drag the corner blue dots so it fills your entire page. Then click the purple <strong className="text-white">Publish</strong> button in the top right.
                  </p>
                  <p className="text-green-400 font-semibold">
                    ✓ You now have a 100% unblocked arcade running on official Google infrastructure!
                  </p>
                </div>
              </div>

              {/* Pro Tip */}
              <div className="bg-purple-950/40 border border-purple-500/40 p-3 text-xs text-purple-200">
                <span className="font-bold text-yellow-300">★ PRO-TIP FOR FULL SCREEN:</span> In Google Sites, click the <strong>Pages</strong> tab on the right, hover over the <strong>+</strong> button at the bottom, and click <strong>&quot;Full page embed&quot;</strong>. That completely hides all Google Sites borders and headers!
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Self-Contained Standalone HTML ({embedCode ? `${(embedCode.length / 1024).toFixed(0)} KB` : 'Loading...'})</span>
                <span className="text-yellow-300 font-mono">Zero external requests</span>
              </div>
              <div className="relative">
                {loading ? (
                  <div className="h-64 flex flex-col items-center justify-center bg-black border border-purple-500/30 text-slate-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                    <span className="font-arcade text-xs">Compiling Standalone Code...</span>
                  </div>
                ) : (
                  <textarea
                    readOnly
                    value={embedCode}
                    onClick={(e) => e.target.select()}
                    className="w-full h-64 bg-black border-2 border-purple-500/40 p-3 font-mono text-[11px] text-green-400 focus:outline-none focus:border-cyan-400 resize-none selection:bg-pink-600 selection:text-white"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#170c2d] border-t-2 border-black flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-arcade text-[10px] text-green-300">PROTECTED BY GOOGLE CLOUD USERCONTENT</span>
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
