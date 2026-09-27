import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

/**
 * Initialize API base URL from environment
 * Falls back to localhost:8000 for development
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000");

/**
 * Create Axios instance with base configuration
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: API_TIMEOUT,
});

// ============================================================================
// REQUEST INTERCEPTOR: Add authentication token
// ============================================================================

apiClient.interceptors.request.use(
  (config) => {
    // Only add token on client side (browser), not during SSR
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        // Django expects: "Token <token_key>"
        config.headers.Authorization = `Token ${token}`;
      }
    }
    return config;
  },
  (error) => {
    // Handle request errors
    console.error("Request error:", error);
    return Promise.reject(error);
  },
);

// ============================================================================
// RESPONSE INTERCEPTOR: Handle 401 and other global errors
// ============================================================================

apiClient.interceptors.response.use(
  (response) => {
    // Return successful response as-is
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized globally
    if (error.response?.status === 401) {
      // Token is invalid or expired
      console.warn("Unauthorized: Token invalid or expired");

      // Clear auth data on client side only
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");

        // Redirect to login (except if already on login page)
        if (!window.location.pathname.includes("/auth/login")) {
          window.location.href =
            "/auth/login?returnUrl=" +
            encodeURIComponent(window.location.pathname);
        }
      }
    }

    // Log errors for debugging
    if (error.response) {
      // API returned error response
      console.error("API Error:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      // Request made but no response
      console.error("Network Error: No response from API");
    } else {
      // Error in request setup
      console.error("Request Setup Error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default apiClient;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if API is reachable (health check)
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get("/health/", {
      timeout: 5000, // Quick timeout for health check
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

/**
 * Get the current API base URL
 */
export function getApiBaseUrl(): string {
  return API_URL;
}

/**
 * Check if token exists in localStorage
 */
export function hasToken(): boolean {
  if (typeof window !== "undefined") {
    return !!localStorage.getItem("auth_token");
  }
  return false;
}

/**
 * Get token from localStorage
 */
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
}

/**
 * Format error response for display
 * Handles Django's various error formats
 */
export function formatApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const { response } = error;

    // Server error response
    if (response?.data) {
      const data = response.data as any;

      // Django field validation errors (dict)
      if (typeof data === "object" && !Array.isArray(data)) {
        // Get first error message
        for (const [, value] of Object.entries(data)) {
          if (Array.isArray(value) && value.length > 0) {
            return String(value[0]);
          } else if (typeof value === "string") {
            return value;
          }
        }
      }

      // Django error message
      if (data.error) return data.error;
      if (data.detail) return data.detail;
      if (data.message) return data.message;

      // String error
      if (typeof data === "string") return data;
    }

    // Network error
    if (error.code === "ECONNABORTED") {
      return "Request timeout. Please check your connection.";
    }

    if (!error.response) {
      return "Network error. Unable to reach the server.";
    }

    // Default HTTP status message
    return `Error ${response?.status}: ${response?.statusText || "Request failed"}`;
  }

  // Unknown error
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}
