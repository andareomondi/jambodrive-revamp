"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { AuthUser } from "@/lib/api/types";
import {
  getCurrentUser,
  storeAuthData,
  clearAuthData,
  getAuthToken,
  logout as apiLogout,
} from "@/lib/api/auth";

// ============================================================================
// AUTH CONTEXT TYPE
// ============================================================================

interface AuthContextType {
  /** Current authenticated user, null if not logged in */
  user: AuthUser | null;

  /** Whether auth is being checked on mount */
  isLoading: boolean;

  /** Whether user has valid token and user data */
  isAuthenticated: boolean;

  /** Logout user and clear auth data */
  logout: () => Promise<void>;

  /** Refetch user data from API */
  refreshUser: () => Promise<void>;

  /** Set user directly (used after login/register) */
  setUser: (user: AuthUser | null) => void;
}

// ============================================================================
// CREATE CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // ========================================================================
  // INITIALIZATION: Check for existing session on mount
  // ========================================================================

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if token exists
        const token = getAuthToken();

        if (token) {
          // Token exists, fetch current user
          try {
            const { user: userData } = await getCurrentUser();
            setUser(userData);
            storeAuthData(token, userData);
          } catch (error) {
            // Token is invalid, clear it
            console.warn("Token validation failed, clearing auth data");
            clearAuthData();
            setUser(null);
          }
        }
        // No token = not authenticated
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // ========================================================================
  // LOGOUT
  // ========================================================================

  const logout = useCallback(async () => {
    try {
      // Call API logout (deletes server-side token)
      await apiLogout();
    } catch (error) {
      // Log but don't throw—clear local data regardless
      console.error("API logout error:", error);
    } finally {
      // Clear local auth data
      clearAuthData();
      setUser(null);
    }
  }, []);

  // ========================================================================
  // REFRESH USER DATA
  // ========================================================================

  const refreshUser = useCallback(async () => {
    try {
      const { user: userData } = await getCurrentUser();
      setUser(userData);
      storeAuthData(getAuthToken() || "", userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // If refresh fails, user might be logged out
      clearAuthData();
      setUser(null);
    }
  }, []);

  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !!getAuthToken(),
    logout,
    refreshUser,
    setUser,
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <AuthContext.Provider value={value}>
      {/* Only render children after auth initialization */}
      {isInitialized ? children : null}
    </AuthContext.Provider>
  );
}

// ============================================================================
// HOOK: useAuth
// ============================================================================

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 *
 * @throws Error if used outside AuthProvider
 *
 * @example
 * function MyComponent() {
 *   const { user, isAuthenticated, logout } = useAuth();
 *
 *   if (!isAuthenticated) return <Redirect to="/auth/login" />;
 *
 *   return <div>Welcome, {user?.first_name}</div>;
 * }
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth must be used within <AuthProvider>. " +
        "Make sure AuthProvider wraps your component in the layout.",
    );
  }

  return context;
}

// ============================================================================
// HOOK: useIsAuthed (Shorthand)
// ============================================================================

/**
 * Quick hook to check if user is authenticated
 * Returns boolean instead of full context
 */
export function useIsAuthed(): boolean {
  const { isAuthenticated, isLoading } = useAuth();
  return !isLoading && isAuthenticated;
}

// ============================================================================
// HOOK: useUser
// ============================================================================

/**
 * Hook to access current user
 * Returns null if not authenticated or still loading
 */
export function useUser(): AuthUser | null {
  const { user, isLoading } = useAuth();
  return isLoading ? null : user;
}
