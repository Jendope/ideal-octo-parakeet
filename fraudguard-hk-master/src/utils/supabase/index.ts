// Supabase client utilities for FraudGuard HK
// Use these helpers for server-side and client-side Supabase operations

export { createClient as createServerClient } from './server';
export { createClient as createBrowserClient } from './client';
export { updateSession } from './session';
