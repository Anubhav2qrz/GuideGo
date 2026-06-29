"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2, MapPin, IndianRupee, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams?.get("role") || "traveler";
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    city: "",
    hourlyRate: "",
    specialties: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const metadata: Record<string, unknown> = {
        full_name: formData.fullName,
        role: role,
      };

      if (role === "guide") {
        metadata.city = formData.city;
        metadata.hourly_rate = formData.hourlyRate ? parseInt(formData.hourlyRate) : 800;
        metadata.specialties = formData.specialties;
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Signup error:", err);
      let errMsg = "An error occurred during sign up.";
      if (err?.message && err.message !== "{}") {
        errMsg = err.message;
      } else if (typeof err === 'string' && err !== "{}") {
        errMsg = err;
      } else if (err && typeof err === 'object') {
        try {
          const str = JSON.stringify(err);
          if (str !== "{}") errMsg = str;
        } catch(e) {}
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-muted/20">
      <div className="mx-auto w-full max-w-md px-4 sm:px-6">
        <ScrollReveal>
          <div className="rounded-3xl border bg-card p-8 shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">
                {role === "guide" ? "Apply to be a Guide" : "Create an Account"}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Join our community of travelers and local experts
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success ? (
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-emerald/10 text-brand-emerald">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Check your email</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  We&apos;ve sent a verification link to <strong>{formData.email}</strong>. Please verify your email to continue.
                </p>
                <Button className="w-full bg-brand-emerald hover:bg-emerald-600 text-white" asChild>
                  <Link href="/login">Go to Login</Link>
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSignup}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Name"
                      className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="email" 
                      placeholder="you@example.com"
                      className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {role === "guide" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <input 
                          type="text" 
                          placeholder="e.g. Kolkata"
                          className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hourly Rate</label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <input 
                            type="number" 
                            placeholder="800"
                            className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                            value={formData.hourlyRate}
                            onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Favourings</label>
                        <div className="relative">
                          <Heart className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <input 
                            type="text" 
                            placeholder="Food, History..."
                            className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                            value={formData.specialties}
                            onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 mt-6 bg-brand-emerald hover:bg-emerald-600 text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Sign Up as ${role === "guide" ? "Guide" : "Traveler"}`
                  )}
                </Button>
              </form>
            )}

            {!success && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12"
                  onClick={handleGoogleLogin}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Google
                </Button>
              </>
            )}

            {!success && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-brand-emerald hover:underline">
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
