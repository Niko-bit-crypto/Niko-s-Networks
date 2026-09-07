import React, { useEffect } from 'react';
import { Eye, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';

export const PanicScreen = ({ onExitPanic }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || (e.key === '`' && e.ctrlKey)) {
        onExitPanic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExitPanic]);

  return (
    <div className="fixed inset-0 z-50 bg-white text-slate-800 flex flex-col font-sans overflow-auto">
      {/* Quick Return Ribbon */}
      <div 
        onClick={onExitPanic}
        className="bg-[#07040d] text-cyan-300 px-4 py-1.5 text-xs font-mono flex items-center justify-between border-b-2 border-[#ff007f] cursor-pointer hover:bg-[#140b29] transition select-none"
        title="Click anywhere on this bar to return to Niko's Nightclub"
      >
        <div className="flex items-center gap-2">
          <span>🕹️</span>
          <span className="font-bold text-white tracking-wider">NIKO&apos;S NIGHTCLUB — STEALTH CAMOUFLAGE ACTIVE</span>
          <span className="text-slate-400 hidden sm:inline">(Click to Return to Arcade)</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onExitPanic(); }}
          className="px-2.5 py-0.5 bg-[#39ff14] text-black font-bold text-[11px] rounded hover:bg-green-400 flex items-center gap-1 shadow-sm"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>RETURN TO ARCADE</span>
        </button>
      </div>

      {/* Mock Docs Header */}
      <header className="border-b border-slate-200 px-6 py-3 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <div>
            <div className="font-semibold text-sm text-slate-800 flex items-center gap-2">
              <span>AP European History - Chapter 14 Study Notes</span>
              <span className="text-xs text-slate-400">Saved to Drive</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-0.5">
              <span>File</span>
              <span>Edit</span>
              <span>View</span>
              <span>Insert</span>
              <span>Format</span>
              <span>Tools</span>
            </div>
          </div>
        </div>

        <button
          id="exit-panic-btn"
          onClick={onExitPanic}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#140b29] hover:bg-black text-[#00f0ff] text-xs font-semibold rounded border border-[#00f0ff] shadow-sm transition"
          title="Return to Niko's Nightclub"
        >
          <Eye className="w-3.5 h-3.5 text-[#39ff14]" />
          <span>Resume Niko&apos;s Nightclub</span>
        </button>
      </header>

      {/* Mock Document Body */}
      <main className="max-w-3xl mx-auto w-full my-8 bg-white p-12 shadow-sm border border-slate-200 rounded min-h-[800px] leading-relaxed text-slate-700 text-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
          Chapter 14: The Industrial Revolution & Urban Expansion
        </h1>

        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded mb-6">
          <CheckCircle2 className="w-4 h-4" />
          <span>Document sync verified. Last edited 3 minutes ago.</span>
        </div>

        <h2 className="text-lg font-semibold text-slate-800 mt-6 mb-2">1. Foundations of Industrialization</h2>
        <p className="mb-4">
          The transformation began in Britain during the late eighteenth century due to abundant coal deposits, an expansive merchant fleet, accessible water transport systems, and significant capital accumulation. Innovations such as James Watt&apos;s refined steam engine and James Hargreaves&apos; spinning jenny drastically accelerated manufacturing output.
        </p>

        <h2 className="text-lg font-semibold text-slate-800 mt-6 mb-2">2. Social Transformations & Urbanization</h2>
        <p className="mb-4">
          Rural laborers migrated in unprecedented volumes toward industrial epicenters including Manchester and Birmingham. The resulting demographic shift gave rise to new urban landscapes, the emergence of a prominent middle class (bourgeoisie), and an extensive working class (proletariat) that negotiated workplace safety and labor regulations.
        </p>

        <h2 className="text-lg font-semibold text-slate-800 mt-6 mb-2">3. Key Review Questions</h2>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>How did the enclosure acts affect agricultural productivity and factory labor supply?</li>
          <li>Contrast the economic principles outlined by Adam Smith with subsequent critiques from trade unions.</li>
          <li>Analyze the environmental ramifications of early blast furnaces and coal-powered steam infrastructure.</li>
        </ul>
      </main>
    </div>
  );
};
