import React, { useRef, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Play,
  Smartphone
} from 'lucide-react';

export const VirtualGamepad = ({ game, onSendKey, onRestart }) => {
  const intervalsRef = useRef({});

  const triggerHaptic = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(15);
      }
    } catch {
      // Haptics not allowed/supported
    }
  };

  const handleStartPress = (key, code) => {
    triggerHaptic();
    onSendKey('keydown', key, code);

    // Continuous repeat for directional holding (e.g. holding Left to move paddle or ship)
    if (!intervalsRef.current[key]) {
      intervalsRef.current[key] = setInterval(() => {
        onSendKey('keydown', key, code);
      }, 75);
    }
  };

  const handleEndPress = (key, code) => {
    if (intervalsRef.current[key]) {
      clearInterval(intervalsRef.current[key]);
      delete intervalsRef.current[key];
    }
    onSendKey('keyup', key, code);
  };

  // Clean up any running intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
      intervalsRef.current = {};
    };
  }, []);

  // Determine button labels based on game
  const getButtonLabels = () => {
    const id = game?.id || '';
    if (id === 'tetris') {
      return {
        aLabel: 'ROTATE',
        aKey: 'ArrowUp',
        bLabel: 'DROP',
        bKey: ' ',
        subA: 'Turn',
        subB: 'Hard Drop'
      };
    }
    if (id === 'flappy') {
      return {
        aLabel: 'FLAP',
        aKey: ' ',
        bLabel: 'START',
        bKey: 'Enter',
        subA: 'Jump/Fly',
        subB: 'Play'
      };
    }
    if (id === 'runner') {
      return {
        aLabel: 'JUMP',
        aKey: ' ',
        bLabel: 'DUCK',
        bKey: 'ArrowDown',
        subA: 'Space',
        subB: 'Down'
      };
    }
    if (id === 'space-invaders') {
      return {
        aLabel: 'FIRE',
        aKey: ' ',
        bLabel: 'START',
        bKey: 'Enter',
        subA: 'Laser',
        subB: 'Play'
      };
    }
    if (id === 'pacman') {
      return {
        aLabel: 'START',
        aKey: ' ',
        bLabel: 'COIN',
        bKey: 'Enter',
        subA: 'Chomp',
        subB: 'Enter'
      };
    }
    if (id === 'breakout' || id === 'pong') {
      return {
        aLabel: 'SERVE',
        aKey: ' ',
        bLabel: 'START',
        bKey: 'Enter',
        subA: 'Launch',
        subB: 'Play'
      };
    }
    return {
      aLabel: 'ACTION',
      aKey: ' ',
      bLabel: 'SELECT',
      bKey: 'Enter',
      subA: 'Space',
      subB: 'Enter'
    };
  };

  const labels = getButtonLabels();

  return (
    <div className="w-full bg-[#140b28] border-4 border-black pixel-shadow-black p-3 select-none touch-none">
      {/* Gamepad Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-black text-[10px] font-arcade text-pink-400">
        <div className="flex items-center gap-1.5 text-cyan-300">
          <Smartphone className="w-3.5 h-3.5" />
          <span>80&apos;S RETRO TOUCH GAMEPAD</span>
        </div>
        <div className="text-[#39ff14] text-[9px]">
          TOUCH SCREEN COMPATIBLE
        </div>
      </div>

      {/* Main Controller Layout */}
      <div className="flex items-center justify-between gap-2 sm:gap-6 flex-wrap sm:flex-nowrap">
        
        {/* LEFT: 4-Way D-PAD */}
        <div className="flex flex-col items-center justify-center p-1">
          <div className="text-[9px] font-arcade text-cyan-400 mb-1 text-center">D-PAD</div>
          <div className="relative w-36 h-36 bg-[#0a0517] border-2 border-black rounded-full flex items-center justify-center p-1.5 shadow-inner">
            
            {/* UP */}
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); handleStartPress('ArrowUp', 'ArrowUp'); }}
              onPointerUp={(e) => { e.preventDefault(); handleEndPress('ArrowUp', 'ArrowUp'); }}
              onPointerLeave={(e) => { e.preventDefault(); handleEndPress('ArrowUp', 'ArrowUp'); }}
              onPointerCancel={(e) => { e.preventDefault(); handleEndPress('ArrowUp', 'ArrowUp'); }}
              className="absolute top-1.5 w-11 h-12 bg-[#251545] hover:bg-[#3d1f73] active:bg-[#00f0ff] active:text-black text-cyan-300 border-2 border-black flex items-center justify-center pixel-shadow-black transition transform active:scale-95"
              aria-label="Up"
            >
              <ChevronUp className="w-6 h-6 stroke-[3]" />
            </button>

            {/* DOWN */}
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); handleStartPress('ArrowDown', 'ArrowDown'); }}
              onPointerUp={(e) => { e.preventDefault(); handleEndPress('ArrowDown', 'ArrowDown'); }}
              onPointerLeave={(e) => { e.preventDefault(); handleEndPress('ArrowDown', 'ArrowDown'); }}
              onPointerCancel={(e) => { e.preventDefault(); handleEndPress('ArrowDown', 'ArrowDown'); }}
              className="absolute bottom-1.5 w-11 h-12 bg-[#251545] hover:bg-[#3d1f73] active:bg-[#00f0ff] active:text-black text-cyan-300 border-2 border-black flex items-center justify-center pixel-shadow-black transition transform active:scale-95"
              aria-label="Down"
            >
              <ChevronDown className="w-6 h-6 stroke-[3]" />
            </button>

            {/* LEFT */}
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); handleStartPress('ArrowLeft', 'ArrowLeft'); }}
              onPointerUp={(e) => { e.preventDefault(); handleEndPress('ArrowLeft', 'ArrowLeft'); }}
              onPointerLeave={(e) => { e.preventDefault(); handleEndPress('ArrowLeft', 'ArrowLeft'); }}
              onPointerCancel={(e) => { e.preventDefault(); handleEndPress('ArrowLeft', 'ArrowLeft'); }}
              className="absolute left-1.5 w-12 h-11 bg-[#251545] hover:bg-[#3d1f73] active:bg-[#00f0ff] active:text-black text-cyan-300 border-2 border-black flex items-center justify-center pixel-shadow-black transition transform active:scale-95"
              aria-label="Left"
            >
              <ChevronLeft className="w-6 h-6 stroke-[3]" />
            </button>

            {/* RIGHT */}
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); handleStartPress('ArrowRight', 'ArrowRight'); }}
              onPointerUp={(e) => { e.preventDefault(); handleEndPress('ArrowRight', 'ArrowRight'); }}
              onPointerLeave={(e) => { e.preventDefault(); handleEndPress('ArrowRight', 'ArrowRight'); }}
              onPointerCancel={(e) => { e.preventDefault(); handleEndPress('ArrowRight', 'ArrowRight'); }}
              className="absolute right-1.5 w-12 h-11 bg-[#251545] hover:bg-[#3d1f73] active:bg-[#00f0ff] active:text-black text-cyan-300 border-2 border-black flex items-center justify-center pixel-shadow-black transition transform active:scale-95"
              aria-label="Right"
            >
              <ChevronRight className="w-6 h-6 stroke-[3]" />
            </button>

            {/* Center Pivot */}
            <div className="w-8 h-8 bg-[#130728] border-2 border-black rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-[#00f0ff] rounded-full opacity-60" />
            </div>
          </div>
        </div>

        {/* CENTER: SYSTEM / START / RESTART BUTTONS */}
        <div className="flex flex-row sm:flex-col items-center justify-center gap-3 py-2">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              triggerHaptic();
              onSendKey('keydown', 'Enter', 'Enter');
              onSendKey('keydown', ' ', 'Space');
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              onSendKey('keyup', 'Enter', 'Enter');
              onSendKey('keyup', ' ', 'Space');
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#ffe600] active:bg-yellow-400 text-black font-arcade text-[10px] font-bold border-2 border-black pixel-shadow-black active:translate-y-0.5 transition"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>START</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              if (onRestart) onRestart();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1b1035] active:bg-[#ff007f] text-pink-300 active:text-white font-arcade text-[10px] font-bold border-2 border-black pixel-shadow-black active:translate-y-0.5 transition"
          >
            <RotateCcw className="w-3 h-3 stroke-[2.5]" />
            <span>RESET</span>
          </button>
        </div>

        {/* RIGHT: ACTION BUTTONS (A & B) */}
        <div className="flex flex-col items-center justify-center p-1">
          <div className="text-[9px] font-arcade text-pink-400 mb-1 text-center">ACTION BUTTONS</div>
          <div className="flex items-center gap-4">
            
            {/* BUTTON B */}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); handleStartPress(labels.bKey, labels.bKey); }}
                onPointerUp={(e) => { e.preventDefault(); handleEndPress(labels.bKey, labels.bKey); }}
                onPointerLeave={(e) => { e.preventDefault(); handleEndPress(labels.bKey, labels.bKey); }}
                onPointerCancel={(e) => { e.preventDefault(); handleEndPress(labels.bKey, labels.bKey); }}
                className="w-16 h-16 rounded-full bg-[#00f0ff] active:bg-cyan-200 text-black font-arcade text-base font-bold border-4 border-black pixel-shadow-black flex flex-col items-center justify-center transition transform active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                aria-label={labels.bLabel}
              >
                <span>B</span>
                <span className="text-[8px] font-terminal uppercase leading-none font-bold">
                  {labels.bLabel}
                </span>
              </button>
              <span className="text-[9px] font-terminal text-cyan-300 font-bold">
                {labels.subB}
              </span>
            </div>

            {/* BUTTON A */}
            <div className="flex flex-col items-center gap-1 mb-3">
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); handleStartPress(labels.aKey, labels.aKey); }}
                onPointerUp={(e) => { e.preventDefault(); handleEndPress(labels.aKey, labels.aKey); }}
                onPointerLeave={(e) => { e.preventDefault(); handleEndPress(labels.aKey, labels.aKey); }}
                onPointerCancel={(e) => { e.preventDefault(); handleEndPress(labels.aKey, labels.aKey); }}
                className="w-16 h-16 rounded-full bg-[#ff007f] active:bg-pink-400 text-white font-arcade text-base font-bold border-4 border-black pixel-shadow-black flex flex-col items-center justify-center transition transform active:scale-95 shadow-[0_0_15px_rgba(255,0,127,0.5)]"
                aria-label={labels.aLabel}
              >
                <span>A</span>
                <span className="text-[8px] font-terminal uppercase leading-none font-bold">
                  {labels.aLabel}
                </span>
              </button>
              <span className="text-[9px] font-terminal text-pink-300 font-bold">
                {labels.subA}
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Touchscreen Tips */}
      <div className="mt-2.5 pt-1.5 border-t border-purple-900/60 text-[10px] text-slate-400 text-center font-terminal flex items-center justify-center gap-2 flex-wrap">
        <span>TIP: You can also tap, swipe or drag directly on the game screen!</span>
      </div>
    </div>
  );
};
