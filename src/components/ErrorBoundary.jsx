import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Arcade System Exception Caught:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('niko_custom_games');
      localStorage.removeItem('niko_favorites');
    } catch (e) {
      console.error(e);
    }
    this.setState({ hasError: false, error: null });
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
              ARCADE HARDWARE GLITCH
            </h1>
            <p className="font-terminal text-lg text-slate-300 mb-4">
              Niko&apos;s Network encountered an unexpected glitch. Don&apos;t worry, no high scores were harmed!
            </p>

            <div className="bg-black border border-red-500/50 p-3 mb-6 text-left overflow-x-auto">
              <p className="text-red-400 text-xs font-mono">
                {this.state.error?.message || 'Unknown runtime error'}
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="arcade-btn w-full py-3 bg-[#39ff14] hover:bg-green-400 text-black font-arcade text-xs font-bold border-2 border-black pixel-shadow-black flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-black stroke-[3]" />
              <span>REBOOT ARCADE SYSTEM</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
