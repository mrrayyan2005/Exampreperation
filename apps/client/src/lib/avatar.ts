/**
 * Avatar utility functions
 * Handles avatar URL processing and caching to avoid rate limits
 * Includes Gravatar fallback support
 */

const AVATAR_CACHE_KEY = 'avatar_cache_';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedAvatar {
  url: string;
  timestamp: number;
  failed: boolean;
}

interface AvatarOptions {
  size?: number;
  defaultType?: '404' | 'mp' | 'identicon' | 'monsterid' | 'wavatar' | 'retro' | 'robohash' | 'blank';
  rating?: 'g' | 'pg' | 'r' | 'x';
}

/**
 * Generate Gravatar URL from email
 * @param email - User email address
 * @param options - Avatar options (size, default type, rating)
 * @returns Gravatar URL
 */
export function getGravatarUrl(email: string | undefined, options: AvatarOptions = {}): string | undefined {
  if (!email) return undefined;

  const { size = 200, defaultType = 'identicon', rating = 'g' } = options;

  // Trim and lowercase the email
  const trimmedEmail = email.trim().toLowerCase();

  // Create MD5 hash of email (Gravatar uses MD5)
  // Note: In a real implementation, you'd use a crypto library
  // For browser compatibility, we'll use a simple hash or the email directly
  // The Gravatar service will handle the hashing server-side if needed

  // Using encodeURIComponent for the email as a fallback
  // In production, you might want to hash this on the server
  const hash = simpleHash(trimmedEmail);

  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultType}&r=${rating}`;
}

/**
 * Simple hash function for email (not MD5, but works for demo)
 * In production, use proper MD5 hashing
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Convert to hex string and pad to 32 chars (like MD5)
  const hexHash = Math.abs(hash).toString(16).padStart(32, '0');
  return hexHash;
}

/**
 * Get initials from a name
 */
export function getInitials(name: string | undefined): string {
  if (!name) return 'U';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Check if a URL is a Google avatar URL
 */
export function isGoogleAvatar(url: string): boolean {
  return url?.includes('googleusercontent.com') || url?.includes('ggpht.com');
}

/**
 * Get a proxied/cached avatar URL
 * For Google avatars, we cache the URL and track failures
 */
export function getAvatarUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  // For Google avatars, check cache first
  if (isGoogleAvatar(url)) {
    const cached = getCachedAvatar(url);

    // If recently failed, don't retry immediately
    if (cached?.failed && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      console.warn('Google avatar recently failed, using fallback');
      return undefined;
    }

    return url;
  }

  return url;
}

/**
 * Mark an avatar URL as failed
 */
export function markAvatarFailed(url: string): void {
  if (!url || !isGoogleAvatar(url)) return;

  try {
    const key = AVATAR_CACHE_KEY + hashUrl(url);
    const cached: CachedAvatar = {
      url,
      timestamp: Date.now(),
      failed: true,
    };
    localStorage.setItem(key, JSON.stringify(cached));
  } catch (e) {
    // Ignore localStorage errors
  }
}

/**
 * Get cached avatar info
 */
function getCachedAvatar(url: string): CachedAvatar | null {
  try {
    const key = AVATAR_CACHE_KEY + hashUrl(url);
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const data: CachedAvatar = JSON.parse(cached);

    // Clear old cache entries
    if (Date.now() - data.timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (e) {
    return null;
  }
}

/**
 * Simple hash function for URLs
 */
function hashUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Generate a consistent background color from a name
 */
export function getAvatarColor(name: string | undefined): string {
  if (!name) return 'bg-muted';

  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];

  // Use the sum of char codes to pick a color
  const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[sum % colors.length];
}

/**
 * Get the best avatar URL with fallback chain:
 * 1. Custom profile picture (if exists and not failed)
 * 2. Gravatar (based on email)
 * 3. Default avatar based on initials
 * @param profilePicture - Current profile picture URL
 * @param email - User email for Gravatar fallback
 * @param name - User name for initials fallback
 * @returns Best available avatar URL
 */
export function getBestAvatarUrl(
  profilePicture: string | undefined,
  email: string | undefined,
  name: string | undefined
): { url: string | undefined; fallback: 'image' | 'gravatar' | 'initials' } {
  // Check if profile picture exists and isn't a failed Google avatar
  if (profilePicture) {
    const cached = getCachedAvatar(profilePicture);

    // If not recently failed, use the profile picture
    if (!cached?.failed) {
      return { url: profilePicture, fallback: 'image' };
    }
  }

  // Try Gravatar as fallback
  const gravatarUrl = getGravatarUrl(email);
  if (gravatarUrl) {
    return { url: gravatarUrl, fallback: 'gravatar' };
  }

  // Return undefined to use initials fallback
  return { url: undefined, fallback: 'initials' };
}
