import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, User, UserPlus } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          throw new Error(
            "Please check your email and click the verification link before logging in.",
          );
        }
        throw error;
      }

      if (!data.user) {
        throw new Error("Authentication failed");
      }

      // Check if user has admin role in metadata or admin_users table
      const userRole = data.user.user_metadata?.role;

      if (userRole === "admin") {
        // For new users with admin role in metadata, create admin_users record if it doesn't exist
        const { data: existingAdmin } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", data.user.id)
          .single();

        if (!existingAdmin) {
          // Create admin user record and users record
          const { error: userInsertError } = await supabase
            .from("users")
            .upsert({
              id: data.user.id,
              email: data.user.email,
            });

          if (userInsertError) {
            console.warn("User record creation warning:", userInsertError);
          }

          const { error: adminInsertError } = await supabase
            .from("admin_users")
            .insert({
              user_id: data.user.id,
              is_super_admin: false,
            });

          if (adminInsertError) {
            console.error("Error creating admin record:", adminInsertError);
            await supabase.auth.signOut();
            throw new Error(
              "Failed to initialize admin account. Please contact support.",
            );
          }
        }

        onLoginSuccess();
      } else {
        // Check if user exists in admin_users table (for existing admins)
        const { data: userData, error: userError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", data.user.id)
          .single();

        if (userError || !userData) {
          await supabase.auth.signOut();
          throw new Error(
            "Access denied. This portal is for administrators only. Please use the main application for regular user access.",
          );
        }

        onLoginSuccess();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to login. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      // First create the user in auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: "admin",
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Manually create the user and admin records
        try {
          // Create user record
          await supabase.from("users").insert({
            id: data.user.id,
            email: data.user.email,
          });

          // Create admin record
          await supabase.from("admin_users").insert({
            user_id: data.user.id,
            is_super_admin: false,
          });

          setSuccess(
            "Admin account created successfully! Please check your email to verify your account before logging in.",
          );
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setIsSignUp(false);
        } catch (insertError) {
          console.error("Error creating user records:", insertError);
          // Continue showing success since auth user was created
          setSuccess(
            "Account created but there was an issue setting up admin privileges. Please contact support after verifying your email.",
          );
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setIsSignUp(false);
        }
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setSuccess(null);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">
            {isSignUp ? "Create Admin Account" : "Admin Portal"}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp
              ? "Sign up to create an admin account"
              : "Login to access the admin dashboard"}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form
          onSubmit={isSignUp ? handleSignUp : handleLogin}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? isSignUp
                ? "Creating Account..."
                : "Logging in..."
              : isSignUp
                ? "Create Account"
                : "Login"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={toggleMode}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isSignUp ? (
              <>
                <User className="h-4 w-4" />
                Already have an account? Login
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Need an account? Sign up
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
