"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Component-level Error Boundary for HinduPanchangWidget.
 * Catches errors localized to the widget and provides an inline reload card.
 */
export class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[WidgetErrorBoundary Captured]:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-4xl mx-auto my-4 p-8 rounded-3xl bg-[#090e1a]/95 border border-[#1a2542] text-center shadow-2xl backdrop-blur-xl">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl select-none">🕉️</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Panchang Widget Momentarily Interrupted
          </h3>
          <p className="text-xs text-neutral-400 mb-5 max-w-md mx-auto">
            The live astronomical calculations hit an unexpected timing exception. Click below to re-initialize the live widget.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={this.handleReload}
              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-lg shadow-orange-950/40"
            >
              Reload Widget
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') window.location.reload();
              }}
              className="px-5 py-2 rounded-xl bg-[#11192e] hover:bg-[#18233f] border border-[#233152] text-neutral-300 text-xs font-medium transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
