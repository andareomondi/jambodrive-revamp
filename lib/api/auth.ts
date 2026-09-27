import apiClient, { formatApiError } from "./client";
import type {
  LoginResponse,
  RegisterResponse,
  CurrentUserResponse,
  LoginPayload,
  RegisterPayload,
  LogoutResponse,
} from "./types";
import axios from "axios";

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * Login with email and password
 * Returns user data and authentication token
 *
 * POST /api/auth/login/
 * Body: { email, password }
 * Returns: { user, token, message }
 */
export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  try {
    const payload: LoginPayload = { email, password };
    const response = await apiClient.post<LoginResponse>(
      "/auth/login/",
      payload,
    );
    return response.data;
  } catch (error) {
    const message = formatApiError(error);
    throw new Error(message);
  }
}

/**
 * Register a new user account
 * User is automatically created with profile
 * Token is returned for immediate login
 *
 * POST /api/auth/register/
 * Body: { first_name, second_name, email, password, password_confirm }
 * Returns: { user, token, message }
 */
export async function register(
  firstName: string,
  secondName: string,
  email: string,
  password: string,
): Promise<RegisterResponse> {
  try {
    const payload: RegisterPayload = {
      first_name: firstName,
      second_name: secondName,
      email,
      password,
      password_confirm: password,
    };

    const response = await apiClient.post<RegisterResponse>(
      "/auth/register/",
      payload,
    );
    return response.data;
  } catch (error) {
    const message = formatApiError(error);
    throw new Error(message);
  }
}

/**
 * Get current authenticated user
 * Requires valid token in Authorization header
 *
 * GET /api/auth/me/
 * Returns: { user with profile }
 */
export async function getCurrentUser(): Promise<CurrentUserResponse> {
  try {
    const response = await apiClient.get<CurrentUserResponse>("/auth/me/");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error("Not authenticated");
    }
    const message = formatApiError(error);
    throw new Error(message);
  }
}

/**
 * Logout current user
 * Deletes authentication token on server side
 *
 * POST /api/auth/logout/
 * Requires: Valid token in Authorization header
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post<LogoutResponse>("/auth/logout/");
  } catch (error) {
    // Log error but don't throw—logout should clear local data regardless
    console.error("Logout API error:", formatApiError(error));
  }
}

// ============================================================================
// TOKEN & AUTH DATA STORAGE
// ============================================================================

/**
 * Store authentication token and user data in localStorage
 * Called after successful login/register
 *
 * @param token - Authentication token from backend
 * @param user - (Optional) User data to store
 */
export function storeAuthData(token: string, user?: any): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
    if (user) {
      // Store user for quick access without API call
      localStorage.setItem("user", JSON.stringify(user));
    }
  }
}

/**
 * Clear all authentication data from localStorage
 * Called on logout or when token is invalid
 */
export function clearAuthData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  }
}

/**
 * Get stored authentication token
 * Returns null if not available (e.g., during SSR)
 */
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
}

/**
 * Get stored user data from localStorage
 * Returns parsed JSON or null if not available
 */
export function getStoredUser(): any | null {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    try {
      return user ? JSON.parse(user) : null;
    } catch {
      // Corrupted data in localStorage
      clearAuthData();
      return null;
    }
  }
  return null;
}

/**
 * Check if user is authenticated
 * Returns true if token exists in localStorage
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Minimum 8 characters
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Split full name into first and second names
 * Handles cases like "John", "John Doe", "John Q Public"
 */
export function splitFullName(fullName: string): {
  first: string;
  second: string;
} {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { first: "", second: "" };
  }

  const parts = trimmed.split(/\s+/);
  const first = parts[0];
  const second = parts.slice(1).join(" ") || first; // Use first name as fallback

  return { first, second };
}

// ============================================================================
// TYPES FOR EXPORT
// ============================================================================

export type {
  LoginResponse,
  RegisterResponse,
  CurrentUserResponse,
  LogoutResponse,
};
