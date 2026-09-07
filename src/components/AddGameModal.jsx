import React, { useState } from 'react';
import { X, Plus, AlertCircle, Terminal } from 'lucide-react';

export const AddGameModal = ({
  isOpen,
  onClose,
  onAddGame,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Arcade');
  const [inputType, setInputType] = useState('url');
  const [urlOrEmbed, setUrlOrEmbed] = useState('');
  const [description, setDescription] = useState('');
  const [controls, setControls] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a game title.');
      return;
    }

    if (!urlOrEmbed.trim()) {
      setError('Please provide an iframe source URL or embed snippet.');
      return;
    }

    let resolvedSrc = urlOrEmbed.trim();
    let resolvedCode = '';

    if (inputType === 'iframe' || urlOrEmbed.includes('<iframe')) {
      const srcMatch = urlOrEmbed.match(/src=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        resolvedSrc = srcMatch[1];
        resolvedCode = urlOrEmbed.trim();
      } else {
        setError('Could not extract a valid src attribute from the iframe snippet.');
        return;
      }
    } else {
      resolvedCode = `<iframe src="${resolvedSrc}" title="${title}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
    }

    const id = `custom-${Date.now()}`;
    const newGame = {
      id,
      title: title.trim(),
      category,
      description: description.trim() || 'Custom retro web game.',
      iframeSrc: resolvedSrc,
      iframeCode: resolvedCode,
      controls: controls.trim() || 'Mouse & Keyboard controls.',
      badge: 'Custom',
      plays: 1,
      rating: 5.0,
      tags: ['Custom', category],
      isCustom: true
    };

    onAddGame(newGame);
    onClose();
    setTitle('');
    setUrlOrEmbed('');
    setDescription('');
    setControls('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-[#120826] border-4 border-black pixel-shadow-black max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-[#1f0e3e]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#39ff14] border-2 border-black flex items-center justify-center pixel-shadow-black">
              <Plus className="w-4 h-4 text-black stroke-[3]" />
            </div>
            <div>
              <h3 className="font-arcade text-xs text-white neon-glow-green">INSTALL NEW ROM</h3>
              <p className="font-terminal text-sm text-pink-300">ADD IFRAME TO NIKO&apos;S NETWORK</p>
            </div>
          </div>
          <button
            id="close-add-modal-btn"
            onClick={onClose}
            className="arcade-btn p-1 bg-red-600 text-white border-2 border-black pixel-shadow-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3 overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-2.5 bg-red-950/80 border-2 border-red-500 text-red-400 font-terminal text-base">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-arcade text-[10px] text-cyan-300 mb-1">ROM TITLE *</label>
            <input
              id="new-game-title"
              type="text"
              required
              placeholder="e.g. Space Odyssey, Pac-Man, Galaga..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black border-2 border-cyan-500 px-3 py-1.5 font-terminal text-lg text-green-300 focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_8px_#ffe600]"
            />
          </div>

          <div>
            <label className="block font-arcade text-[10px] text-cyan-300 mb-1">GENRE CATEGORY</label>
            <select
              id="new-game-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-black border-2 border-cyan-500 px-3 py-1.5 font-arcade text-[10px] text-yellow-300 focus:outline-none focus:border-yellow-400"
            >
              <option value="Arcade">ARCADE</option>
              <option value="Puzzle">PUZZLE</option>
              <option value="Action">ACTION</option>
              <option value="Classic">CLASSIC</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-arcade text-[10px] text-cyan-300">INPUT METHOD</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  id="tab-input-url"
                  onClick={() => setInputType('url')}
                  className={`arcade-btn px-2 py-0.5 font-arcade text-[9px] border border-black ${
                    inputType === 'url' ? 'bg-[#ff007f] text-white font-bold' : 'bg-black text-slate-400'
                  }`}
                >
                  DIRECT URL
                </button>
                <button
                  type="button"
                  id="tab-input-iframe"
                  onClick={() => setInputType('iframe')}
                  className={`arcade-btn px-2 py-0.5 font-arcade text-[9px] border border-black ${
                    inputType === 'iframe' ? 'bg-[#ff007f] text-white font-bold' : 'bg-black text-slate-400'
                  }`}
                >
                  &lt;IFRAME&gt; TAG
                </button>
              </div>
            </div>

            <textarea
              id="new-game-url-or-embed"
              required
              rows={2}
              placeholder={
                inputType === 'url'
                  ? 'https://example.com/games/my-retro-game/index.html'
                  : '<iframe src="https://example.com/embed" width="100%" height="100%"></iframe>'
              }
              value={urlOrEmbed}
              onChange={(e) => setUrlOrEmbed(e.target.value)}
              className="w-full bg-black border-2 border-pink-500 px-3 py-1.5 font-terminal text-base text-yellow-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block font-arcade text-[10px] text-cyan-300 mb-1">CONTROLS DESCRIPTION</label>
            <input
              id="new-game-controls"
              type="text"
              placeholder="Arrow Keys to move, Space to shoot"
              value={controls}
              onChange={(e) => setControls(e.target.value)}
              className="w-full bg-black border-2 border-cyan-500 px-3 py-1.5 font-terminal text-base text-green-300 focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block font-arcade text-[10px] text-cyan-300 mb-1">DESCRIPTION</label>
            <textarea
              id="new-game-desc"
              rows={2}
              placeholder="Enter short game synopsis..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black border-2 border-cyan-500 px-3 py-1.5 font-terminal text-base text-slate-200 focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-black">
            <button
              type="button"
              id="cancel-add-btn"
              onClick={onClose}
              className="arcade-btn px-3 py-2 font-arcade text-[10px] bg-black text-slate-300 border-2 border-black pixel-shadow-black"
            >
              CANCEL
            </button>
            <button
              type="submit"
              id="submit-add-btn"
              className="arcade-btn px-4 py-2 font-arcade text-[10px] bg-[#39ff14] hover:bg-green-400 text-black font-bold border-2 border-black pixel-shadow-black"
            >
              SAVE TO NIKO&apos;S NETWORK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
