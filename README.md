# Social Trading Platform

This is a social trading platform that allows users to share their trading activities and insights with other traders. The application is built with React, TypeScript, and Vite, with authentication provided by Privy.

## Features

- **Authentication**: Sign in with email, wallet, or social accounts using Privy
- **Social Feed**: View and interact with trading posts from other users
- **Portfolio Management**: Track your trading performance
- **Trading Integration**: Share your trades directly from the platform
- **User Profiles**: Personalized profiles showing trading history and performance

## Authentication

This application uses [Privy](https://privy.io/) for authentication, allowing users to sign in with:

- Email
- Crypto wallets (MetaMask, WalletConnect, etc.)
- Social accounts (Google, Twitter, Discord)

For more details on the Privy integration, see the [Privy Integration Documentation](./docs/PRIVY_INTEGRATION.md).

## Running the code

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Configuration

Create a `.env` file in the root directory with your Privy App ID (you can copy from `.env.example`):

```
VITE_PRIVY_APP_ID=your-privy-app-id
```

> **Note**: In Vite, all environment variables must be prefixed with `VITE_` to be exposed to the client-side code.

### Development

```bash
# Start the development server
npm run dev
```

### Build

```bash
# Build for production
npm run build
```

## Project Structure

- `src/` - Source code
  - `components/` - React components
    - `pages/` - Page components
    - `ui/` - Reusable UI components
  - `contexts/` - React contexts including AuthContext
  - `hooks/` - Custom React hooks
  - `config/` - Configuration files

## Protected Features

The following features require authentication:

- Portfolio page
- Trade page
- Profile page
- Creating posts

## Original Design

The original Figma design is available at: https://www.figma.com/design/6Xhp3uVXQHdgrFg0LfMtHO/Social-trading-is-bs-.