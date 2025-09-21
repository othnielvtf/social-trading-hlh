import { useEffect, useState } from 'react';
import { usePrivyAuth } from '../contexts/PrivyAuthContext';
import { getUser, createOrUpdateUser, UserData } from '../utils/firestore';

/**
 * Custom hook that combines Privy authentication with Firestore user data
 */
export const useFirestoreAuth = () => {
  const { isLoading: isPrivyLoading, isAuthenticated, user: privyUser, ...privyAuth } = usePrivyAuth();
  const [firestoreUser, setFirestoreUser] = useState<UserData | null>(null);
  const [isLoadingFirestore, setIsLoadingFirestore] = useState(false);

  // Sync Privy user with Firestore
  useEffect(() => {
    const syncUserWithFirestore = async () => {
      if (!isAuthenticated || !privyUser?.id) return;
      
      setIsLoadingFirestore(true);
      
      try {
        // Try to get existing user from Firestore
        const userData = await getUser(privyUser.id);
        
        if (userData) {
          // User exists in Firestore
          setFirestoreUser(userData);
        } else {
          // Create new user in Firestore with blank fields, pregenerated username,
          // and a Gravatar default identicon as avatar
          const gravatarDefault = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&s=120';
          const randomId = Math.random().toString(36).substring(2, 10); // 8-char alphanumeric
          const newUserData: Partial<UserData> = {
            name: '',
            username: `user_${randomId}`,
            avatar: gravatarDefault,
            bio: '',
            location: '',
            website: '',
          };
          
          const success = await createOrUpdateUser(privyUser.id, newUserData);
          
          if (success) {
            // Fetch the newly created user
            const createdUser = await getUser(privyUser.id);
            setFirestoreUser(createdUser);
          }
        }
      } catch (error) {
        console.error('Error syncing user with Firestore:', error);
      } finally {
        setIsLoadingFirestore(false);
      }
    };
    
    syncUserWithFirestore();
  }, [isAuthenticated, privyUser]);
  
  // Update Firestore user profile
  const updateProfile = async (updates: Partial<UserData>): Promise<boolean> => {
    if (!isAuthenticated || !privyUser?.id) return false;
    
    try {
      const success = await createOrUpdateUser(privyUser.id, updates);
      
      if (success && firestoreUser) {
        // Update local state
        setFirestoreUser({
          ...firestoreUser,
          ...updates
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  };
  
  return {
    isLoading: isPrivyLoading || isLoadingFirestore,
    isAuthenticated,
    privyUser,
    user: firestoreUser,
    updateProfile,
    ...privyAuth
  };
};

export default useFirestoreAuth;
