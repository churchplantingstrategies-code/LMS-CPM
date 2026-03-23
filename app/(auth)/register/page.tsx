"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const authError = searchParams.get("error");
  const oauthErrorMessages: Record<string, string> = {
    OAuthSignin: "Google sign-in is not configured yet. Please register with email instead.",
    OAuthCallback: "Google sign-in failed. Please try again or register with email.",
    OAuthCreateAccount: "Could not create account with Google. Please register with email.",
    Configuration: "Google sign-in is not set up on this server. Use email and password.",
    Default: "Sign-in failed. Please try again.",
  };
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const password = watch("password", "");
  const passwordStrength = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? "strong" : password.length >= 6 ? "medium" : "weak";

  async function onSubmit(data: RegisterForm) {
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          plan,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        // Parse detailed errors from API
        let errorMessage = json.error || "Registration failed. Please try again.";
        
        if (json.details) {
          const firstField = Object.keys(json.details)[0];
          const firstError = json.details[firstField]?.[0];
          if (firstError) {
            errorMessage = `${firstField}: ${firstError}`;
          }
        }
        
        console.error("[REGISTER_FAILED]", json);
        setError(errorMessage);
        return;
      }

      // Auto sign in after registration
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/dashboard");
      } else {
        setError("Registration succeeded but auto-login failed. Please log in manually.");
      }
    } catch (error) {
      console.error("[REGISTER_ERROR]", error);
      setError("Something went wrong. Please try again.");
    }
  }

  async function loginWithGoogle() {
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError("Google sign-in is not configured. Please use email and password.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="text-gray-500 mt-1">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
        {plan && (
          <div className="mt-3 rounded-lg bg-brand-50 border border-brand-200 px-3 py-2 text-sm text-brand-700">
            ✨ You&apos;re signing up for the <strong className="capitalize">{plan}</strong> plan — includes 14-day free trial
          </div>
        )}
      </div>

      {/* OAuth / URL error */}
      {authError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {oauthErrorMessages[authError] ?? oauthErrorMessages.Default}
        </div>
      )}

      {/* Google */}
      <Button
        variant="outline"
        className="w-full mb-6 gap-2"
        size="lg"
        onClick={loginWithGoogle}
        loading={googleLoading}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-400">Or register with email</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input id="name" placeholder="John Doe" className="pl-9" {...register("name")} />
          </div>
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input id="email" type="email" placeholder="you@example.com" className="pl-9" {...register("email")} />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              className="pl-9 pr-10"
              {...register("password")}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-1.5 flex gap-1.5">
              {["weak", "medium", "strong"].map((level, i) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full ${
                    passwordStrength === "strong" ? "bg-emerald-500" :
                    passwordStrength === "medium" && i < 2 ? "bg-amber-400" :
                    passwordStrength === "weak" && i === 0 ? "bg-red-500" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          )}
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="pl-9"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" variant="brand" size="lg" className="w-full" loading={isSubmitting}>
          Create Account
        </Button>

        <p className="text-xs text-center text-gray-400">
          By registering, you agree to our{" "}
          <Link href="/terms" className="underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </form>
    </div>
  );
}
