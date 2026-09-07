import React from 'react';
import { RotateCcw, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Niko's Nightclub Exception Caught:", error, errorInfo);
  }

  handleSoftResume = () => {
    this.setState({ hasError: false, error: null });
  };

  handleHardReset = () => {
    try {
      localStorage.removeItem('niko_custom_games');
      localStorage.removeItem('niko_favorites');
    } catch (e) {
      console.error(e);
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleFastReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07040d] text-white flex flex-col items-center justify-center p-4 selection:bg-[#ff007f] font-mono">
          <div className="max-w-md w-full bg-[#140b29] border-4 border-black pixel-shadow-magenta p-6 text-center">
            <div className="w-16 h-16 bg-red-600 border-2 border-black pixel-shadow-black flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>

            <h1 className="font-arcade text-base text-pink-400 mb-2 tracking-wider">
              ARCADE SAFETY RECOVERY
            </h1>
            <p className="font-terminal text-lg text-slate-300 mb-4">
              Niko&apos;s Nightclub caught an interruption before it could blank out. Choose a recovery option:
            </p>

            <div className="bg-black border border-red-500/50 p-3 mb-5 text-left overflow-x-auto">
              <p className="text-red-400 text-xs font-mono">
                {this.state.error?.message || 'Unknown runtime error'}
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={this.handleSoftResume}
                className="arcade-btn w-full py-2.5 bg-[#00f0ff] hover:bg-cyan-400 text-black font-arcade text-xs font-bold border-2 border-black pixel-shadow-black flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>QUICK RESUME ARCADE</span>
              </button>

              <button
                onClick={this.handleFastReload}
                className="arcade-btn w-full py-2.5 bg-[#ffe600] hover:bg-yellow-400 text-black font-arcade text-xs font-bold border-2 border-black pixel-shadow-black flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4 text-black stroke-[3]" />
                <span>RELOAD BROWSER</span>
              </button>

              <button
                onClick={this.handleHardReset}
                className="arcade-btn w-full py-2.5 bg-[#ff007f] hover:bg-pink-600 text-white font-arcade text-xs font-bold border-2 border-black pixel-shadow-black flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-white stroke-[3]" />
                <span>CLEAR CACHE & REBOOT</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

