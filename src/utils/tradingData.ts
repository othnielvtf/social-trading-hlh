import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { TradePosition, UserData } from './firestore';

// Mock data conversion functions to gradually migrate from mock data to Firestore

// Convert Firestore user data to the format expected by the UI
export const convertFirestoreUserToUIUser = (firestoreUser: UserData) => {
  return {
    name: firestoreUser.name,
    username: firestoreUser.username,
    avatar: firestoreUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
    bio: firestoreUser.bio || '',
    location: firestoreUser.location || '',
    website: firestoreUser.website || '',
    joinDate: firestoreUser.joinDate ? new Date(firestoreUser.joinDate.seconds * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown',
    followers: firestoreUser.followers || 0,
    following: firestoreUser.following || 0,
    totalPnL: firestoreUser.totalPnL || 0,
    totalPnLPercent: firestoreUser.totalPnLPercent || 0,
    winRate: firestoreUser.winRate || 0,
    totalTrades: firestoreUser.totalTrades || 0,
    isFollowing: false // This will be updated based on the current user's following status
  };
};

// Convert Firestore position data to the format expected by the UI
export const convertFirestorePositionToUIPosition = (position: TradePosition) => {
  const isOpen = position.status === 'open';
  
  return {
    id: position.id || '',
    symbol: position.symbol,
    name: position.name,
    type: position.type,
    amount: position.amount.toString(),
    value: isOpen 
      ? ((position.currentPrice || position.openPrice) * position.amount).toFixed(2)
      : ((position.closeDate ? position.currentPrice : position.openPrice) || 0 * position.amount).toFixed(2),
    pnl: position.pnl || 0,
    pnlPercent: position.pnlPercent || 0,
    timestamp: isOpen
      ? `Opened ${new Date(position.openDate.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${new Date(position.openDate.seconds * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}`
      : `Closed ${new Date((position.closeDate || position.openDate).seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${new Date((position.closeDate || position.openDate).seconds * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}`
  };
};

// Functions to update trading statistics

// Update user's trading statistics when a position is closed
export const updateUserTradingStats = async (userId: string, pnl: number, pnlPercent: number, isWin: boolean): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error(`User ${userId} not found`);
      return false;
    }
    
    const userData = userDoc.data() as UserData;
    const totalTrades = (userData.totalTrades || 0) + 1;
    const wins = isWin ? ((userData.winRate || 0) * (userData.totalTrades || 0) / 100 + 1) : ((userData.winRate || 0) * (userData.totalTrades || 0) / 100);
    const newWinRate = (wins / totalTrades) * 100;
    
    const newTotalPnL = (userData.totalPnL || 0) + pnl;
    const newTotalPnLPercent = (userData.totalPnLPercent || 0) + pnlPercent;
    
    await updateDoc(userRef, {
      totalPnL: newTotalPnL,
      totalPnLPercent: newTotalPnLPercent,
      winRate: newWinRate,
      totalTrades: totalTrades
    });
    
    return true;
  } catch (error) {
    console.error(`Error updating trading stats for user ${userId}:`, error);
    return false;
  }
};

// Get trading statistics for a user
export const getUserTradingStats = async (userId: string) => {
  try {
    // Get user data
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error(`User ${userId} not found`);
      return null;
    }
    
    const userData = userDoc.data() as UserData;
    
    // Get positions data
    const positionsRef = collection(db, 'positions');
    const q = query(
      positionsRef,
      where('userId', '==', userId),
      where('status', '==', 'closed'),
      orderBy('pnl', 'desc'),
      limit(1)
    );
    
    const bestTradeSnapshot = await getDocs(q);
    let bestTrade: TradePosition | null = null;
    
    if (!bestTradeSnapshot.empty) {
      const bestTradeDoc = bestTradeSnapshot.docs[0];
      bestTrade = { ...bestTradeDoc.data(), id: bestTradeDoc.id } as TradePosition;
    }
    
    const worstTradeQuery = query(
      positionsRef,
      where('userId', '==', userId),
      where('status', '==', 'closed'),
      orderBy('pnl', 'asc'),
      limit(1)
    );
    
    const worstTradeSnapshot = await getDocs(worstTradeQuery);
    let worstTrade: TradePosition | null = null;
    
    if (!worstTradeSnapshot.empty) {
      const worstTradeDoc = worstTradeSnapshot.docs[0];
      worstTrade = { ...worstTradeDoc.data(), id: worstTradeDoc.id } as TradePosition;
    }
    
    // Calculate average trade size
    const allTradesQuery = query(
      positionsRef,
      where('userId', '==', userId)
    );
    
    const allTradesSnapshot = await getDocs(allTradesQuery);
    let totalTradeSize = 0;
    let tradeCount = 0;
    
    allTradesSnapshot.forEach(doc => {
      const trade = doc.data() as TradePosition;
      totalTradeSize += trade.amount * trade.openPrice;
      tradeCount++;
    });
    
    const avgTradeSize = tradeCount > 0 ? totalTradeSize / tradeCount : 0;
    
    // Calculate profit factor (total gains / total losses)
    let totalGains = 0;
    let totalLosses = 0;
    
    allTradesSnapshot.forEach(doc => {
      const trade = doc.data() as TradePosition;
      if (trade.status === 'closed' && trade.pnl) {
        if (trade.pnl > 0) {
          totalGains += trade.pnl;
        } else {
          totalLosses += Math.abs(trade.pnl);
        }
      }
    });
    
    const profitFactor = totalLosses > 0 ? totalGains / totalLosses : totalGains > 0 ? Infinity : 0;
    
    // Define types for best and worst trades
    type TradeSummary = {
      symbol: string;
      pnl: number;
      pnlPercent: number;
    } | null;

    // Create best trade summary if available
    const bestTradeSummary: TradeSummary = bestTrade ? {
      symbol: bestTrade.symbol,
      pnl: bestTrade.pnl || 0,
      pnlPercent: bestTrade.pnlPercent || 0
    } : null;

    // Create worst trade summary if available
    const worstTradeSummary: TradeSummary = worstTrade ? {
      symbol: worstTrade.symbol,
      pnl: worstTrade.pnl || 0,
      pnlPercent: worstTrade.pnlPercent || 0
    } : null;

    return {
      totalPnL: userData.totalPnL || 0,
      totalPnLPercent: userData.totalPnLPercent || 0,
      winRate: userData.winRate || 0,
      totalTrades: userData.totalTrades || 0,
      bestTrade: bestTradeSummary,
      worstTrade: worstTradeSummary,
      avgTradeSize,
      profitFactor: profitFactor.toFixed(2)
    };
  } catch (error) {
    console.error(`Error getting trading stats for user ${userId}:`, error);
    return null;
  }
};
