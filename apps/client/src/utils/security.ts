/**
 * Security Utilities
 * 
 * XSS prevention, input sanitization, and secure storage
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * 
 * Usage:
 * const clean = sanitizeHtml(userInput);
 * <div dangerouslySetInnerHTML={{ __html: clean }} />
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') return dirty;
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 'del',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'img',
      'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'class', 'id'
    ],
    ALLOW_DATA_ATTR: false,
    SANITIZE_DOM: true,
  });
}

/**
 * Sanitize plain text - removes all HTML
 * 
 * Usage:
 * const clean = sanitizeText(userInput);
 */
export function sanitizeText(dirty: string): string {
  if (typeof window === 'undefined') return dirty;
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Validate and sanitize URL
 * 
 * Usage:
 * const safeUrl = sanitizeUrl(userUrl);
 * if (safeUrl) { window.location.href = safeUrl; }
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url, window.location.origin);
    
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Escape HTML special characters
 * 
 * Usage:
 * const escaped = escapeHtml(userInput);
 * <div>{escaped}</div> // Safe to render as text
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Secure localStorage wrapper with encryption hints
 * 
 * Usage:
 * secureStorage.setItem('token', userToken);
 * const token = secureStorage.getItem('token');
 */
export const secureStorage = {
  setItem(key: string, value: string): void {
    try {
      // Add timestamp for TTL support
      const data = {
        value,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // localStorage not available or full
    }
  },

  getItem(key: string, maxAge?: number): string | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const data = JSON.parse(item);
      
      // Check TTL if specified
      if (maxAge && Date.now() - data.timestamp > maxAge) {
        localStorage.removeItem(key);
        return null;
      }

      return data.value;
    } catch {
      return null;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // localStorage not available
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch {
      // localStorage not available
    }
  },
};

/**
 * Rate limiter for API calls
 * 
 * Usage:
 * const limiter = createRateLimiter(5, 60000); // 5 calls per minute
 * if (limiter.canProceed()) { makeApiCall(); }
 */
export function createRateLimiter(maxCalls: number, windowMs: number) {
  const calls: number[] = [];

  return {
    canProceed(): boolean {
      const now = Date.now();
      // Remove old calls outside the window
      while (calls.length > 0 && calls[0] < now - windowMs) {
        calls.shift();
      }
      
      if (calls.length < maxCalls) {
        calls.push(now);
        return true;
      }
      
      return false;
    },
    
    getRemaining(): number {
      const now = Date.now();
      while (calls.length > 0 && calls[0] < now - windowMs) {
        calls.shift();
      }
      return Math.max(0, maxCalls - calls.length);
    },
    
    getResetTime(): number {
      if (calls.length === 0) return 0;
      return calls[0] + windowMs;
    },
  };
}

/**
 * Detect and prevent clickjacking
 * 
 * Usage in useEffect:
 * useEffect(() => { preventClickjacking(); }, []);
 */
export function preventClickjacking(): void {
  if (typeof window === 'undefined') return;
  
  // Check if page is in an iframe
  if (window.top !== window.self) {
    // Option 1: Break out of iframe
    window.top.location.href = window.self.location.href;
    
    // Option 2: Show warning (if breaking out isn't desired)
    // console.warn('Page is being framed - potential clickjacking attack');
  }
}

/**
 * Generate secure random token
 * 
 * Usage:
 * const csrfToken = generateSecureToken(32);
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash string using SHA-256
 * 
 * Usage:
 * const hash = await sha256('sensitive data');
 */
export async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}