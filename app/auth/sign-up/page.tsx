"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthProvider";
import {
  register,
  storeAuthData,
  splitFullName,
  isValidEmail,
  isValidPassword,
} from "@/lib/api/auth";
import { formatApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Car, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const { isAuthenticated, setUser } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  // ========================================================================
  // FORM HANDLERS
  // ========================================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ====================================================================
    // CLIENT-SIDE VALIDATION
    // ====================================================================

    // All fields filled
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    // Valid email format
    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Password strength
    if (!isValidPassword(formData.password)) {
      setError("Password must be at least 8 characters");
      return;
    }

    // Terms agreement
    if (!formData.agreeTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    // ====================================================================
    // SUBMIT TO API
    // ====================================================================

    setIsLoading(true);

    try {
      // Split full name into first and second names
      const { first: firstName, second: secondName } = splitFullName(
        formData.fullName,
      );

      // Call API register endpoint
      const response = await register(
        firstName,
        secondName,
        formData.email,
        formData.password,
      );

      // Store token and user data
      storeAuthData(response.token, response.user);

      // Update context (this logs user in)
      setUser({
        ...response.user,
        profile: {
          id: "", // Will be fetched on next /auth/me call
          role: "customer",
          full_name: formData.fullName,
          phone: null,
          total_bookings: null,
          join_date: new Date().toISOString(),
        },
      });

      toast.success("Account created successfully!");

      // Redirect to dashboard (user is auto-logged in)
      router.push("/dashboard");
    } catch (err) {
      // Handle different error types
      if (typeof err === "object" && err !== null) {
        // Django validation errors (dict format)
        const errorObj = err as Record<string, any>;

        // Find first error message
        for (const value of Object.values(errorObj)) {
          if (Array.isArray(value) && value.length > 0) {
            setError(String(value[0]));
            toast.error(String(value[0]));
            setIsLoading(false);
            return;
          } else if (typeof value === "string") {
            setError(value);
            toast.error(value);
            setIsLoading(false);
            return;
          }
        }
      }

      // Fallback to error message
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create account";
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
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Join Cosmara
            </h1>
            <p className="text-sm text-muted-foreground">
              Create your account to start booking premium cars
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Jackson Kasanga"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
                required
                autoComplete="name"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                At least 8 characters
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                required
                autoComplete="new-password"
              />
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    agreeTerms: checked as boolean,
                  }))
                }
                disabled={isLoading}
              />
              <Label
                htmlFor="agreeTerms"
                className="text-sm leading-snug cursor-pointer text-foreground"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-accent hover:text-accent/80 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </Label>
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
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* SIGN IN LINK */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-accent hover:text-accent/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
