import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';

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
      description: description.trim() || 'Custom unblocked web game.',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Plus className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Add Game as Iframe</h3>
              <p className="text-xs text-slate-400">Stores an iframe in JSON configuration</p>
            </div>
          </div>
          <button
            id="close-add-modal-btn"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Game Title *</label>
            <input
              id="new-game-title"
              type="text"
              required
              placeholder="e.g. Slope 3D, Cookie Clicker, Moto X3M"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
            <select
              id="new-game-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="Arcade">Arcade</option>
              <option value="Puzzle">Puzzle</option>
              <option value="Action">Action</option>
              <option value="Classic">Classic</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Input Format</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  id="tab-input-url"
                  onClick={() => setInputType('url')}
                  className={`text-[11px] px-2 py-0.5 rounded transition ${
                    inputType === 'url' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Direct URL
                </button>
                <button
                  type="button"
                  id="tab-input-iframe"
                  onClick={() => setInputType('iframe')}
                  className={`text-[11px] px-2 py-0.5 rounded transition ${
                    inputType === 'iframe' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Raw &lt;iframe&gt; Code
                </button>
              </div>
            </div>

            {inputType === 'url' ? (
              <input
                id="new-game-url"
                type="text"
                required
                placeholder="https://example.com/game or /games/mygame/index.html"
                value={urlOrEmbed}
                onChange={(e) => setUrlOrEmbed(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
              />
            ) : (
              <textarea
                id="new-game-iframe-code"
                rows={3}
                required
                placeholder='<iframe src="https://example.com" width="100%" height="100%"></iframe>'
                value={urlOrEmbed}
                onChange={(e) => setUrlOrEmbed(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
              />
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              {inputType === 'url' ? 'Will be wrapped in an iframe element in the JSON entry.' : 'Extracted src will be assigned to the iframe.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Controls Hint</label>
            <input
              id="new-game-controls"
              type="text"
              placeholder="e.g. Arrow keys to steer, Space to brake"
              value={controls}
              onChange={(e) => setControls(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description (Optional)</label>
            <textarea
              id="new-game-desc"
              rows={2}
              placeholder="Brief overview of gameplay..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              id="cancel-add-modal-btn"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-add-modal-btn"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition"
            >
              Save to JSON List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
