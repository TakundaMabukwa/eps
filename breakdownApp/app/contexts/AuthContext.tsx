import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { router, Redirect } from "expo-router";
import { supabase } from "../utils/supabase";
import { Text, View } from "react-native";
// Optional loading / fallback component (kept minimal to avoid blocking UI)
const InlineFallback = ({ message = "Checking auth..." }: { message?: string }) => (
  <View style={{ padding: 12 }}>
    <Text>{message}</Text>
  </View>
);

// Types
interface UserData {
  id: string;
  email: string;
  role: string;
  created_at?: string;
  updated_at?: string;
  // Add other user fields as needed
}

interface AuthState {
  // Auth state
  isLoading: boolean;
  // Indicates we've completed the first full validation pass (so guards can act safely)
  isHydrated: boolean;
  isAuthenticated: boolean;
  session: Session | null;
  user: User | null;
  userData: UserData | null;

  // Auth methods
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;

  // Utility methods
  hasValidRole: () => boolean;
  isDriver: () => boolean;
}

// Create context
const AuthContext = createContext<AuthState | null>(null);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isHydrated, setIsHydrated] = useState(false); // first validation pass completed

  // Computed values
  const isAuthenticated = !!session && !!user && !!userData;

  // Add logging for debugging
  useEffect(() => {
    console.log("🔄 Auth state changed:", {
      isLoading,
      isAuthenticated,
      hasSession: !!session,
      hasUser: !!user,
      hasUserData: !!userData,
      userRole: userData?.role,
    });
  }, [isLoading, isAuthenticated, session, user, userData]);

  // Utility methods
  const hasValidRole = (): boolean => {
    return userData?.role === "driver";
  };

  const isDriver = (): boolean => {
    return userData?.role === "driver";
  };

  // Fetch user data from database
  const fetchUserData = async (userId: string): Promise<UserData | null> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user data:", error.message);
        return null;
      }

      return data as UserData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // Validate and set auth state
  const validateAuthState = async (currentSession: Session | null) => {
    console.log("🔍 Starting auth validation...", {
      hasSession: !!currentSession,
    });
    setIsLoading(true);

    try {
      if (!currentSession) {
        // No session - clear everything and sign out
        console.log("❌ No session found, signing out");
        await signOut();
        return;
      }

      console.log("✅ Session found, validating user...");
      // We have a session, now validate the user
      const {
        data: { user: authUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !authUser) {
        console.error("❌ Auth user validation failed:", userError?.message);
        await signOut();
        return;
      }

      console.log("✅ Auth user validated, fetching user data...", {
        userId: authUser.id,
      });
      // Fetch user data from our database
      const dbUserData = await fetchUserData(authUser.id);

      if (!dbUserData || !dbUserData.role) {
        console.error("❌ User data not found or invalid role", {
          userData: dbUserData,
        });
        await signOut();
        return;
      }

      // All validation passed - set state
      console.log("🎉 Setting auth state...", {
        email: dbUserData.email,
        role: dbUserData.role,
        userId: authUser.id,
      });

      setSession(currentSession);
      setUser(authUser);
      setUserData(dbUserData);

      console.log(
        `✅ Auth validated for user: ${dbUserData.email} with role: ${dbUserData.role}`
      );
    } catch (error) {
      console.error("💥 Auth validation error:", error);
      await signOut();
    } finally {
      setIsLoading(false);
      setIsHydrated(true); // mark hydration complete after first attempt
      console.log("🏁 Auth validation completed");
    }
  };

  // Sign in method
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        await validateAuthState(data.session);
        return { success: true };
      }

      return { success: false, error: "No session returned" };
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out method
  const signOut = async (): Promise<void> => {
    try {
      console.log("🚪 Signing out...");

      // Clear local state first
      setSession(null);
      setUser(null);
      setUserData(null);
      setIsLoading(false); // Make sure loading is set to false
  setIsHydrated(true); // ensure guards don't stay in pre-hydration limbo

      // Sign out from Supabase
      await supabase.auth.signOut();

      console.log("✅ Sign out completed");
    } catch (error) {
      console.error("💥 Sign out error:", error);
      // Even if signOut fails, we've cleared local state
      setIsLoading(false); // Ensure loading is false even on error
    }
  };

  // Refresh auth state
  const refreshAuth = async (): Promise<void> => {
    try {
      console.log("Refreshing authentication state...");
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session during refresh:", error.message);
        await signOut();
        return;
      }

      await validateAuthState(currentSession);
      console.log("Authentication state refreshed successfully");
    } catch (error) {
      console.error("Error refreshing auth state:", error);
      await signOut();
    }
  };

  // Initialize auth state and set up listeners
  useEffect(() => {
    let mounted = true;

    // Initial session check
    const initializeAuth = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();
      if (mounted) {
        await validateAuthState(initialSession);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event);

      if (mounted) {
        switch (event) {
          case "SIGNED_IN":
          case "TOKEN_REFRESHED":
            await validateAuthState(currentSession);
            break;
          case "SIGNED_OUT":
            setSession(null);
            setUser(null);
            setUserData(null);
            setIsLoading(false);
            break;
          default:
            await validateAuthState(currentSession);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Auth context value
  const value: AuthState = {
    // State
    isLoading,
    isHydrated,
    isAuthenticated,
    session,
    user,
    userData,

    // Methods
    signIn,
    signOut,
    refreshAuth,

    // Utilities
    hasValidRole,
    isDriver,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth(): AuthState {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

// Auth guard components
interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// Component to protect authenticated routes
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isLoading, isHydrated, isAuthenticated, hasValidRole } = useAuth();
  const allow = isAuthenticated && hasValidRole();

  // Before hydration completes, never redirect (prevents flicker)
  if (!isHydrated) {
    return (
      fallback || (
        <InlineFallback message={isLoading ? 'Loading session...' : 'Preparing...'} />
      )
    );
  }

  if (!allow) {
    return <Redirect href="/(auth)/login" />;
  }

  return <>{children}</>;
}

// Component to protect unauthenticated routes (like login page)
export function GuestGuard({ children, fallback }: AuthGuardProps) {
  const { isLoading, isHydrated, isAuthenticated, hasValidRole } = useAuth();
  const authed = isAuthenticated && hasValidRole();

  if (!isHydrated) {
    return (
      fallback || (
        <InlineFallback message={isLoading ? 'Loading session...' : 'Preparing...'} />
      )
    );
  }

  if (authed) {
    return <Redirect href="/(tabs)" />;
  }

  return <>{children}</>;
}

export default AuthContext;
