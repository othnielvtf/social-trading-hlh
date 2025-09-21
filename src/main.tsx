import { createRoot } from "react-dom/client";
import { PrivyProvider } from "@privy-io/react-auth";
import App from "./App.tsx";
import "./index.css";
import { privyConfig } from "./config/privy";

createRoot(document.getElementById("root")!).render(
  <PrivyProvider
    appId={privyConfig.appId}
    config={{
      loginMethods: privyConfig.loginMethods,
      appearance: privyConfig.appearance,
      embeddedWallets: privyConfig.embeddedWallets,
    }}
  >
    <App />
  </PrivyProvider>
);