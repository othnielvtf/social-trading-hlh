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

---

# STIBS Overview (Social Trading is BS?)

Gmgm — I’m Othniel, tech lead at STIBS (short for “Social trading is bs?”). We’re integrating Hyperliquid builder codes into a Twitter-like platform. Think: Hypercore meets Twitter — social + trading in one onchain place.

## Problem

- Trading for retail is either too isolated or too noisy/scattered on Twitter/X.
- Twitter helps share ideas, but lacks transparency — you can’t tell who is actually profitable vs. larping.
- Social trading is exploding, but there’s no truly on-chain-native product that combines execution + social discovery.
- Following traders today requires hopping across Telegram, Discord, X — and you still can’t see their real positions in real time.
- Copy-trading platforms exist, but they lack a social layer and verifiable on-chain performance.

## Solution

An on-chain social trading network natively on Hyperliquid:

- Every trade is content. Trades auto-post as they execute, and users can add commentary.
- X-style Home Feed with “For You,” “Friends,” and on-chain/curated feeds.
- Communities and leaderboards to discover and compete.
- Real execution via Hyperliquid Builder Codes — no screenshots, no LARP.

Users can:

- Trade with friends and communities.
- Follow top on-chain traders with verifiable track records.
- Share trades and strategies like posts on Twitter, with on-chain proof.
- Discover what’s hot in real time.

## Benefits

- Transparency → No fake screenshots; every PnL and stat is on-chain and verifiable.
- Community → Trade alongside friends, join strategy groups, learn from top performers.
- Discovery → Leaderboards + “Who to follow” surface profitable, active traders; reputation and talent discovery emerge naturally.
- Social Layer → Like Twitter, but trading-native: share positions, wins, and ideas directly.
- Learning by doing → New traders learn from top performers while actively trading.

## Product Walkthrough

- Home Feed
  - Tabs: For You, Friends, On-chain, Community (curated or specific group feeds)
  - Every trade auto-posts on execution; users add commentary so trades become content
- Explore
  - Leaderboards of friends and global traders
  - “Who to follow” to discover active/profitable traders
- Portfolio
  - Manage balances and view a live, on-chain summary
  - Your Trades: entry price, mid-based live PnL%, historic PnL where available
- Trade
  - Full trading terminal powered by Hyperliquid Builder Codes
- Profile
  - Posts + on-chain stats and history for every trader (win rate, PnL, volume)
- Post Button
  - Share trades and insights instantly
- Right Sidebar
  - Top Traders Today, Top Volume Markets, Who to Follow

## Why this is only possible on Hyperliquid

- Builder Codes → Unique to Hyperliquid. They let us integrate real trading execution directly in the app.
- Performance → Low latency and low fees make frequent, social-driven trading practical.
- Transparency → Every trade and leaderboard stat is on-chain and verifiable.
- Community Alignment → Hyperliquid is built around decentralization and openness; it’s the perfect backbone for a social trading layer.
- Liquidity Depth → Real, unified depth for on-chain trading. No CEX or other chain offers this full package.

Hyperliquid is the only foundation that makes true social trading on-chain possible.

## TL;DR

We’re building the X (Twitter) of trading: social, transparent, and fun.

- X for trading — every position, every trade, every idea is instant social.
- Still a trading platform (HL FE) with social and discovery on top.
- For users → learn faster by watching real trades, not just opinions.
- For traders → build reputation, grow a following, monetize attention and edge.
- For communities → verifiable track record; no guessing who’s worth following.
- For the ecosystem → every trade becomes content → more engagement → trading becomes helpful and enjoyable.