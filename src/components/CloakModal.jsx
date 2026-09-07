import React, { useState } from 'react';
import { X, Shield, Check, Globe } from 'lucide-react';

const PRESETS = [
  {
    name: 'Google Docs',
    title: 'Untitled document - Google Docs',
    iconUrl: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico'
  },
  {
    name: 'Google Drive',
    title: 'My Drive - Google Drive',
    iconUrl: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png'
  },
  {
    name: 'Google Classroom',
    title: 'Classes',
    iconUrl: 'https://ssl.gstatic.com/classroom/favicon.png'
  },
  {
    name: 'Canvas LMS',
    title: 'Dashboard | Canvas',
    iconUrl: 'https://du11hjcvx0uqb.cloudfront.net/br/dist/images/favicon-e10d657a73.ico'
  }
];

export const CloakModal = ({ isOpen, onClose }) => {
  const [selectedPreset, setSelectedPreset] = useState(null);

  if (!isOpen) return null;

  const applyCloak = (preset) => {
    document.title = preset.title;
    setSelectedPreset(preset.name);

    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = preset.iconUrl;
  };

  const resetCloak = () => {
    document.title = "Niko's Nightclub - 80's Retro Arcade";
    setSelectedPreset(null);
    const link = document.querySelector("link[rel*='icon']");
    if (link) {
      link.href = './favicon.ico';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-[#120826] border-4 border-black pixel-shadow-black max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-[#1f0e3e]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00f0ff] border-2 border-black flex items-center justify-center pixel-shadow-black">
              <Shield className="w-4 h-4 text-black stroke-[3]" />
            </div>
            <div>
              <h3 className="font-arcade text-xs text-white neon-glow-cyan">TAB CLOAK ENGINE</h3>
              <p className="font-terminal text-sm text-pink-300">DISGUISE NIKO&apos;S NIGHTCLUB</p>
            </div>
          </div>
          <button
            id="close-cloak-modal-btn"
            onClick={onClose}
            className="arcade-btn p-1 bg-red-600 text-white border-2 border-black pixel-shadow-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-3">
          <p className="font-terminal text-base text-cyan-300">
            Select a camouflage preset to alter the browser tab title and favicon immediately:
          </p>

          <div className="grid grid-cols-1 gap-2">
            {PRESETS.map((preset) => {
              const isApplied = selectedPreset === preset.name;
              return (
                <button
                  key={preset.name}
                  id={`preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => applyCloak(preset)}
                  className={`arcade-btn flex items-center justify-between p-2.5 border-2 text-left transition ${
                    isApplied
                      ? 'bg-[#00f0ff] border-black text-black font-bold pixel-shadow-black'
                      : 'bg-black border-cyan-800 hover:border-cyan-400 text-cyan-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-pink-400" />
                    <div>
                      <div className="font-arcade text-[10px]">{preset.name}</div>
                      <div className="text-xs font-terminal opacity-80">{preset.title}</div>
                    </div>
                  </div>
                  {isApplied && <Check className="w-4 h-4 text-black stroke-[3]" />}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t-2 border-black flex items-center justify-between">
            <button
              id="reset-cloak-btn"
              onClick={resetCloak}
              className="font-arcade text-[9px] text-pink-400 hover:text-white underline"
            >
              RESTORE NIKO&apos;S TAB
            </button>
            <button
              id="done-cloak-btn"
              onClick={onClose}
              className="arcade-btn px-4 py-1.5 bg-[#ff007f] hover:bg-pink-400 text-white font-arcade text-[10px] font-bold border-2 border-black pixel-shadow-black"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
