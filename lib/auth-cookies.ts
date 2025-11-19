/**
 * Cookie utility functions for authentication
 * These will be replaced by HTTP-only cookies from backend in production
 */

export interface CookieOptions {
  days?: number;
  path?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set a cookie
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  const {
    days = 30,
    path = '/',
    secure = false,
    sameSite = 'lax'
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    cookieString += `; expires=${date.toUTCString()}`;
  }
  
  cookieString += `; path=${path}`;
  cookieString += `; SameSite=${sameSite}`;
  
  if (secure) {
    cookieString += '; Secure';
  }

  document.cookie = cookieString;
}

/**
 * Get a cookie value
 */
export function getCookie(name: string): string | null {
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }
  
  return null;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string, path: string = '/'): void {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
}

/**
 * Check if a cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

/**
 * Set executive session
 */
export function setExecutiveSession(data: any): void {
  setCookie('executive-session', JSON.stringify(data), { days: 30 });
}

/**
 * Get executive session
 */
export function getExecutiveSession(): any | null {
  const session = getCookie('executive-session');
  return session ? JSON.parse(session) : null;
}

/**
 * Clear executive session
 */
export function clearExecutiveSession(): void {
  deleteCookie('executive-session');
}

/**
 * Set member session
 */
export function setMemberSession(data: any): void {
  setCookie('member-session', JSON.stringify(data), { days: 30 });
}

/**
 * Get member session
 */
export function getMemberSession(): any | null {
  const session = getCookie('member-session');
  return session ? JSON.parse(session) : null;
}

/**
 * Clear member session
 */
export function clearMemberSession(): void {
  deleteCookie('member-session');
}

/**
 * Set collaborator session
 */
export function setCollaboratorSession(data: {
  id: string;
  email: string;
  eventId: string;
  permissions: any;
}): void {
  setCookie('collaborator-session', JSON.stringify(data), { days: 7 });
}

/**
 * Get collaborator session
 */
export function getCollaboratorSession(): any | null {
  const session = getCookie('collaborator-session');
  return session ? JSON.parse(session) : null;
}

/**
 * Clear collaborator session
 */
export function clearCollaboratorSession(): void {
  deleteCookie('collaborator-session');
}

/**
 * Store the intended redirect URL before login
 */
export function setRedirectUrl(url: string): void {
  setCookie('redirect-after-login', url, { days: 1 });
}

/**
 * Get and clear the redirect URL
 */
export function getAndClearRedirectUrl(): string | null {
  const url = getCookie('redirect-after-login');
  if (url) {
    deleteCookie('redirect-after-login');
  }
  return url;
}

/**
 * Store the last visited page for a portal
 */
export function setLastVisitedPage(portalType: 'executive' | 'member', url: string): void {
  setCookie(`last-visited-${portalType}`, url, { days: 30 });
}

/**
 * Get the last visited page for a portal
 */
export function getLastVisitedPage(portalType: 'executive' | 'member'): string | null {
  return getCookie(`last-visited-${portalType}`);
}

