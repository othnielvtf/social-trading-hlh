import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit as limitQuery,
  serverTimestamp,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Types
export type Post = {
  id?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp?: Timestamp;
  likes?: number;
  comments?: number;
  trade?: {
    symbol: string;
    type: 'long' | 'short';
    // Optional manual entry fields
    entry?: number; // price user entered
    size?: number;  // optional size/amount
    // Legacy/optional PnL fields
    pnl?: number;
    pnlPercent?: number;
  };
};


export type UserData = {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinDate: Timestamp;
  followers: number;
  following: number;
  totalPnL: number;
  totalPnLPercent: number;
  winRate: number;
  totalTrades: number;
};

export type TradePosition = {
  id?: string;
  userId: string;
  symbol: string;
  name: string;
  type: 'long' | 'short';
  amount: number;
  openPrice: number;
  currentPrice?: number;
  openDate: Timestamp;
  closeDate?: Timestamp;
  pnl?: number;
  pnlPercent?: number;
  status: 'open' | 'closed';
};

// Helper: remove undefined fields to satisfy Firestore constraints
function pruneUndefined<T extends Record<string, any>>(obj: T): T {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) out[key] = value;
  }
  return out as T;
}

// Posts
export const getPosts = async (limit = 20): Promise<Post[]> => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('timestamp', 'desc'), limitQuery(limit));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Post));
  } catch (error) {
    console.error("Error getting posts:", error);
    return [];
  }
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('userId', '==', userId), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Post));
  } catch (error) {
    console.error(`Error getting posts for user ${userId}:`, error);
    return [];
  }
};

export const createPost = async (post: Omit<Post, 'timestamp'>): Promise<string | null> => {
  try {
    const postsRef = collection(db, 'posts');
    const newPost = pruneUndefined({
      ...post,
      timestamp: serverTimestamp(),
      likes: 0,
      comments: 0
    });
    
    const docRef = await addDoc(postsRef, newPost);
    return docRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    return null;
  }
};

// Users
export const getUser = async (userId: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as UserData;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting user ${userId}:`, error);
    return null;
  }
};

export const createOrUpdateUser = async (userId: string, userData: Partial<UserData>): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Update existing user
      await updateDoc(userRef, pruneUndefined(userData as Record<string, any>));
    } else {
      // Create new user with default values
      const defaultData: Partial<UserData> = {
        name: 'Anonymous User',
        username: `user_${userId.substring(0, 8)}`,
        joinDate: Timestamp.now(),
        followers: 0,
        following: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
        winRate: 0,
        totalTrades: 0
      };
      
      const payload = pruneUndefined({ ...defaultData, ...userData } as Record<string, any>);
      await setDoc(userRef, payload, { merge: true });
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    return false;
  }
};

// List all users (optionally limited)
export const getAllUsers = async (max = 50): Promise<UserData[]> => {
  try {
    const usersRef = collection(db, 'users');
    const qUsers = query(usersRef, limitQuery(max));
    const querySnapshot = await getDocs(qUsers);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Trading Positions
export const getOpenPositions = async (userId: string): Promise<TradePosition[]> => {
  try {
    const positionsRef = collection(db, 'positions');
    const q = query(
      positionsRef, 
      where('userId', '==', userId),
      where('status', '==', 'open'),
      orderBy('openDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TradePosition));
  } catch (error) {
    console.error(`Error getting open positions for user ${userId}:`, error);
    return [];
  }
};

export const getClosedPositions = async (userId: string, max = 20): Promise<TradePosition[]> => {
  try {
    const positionsRef = collection(db, 'positions');
    const q = query(
      positionsRef, 
      where('userId', '==', userId),
      where('status', '==', 'closed'),
      orderBy('closeDate', 'desc'),
      limitQuery(max)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TradePosition));
  } catch (error) {
    console.error(`Error getting closed positions for user ${userId}:`, error);
    return [];
  }
};

export const createPosition = async (position: Omit<TradePosition, 'id'>): Promise<string | null> => {
  try {
    const positionsRef = collection(db, 'positions');
    const docRef = await addDoc(positionsRef, pruneUndefined(position as Record<string, any>));
    return docRef.id;
  } catch (error) {
    console.error("Error creating position:", error);
    return null;
  }
};

export const closePosition = async (positionId: string, closePrice: number): Promise<boolean> => {
  try {
    const positionRef = doc(db, 'positions', positionId);
    const positionDoc = await getDoc(positionRef);
    
    if (!positionDoc.exists()) {
      console.error(`Position ${positionId} not found`);
      return false;
    }
    
    const position = positionDoc.data() as TradePosition;
    const pnl = position.type === 'long' 
      ? (closePrice - position.openPrice) * position.amount
      : (position.openPrice - closePrice) * position.amount;
      
    const pnlPercent = (pnl / (position.openPrice * position.amount)) * 100;
    
    await updateDoc(positionRef, {
      status: 'closed',
      closeDate: serverTimestamp(),
      currentPrice: closePrice,
      pnl,
      pnlPercent
    });
    
    return true;
  } catch (error) {
    console.error(`Error closing position ${positionId}:`, error);
    return false;
  }
};

// Following relationships
export const followUser = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    const followRef = doc(db, 'follows', `${followerId}_${followingId}`);
    await setDoc(followRef, {
      followerId,
      followingId,
      timestamp: serverTimestamp()
    }, { merge: true });
    
    // Update follower/following counts
    const followerRef = doc(db, 'users', followerId);
    const followingRef = doc(db, 'users', followingId);
    
    const followerDoc = await getDoc(followerRef);
    const followingDoc = await getDoc(followingRef);
    
    if (followerDoc.exists()) {
      await updateDoc(followerRef, {
        following: (followerDoc.data().following || 0) + 1
      });
    }
    
    if (followingDoc.exists()) {
      await updateDoc(followingRef, {
        followers: (followingDoc.data().followers || 0) + 1
      });
    }
    
    return true;
  } catch (error) {
    console.error(`Error following user ${followingId}:`, error);
    return false;
  }
};

export const unfollowUser = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    const followRef = doc(db, 'follows', `${followerId}_${followingId}`);
    await deleteDoc(followRef);
    
    // Update follower/following counts
    const followerRef = doc(db, 'users', followerId);
    const followingRef = doc(db, 'users', followingId);
    
    const followerDoc = await getDoc(followerRef);
    const followingDoc = await getDoc(followingRef);
    
    if (followerDoc.exists() && followerDoc.data().following > 0) {
      await updateDoc(followerRef, {
        following: followerDoc.data().following - 1
      });
    }
    
    if (followingDoc.exists() && followingDoc.data().followers > 0) {
      await updateDoc(followingRef, {
        followers: followingDoc.data().followers - 1
      });
    }
    
    return true;
  } catch (error) {
    console.error(`Error unfollowing user ${followingId}:`, error);
    return false;
  }
};

export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    const followRef = doc(db, 'follows', `${followerId}_${followingId}`);
    const followDoc = await getDoc(followRef);
    
    return followDoc.exists();
  } catch (error) {
    console.error(`Error checking follow status for ${followerId} -> ${followingId}:`, error);
    return false;
  }
};
