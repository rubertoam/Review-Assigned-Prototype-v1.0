
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "@ace-ds/styles/variables.css";
import "@ace-ds/styles/typography-tokens.css";
import "@ace-ds/styles/toggle.css";
import "./styles/index.css";

class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { error: unknown }
> {
  state = { error: null as unknown };
  static getDerivedStateFromError(error: unknown) {
    return { error };
  }
  componentDidCatch(error: unknown) {
    // Surface runtime crashes in the terminal + browser console.
    // eslint-disable-next-line no-console
    console.error("Render crashed:", error);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}>
          <h1 style={{ margin: 0, fontSize: 18 }}>App crashed</h1>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {String(
              this.state.error instanceof Error
                ? this.state.error.stack ?? this.state.error.message
                : this.state.error
            )}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error('Missing "#root" element');

createRoot(rootEl).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
  