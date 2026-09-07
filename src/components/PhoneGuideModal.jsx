import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Gamepad2,
  Check,
  Copy,
  Share2,
  Tv,
  ArrowRight
} from 'lucide-react';

export const PhoneGuideModal = ({ isOpen, onClose }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Niko's Nightclub - 80's Retro Arcade",
          text: "Play unblocked 80s arcade games with touch controls on your phone!",
          url: currentUrl
        });
      } catch {
        // Cancelled or unsupported
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#130b24] border-4 border-black pixel-shadow-magenta max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="bg-[#1f103b] border-b-4 border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#39ff14] border-2 border-black pixel-shadow-black flex items-center justify-center text-black">
              <Smartphone className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-arcade text-sm sm:text-base text-white neon-glow-green flex items-center gap-2">
                <span>MOBILE PHONE ARCADE</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-[#ff007f] text-white border border-black font-bold">
                  ACTIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Play all 8 retro arcade games on any iPhone or Android phone!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-black/40 hover:bg-red-600 text-slate-400 hover:text-white border-2 border-black transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Feature Highlights */}
          <div className="bg-emerald-950/70 border-2 border-emerald-500/50 p-4 rounded pixel-shadow-black">
            <div className="font-bold text-emerald-300 font-arcade text-xs mb-2 flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              <span>FULL MOBILE TOUCH CONTROLS INCLUDED:</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 leading-relaxed list-disc list-inside">
              <li><strong className="text-white">Built-in 80s D-Pad:</strong> 4-way tactile directional pad with continuous touch-holding and haptic vibration.</li>
              <li><strong className="text-white">Arcade A &amp; B Buttons:</strong> Action buttons mapped automatically per game (Jump, Flap, Rotate, Fire, Duck).</li>
              <li><strong className="text-white">Direct Canvas Touch Gestures:</strong>
                <div className="pl-4 mt-1 space-y-1 text-slate-400">
                  <div>&bull; <span className="text-cyan-300 font-bold">Snake:</span> Swipe anywhere to turn!</div>
                  <div>&bull; <span className="text-pink-300 font-bold">Tetris:</span> Swipe left/right to move, tap to rotate, swipe down to drop!</div>
                  <div>&bull; <span className="text-yellow-300 font-bold">Flappy Bird:</span> Tap anywhere on screen to flap!</div>
                  <div>&bull; <span className="text-green-300 font-bold">Dino Runner:</span> Tap to jump, swipe down to duck!</div>
                  <div>&bull; <span className="text-blue-300 font-bold">Pong &amp; Breakout:</span> Drag your finger to smoothly slide the paddle!</div>
                  <div>&bull; <span className="text-purple-300 font-bold">2048:</span> Swipe left/right/up/down to merge tiles!</div>
                  <div>&bull; <span className="text-rose-300 font-bold">Space Defenders:</span> Touch left/right side of screen to fly and tap to blast!</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Share / Open on Phone */}
          <div className="bg-black/60 border border-purple-500/40 p-4 rounded space-y-3">
            <div className="font-bold text-yellow-300 font-arcade text-[11px] flex items-center gap-1.5">
              <Share2 className="w-4 h-4" />
              <span>OPEN ON YOUR PHONE NOW:</span>
            </div>
            <p className="text-slate-300">
              Copy this link and send it to your phone via text, Discord, or AirDrop, or scan with your phone camera:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-black border border-cyan-500 text-cyan-300 px-2 py-1.5 text-xs font-mono select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="arcade-btn px-3 py-1.5 bg-[#00f0ff] hover:bg-cyan-300 text-black font-arcade text-[10px] font-bold border-2 border-black flex items-center gap-1"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'COPIED!' : 'COPY'}</span>
              </button>
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="arcade-btn px-3 py-1.5 bg-[#ff007f] hover:bg-pink-400 text-white font-arcade text-[10px] font-bold border-2 border-black flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>SHARE</span>
                </button>
              )}
            </div>
          </div>

          {/* Full Screen Home Screen Tip */}
          <div className="bg-[#1b1035] border border-yellow-500/40 p-3.5 rounded space-y-2 text-slate-300">
            <div className="font-bold text-yellow-300 font-arcade text-[11px] flex items-center gap-1.5">
              <Tv className="w-4 h-4" />
              <span>PRO TIP: PLAY FULLSCREEN WITHOUT BROWSER ADDRESS BAR:</span>
            </div>
            <p>
              &bull; <strong className="text-white">iPhone (Safari):</strong> Tap the <strong>Share</strong> icon (box with up arrow) &rarr; select <strong>&quot;Add to Home Screen&quot;</strong>.
            </p>
            <p>
              &bull; <strong className="text-white">Android (Chrome):</strong> Tap the <strong>three dots</strong> menu &rarr; tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home Screen&quot;</strong>.
            </p>
            <p className="text-[11px] text-green-300 font-terminal">
              The arcade will launch like a native retro handheld game console!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#1a0e33] border-t-2 border-black p-3 flex justify-end">
          <button
            onClick={onClose}
            className="arcade-btn px-4 py-2 bg-[#ffe600] hover:bg-yellow-300 text-black font-arcade text-xs font-bold border-2 border-black pixel-shadow-black flex items-center gap-1.5"
          >
            <span>LET&apos;S PLAY</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
