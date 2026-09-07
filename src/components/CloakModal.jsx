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
    document.title = 'Unblocked Games';
    setSelectedPreset(null);
    const link = document.querySelector("link[rel*='icon']");
    if (link) {
      link.href = '/favicon.ico';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Tab Cloaker</h3>
              <p className="text-xs text-slate-400">Disguise browser tab title and favicon</p>
            </div>
          </div>
          <button
            id="close-cloak-modal-btn"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-3">
          <p className="text-xs text-slate-300">
            Select a disguise preset to change the tab name and favicon instantly:
          </p>

          <div className="grid grid-cols-1 gap-2">
            {PRESETS.map((preset) => {
              const isApplied = selectedPreset === preset.name;
              return (
                <button
                  key={preset.name}
                  id={`preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => applyCloak(preset)}
                  className={`flex items-center justify-between p-3 rounded-lg border text-left transition ${
                    isApplied
                      ? 'bg-sky-500/10 border-sky-500/50 text-slate-100'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-sky-400" />
                    <div>
                      <div className="font-semibold text-xs text-slate-200">{preset.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{preset.title}</div>
                    </div>
                  </div>
                  {isApplied && <Check className="w-4 h-4 text-sky-400" />}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              id="reset-cloak-btn"
              onClick={resetCloak}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Reset to Default Tab
            </button>
            <button
              id="done-cloak-btn"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
