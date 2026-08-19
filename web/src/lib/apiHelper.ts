/**
 * Universal API URL Resolver for Web and Mobile WebView
 * Resolves API endpoints so that fetch calls work identically on Web and Mobile Android APK.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yqxljnyyjqtajigucbcm.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function getApiUrl(endpoint: string): string {
  // If running in browser / standard web server
  if (typeof window !== 'undefined' && window.location.protocol !== 'file:') {
    return endpoint;
  }
  
  // Running in Mobile WebView (file:// protocol)
  // Maps relative API routes to Supabase REST endpoints or host backend
  const cleanEndpoint = endpoint.replace(/^\/api\//, '');

  if (cleanEndpoint === 'activities') {
    return `${SUPABASE_URL}/rest/v1/activities?select=*&order=date.desc`;
  }
  if (cleanEndpoint === 'proposals') {
    return `${SUPABASE_URL}/rest/v1/proposals?select=*&order=created_at.desc`;
  }
  if (cleanEndpoint === 'activity-applications') {
    return `${SUPABASE_URL}/rest/v1/activity_applications?select=*&order=applied_at.desc`;
  }
  
  return endpoint;
}

export function getMobileFetchHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };
}
