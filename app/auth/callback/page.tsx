"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuth() {
      try {
        // Check for error parameters in query string or hash
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get("error");
        const errorDescription = urlParams.get("error_description");

        if (error) {
          setErrorMsg(errorDescription || error);
          return;
        }

        // Handle PKCE code exchange if 'code' is present
        const code = urlParams.get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("Error exchanging code for session:", exchangeError);
            setErrorMsg(exchangeError.message);
            return;
          }
        }

        // Fetch the active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setErrorMsg(sessionError.message);
          return;
        }

        if (session?.user) {
          const user = session.user;

          // Check if profile exists, if not create one from OAuth metadata
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .single();

          if (!existingProfile) {
            const role = user.user_metadata?.role || "traveler";
            const fullName =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split("@")[0] ||
              "User";
            const avatarUrl =
              user.user_metadata?.avatar_url ||
              user.user_metadata?.picture ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80";

            await supabase.from("profiles").upsert({
              id: user.id,
              full_name: fullName,
              avatar_url: avatarUrl,
              role: role,
              city: user.user_metadata?.city || "Kolkata",
              hourly_rate: user.user_metadata?.hourly_rate || 500,
              specialties: user.user_metadata?.specialties
                ? (Array.isArray(user.user_metadata.specialties)
                    ? user.user_metadata.specialties
                    : [user.user_metadata.specialties])
                : ["Local Culture"],
              languages: ["English", "Hindi"],
              rating: 5.0,
              reviews: 0,
              experience: 1,
              verified: false,
            });
          }

          router.replace("/dashboard");
        } else {
          // If no session found yet, listen for onAuthStateChange
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
              subscription.unsubscribe();
              router.replace("/dashboard");
            }
          });
        }
      } catch (err: any) {
        console.error("Auth callback exception:", err);
        setErrorMsg(err?.message || "Failed to complete authentication.");
      }
    }

    handleAuth();
  }, [router]);

  if (errorMsg) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex flex-col items-center justify-center bg-muted/20 px-4">
        <div className="rounded-3xl border bg-card p-8 shadow-lg max-w-md w-full text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive text-2xl font-bold">
            !
          </div>
          <h1 className="text-xl font-bold text-destructive mb-2">Authentication Failed</h1>
          <p className="text-sm text-muted-foreground mb-6">{errorMsg}</p>
          <a
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-blue px-6 text-sm font-semibold text-white hover:bg-brand-blue-dark transition-colors"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 flex flex-col items-center justify-center bg-muted/20 px-4">
      <div className="rounded-3xl border bg-card p-8 shadow-lg max-w-sm w-full text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-blue mb-4" />
        <h2 className="text-lg font-bold">Signing you in...</h2>
        <p className="text-sm text-muted-foreground mt-1">Completing authentication...</p>
      </div>
    </div>
  );
}
