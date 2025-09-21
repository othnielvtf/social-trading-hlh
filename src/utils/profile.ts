import { UserData } from './firestore';

// Define which fields are required for a "complete" profile
// Adjust this list as desired
const REQUIRED_FIELDS: (keyof UserData)[] = [
  'name',
  'username',
  // Optional fields to enforce now or later:
  // 'avatar',
  // 'bio',
  // 'location',
  // 'website',
];

export function isUserProfileComplete(user: UserData | null | undefined): boolean {
  if (!user) return false;
  for (const key of REQUIRED_FIELDS) {
    const val = user[key];
    if (val === undefined || val === null) return false;
    if (typeof val === 'string' && val.trim().length === 0) return false;
  }
  return true;
}
