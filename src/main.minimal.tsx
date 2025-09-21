import React from "react";
import { createRoot } from "react-dom/client";
import { PrivyProvider } from "@privy-io/react-auth";
import App from "./App.tsx";
import "./index.css";

// Privy App ID
const PRIVY_APP_ID = "cmd9y0aeh00a9l10n8kx5klqu";

// Get the root element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Create a root
const root = createRoot(rootElement);

// Render the app with Privy provider
root.render(
  <React.StrictMode>
    <PrivyProvider appId={PRIVY_APP_ID}>
      <App />
    </PrivyProvider>
  </React.StrictMode>
);
