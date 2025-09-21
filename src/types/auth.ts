/**
 * Common types for authentication
 */

// User profile information
export interface UserProfile {
  id: string;
  address?: string;
  email?: string;
  name?: string;
  avatar?: string;
  isAuthenticated: boolean;
}
