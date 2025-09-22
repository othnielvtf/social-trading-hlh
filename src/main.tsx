import React from "react";
import { createRoot } from "react-dom/client";
import { PrivyProvider } from "@privy-io/react-auth";
import App from "./App.tsx";
import "./index.css";
// src/main.tsx (top of file)
import { Buffer } from 'buffer';

// Polyfill Node globals for browser
if (!(window as any).global) (window as any).global = window;
if (!(window as any).Buffer) (window as any).Buffer = Buffer;

// Privy App ID - in a real app, this would come from environment variables
const PRIVY_APP_ID = "cmd9y0aeh00a9l10n8kx5klqu";

// Get the root element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Create a root
const root = createRoot(rootElement);

// Render the app with Privy provider
// Note: The PrivyAuthProvider is inside App.tsx, so we only need the base PrivyProvider here
root.render(
  <React.StrictMode>
    {/* @ts-ignore - Ignoring type error for the children prop */}
    <PrivyProvider appId={PRIVY_APP_ID}>
      <App />
    </PrivyProvider>
  </React.StrictMode>
);
