"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthProvider";
import { login, storeAuthData } from "@/lib/api/auth";
import { formatApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowRight, Car, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Login form content wrapped in Suspense boundary
 * Separated to handle useSearchParams safely
 */
function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, setUser } = useAuth();

  // Get return URL from query params, default to /dashboard
  const rawReturnUrl = searchParams.get("returnUrl") ?? "/dashboard";
  const returnUrl =
    rawReturnUrl.startsWith("/") && !rawReturnUrl.startsWith("//")
      ? rawReturnUrl
      : "/dashboard";

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(decodeURIComponent(returnUrl));
    }
  }, [isAuthenticated, router, returnUrl]);

  // ========================================================================
  // FORM SUBMISSION
  // ========================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      // Call API login endpoint
      const response = await login(email, password);

      // Store token and user data
      storeAuthData(response.token, response.user);

      // Update context
      setUser(response.user);

      toast.success("Logged in successfully!");

      // Redirect to dashboard or returnUrl
      router.push(decodeURIComponent(returnUrl));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to login";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <Card className="p-8">
          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Car className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Sign In</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your Cosmara account
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-accent hover:text-accent/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                <div className="flex gap-3">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* SIGN UP LINK */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="text-accent hover:text-accent/80 font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

/**
 * Login page with Suspense boundary
 * Suspense needed for useSearchParams in client component
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
