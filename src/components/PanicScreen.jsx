import React, { useEffect } from 'react';
import { Eye, FileText, CheckCircle2 } from 'lucide-react';

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
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded transition"
          title="Return to Niko's Network"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Resume Session</span>
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
