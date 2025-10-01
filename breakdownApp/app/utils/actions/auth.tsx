import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { router } from 'expo-router';

// app/utils/actions/auth.tsx
//
// Centralized Supabase auth utilities.
// Call ensureSession() anywhere (client) to guarantee a valid session or redirect to /login silently.
// For server actions / RSC you may need a separate server-side helper (not included here).

let _client: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
    if (_client) return _client;
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
    _client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            // Only needed on web; causes unsupported location access on native.
            detectSessionInUrl: Platform.OS === 'web',
        },
    });
    return _client;
}

function navigateToLogin() {
    if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            try {
                window.location.replace('/login');
            } catch {
                // ignore
            }
        }
    } else {
        // Use expo-router on native
        try {
            router.replace('/login');
        } catch {
            // ignore navigation errors (e.g., if router not ready)
        }
    }
}

async function redirectToLogin() {
    try {
        const c = getSupabaseClient();
        await c.auth.signOut(); // Clean local session silently
    } catch {
        // ignore
    }
    navigateToLogin();
    // In non-browser/native contexts just throw to abort any awaiting call.
    throw new Error('Unauthenticated');
}

/**
 * Ensures an authenticated session.
 * 1. Returns cached session if present.
 * 2. Tries to refresh if missing/expired.
 * 3. Redirects to /login (no alert) if cannot obtain a session.
 */
export async function ensureSession(): Promise<Session> {
    const supabase = getSupabaseClient();

    // Fast path
    const { data: initial } = await supabase.auth.getSession();
    if (initial.session) return initial.session;

    // Attempt explicit refresh
    try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
            await redirectToLogin();
        }
        if (data?.session) return data.session;
    } catch {
        await redirectToLogin();
    }

    await redirectToLogin();
    throw new Error('Unauthenticated');
}

/**
 * Get current session if available (no redirect). Returns null if not authenticated.
 */
export async function getOptionalSession(): Promise<Session | null> {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    return data.session ?? null;
}

/**
 * Subscribe to auth state changes. Returns unsubscribe function.
 */
export function onAuthChange(
    cb: (event: string, session: Session | null) => void
): () => void {
    const supabase = getSupabaseClient();
    const {
        data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
        cb(event, session);
        if (!session) {
            // If user signed out anywhere, force redirect.
            navigateToLogin();
        }
    });
    return () => {
        subscription.unsubscribe();
    };
}

/**
 * Sign out and redirect to login (silent).
 */
export async function logout() {
    try {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
    } finally {
        navigateToLogin();
    }
}

// Example usage in a client component:
// useEffect(() => { ensureSession().then(s => setUser(s.user)); }, []);