import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b1114] text-white p-8 flex flex-col items-center justify-center">
          <div className="max-w-2xl bg-red-500/10 border border-red-500/30 p-8 rounded-2xl shadow-2xl">
            <h1 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
              Something went wrong
            </h1>
            <pre className="text-sm text-red-300 overflow-auto whitespace-pre-wrap p-4 bg-black/50 rounded-lg border border-red-500/20">
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-6 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
