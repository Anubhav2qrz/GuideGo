"use client";

import { Suspense, useState, useRef } from "react";
import Link from "next/link";
import { 
  Mail, Lock, User, ArrowRight, Loader2, AlertCircle, 
  CheckCircle2, MapPin, IndianRupee, Heart, FileText, 
  Camera, Upload, ShieldCheck, RefreshCw, Check
} from "lucide-react";
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

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    city: "",
    hourlyRate: "",
    specialties: "",
    govDocType: "Aadhaar Card",
    govDocNumber: "",
  });

  // KYC Verification State for Guides
  const [docFilePreview, setDocFilePreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Handle Document File Picker
  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Document image size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setDocFilePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Live Selfie Upload / Capture
  const handleSelfieFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelfiePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Start Live Webcam
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Camera access was denied or is not available. You can upload a photo instead.");
      setIsCameraActive(false);
    }
  };

  // Stop Webcam
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture Photo from Video
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setSelfiePreview(dataUrl);
      stopCamera();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Guide KYC Validation
    if (role === "guide") {
      if (!formData.govDocNumber.trim()) {
        setError("Please enter your Government Document / ID Number.");
        setIsLoading(false);
        return;
      }
      if (!docFilePreview) {
        setError("Please upload a photo of your Government Document (Aadhaar / Passport / License).");
        setIsLoading(false);
        return;
      }
      if (!selfiePreview) {
        setError("Please take or upload a live verification photo of your face.");
        setIsLoading(false);
        return;
      }
    }

    try {
      const metadata: Record<string, unknown> = {
        full_name: formData.fullName.trim(),
        role: role,
      };

      if (role === "guide") {
        metadata.city = formData.city.trim();
        metadata.hourly_rate = formData.hourlyRate ? parseInt(formData.hourlyRate) : 800;
        metadata.specialties = formData.specialties;
        metadata.gov_doc_type = formData.govDocType;
        metadata.gov_doc_number = formData.govDocNumber.trim();
        metadata.verification_status = "pending_review";
        metadata.verified = false;
        // Include avatar from live photo if available
        if (selfiePreview) {
          metadata.avatar_url = selfiePreview;
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        throw error;
      }

      // If user was created, also upsert profile record
      if (data?.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: formData.fullName.trim(),
          avatar_url: selfiePreview || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80",
          role: role,
          city: formData.city || "Kolkata",
          hourly_rate: formData.hourlyRate ? parseInt(formData.hourlyRate) : 800,
          specialties: formData.specialties ? [formData.specialties] : ["Local Culture"],
          gov_doc_type: role === "guide" ? formData.govDocType : null,
          gov_doc_number: role === "guide" ? formData.govDocNumber : null,
          gov_doc_url: docFilePreview,
          selfie_url: selfiePreview,
          verification_status: role === "guide" ? "pending_review" : "verified",
          verified: false,
        }, { onConflict: "id" });
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Signup error:", err);
      let errMsg = "An error occurred during sign up.";
      if (err?.message && err.message !== "{}") {
        errMsg = err.message;
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
      <div className={`mx-auto w-full ${role === "guide" ? "max-w-2xl" : "max-w-md"} px-4 sm:px-6 transition-all`}>
        <ScrollReveal>
          <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">
                {role === "guide" ? "Apply as a Verified Local Guide" : "Create an Account"}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                {role === "guide" 
                  ? "Share your city with travelers. Submit your government ID & live photo for verified badge."
                  : "Join our community of travelers and local experts"}
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
                <h3 className="text-xl font-bold mb-2">
                  {role === "guide" ? "Application Submitted Successfully!" : "Account Created!"}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {role === "guide" 
                    ? `Thank you, ${formData.fullName}! Your guide application and verification documents have been received. You can now log in to access your guide dashboard.`
                    : `We've sent a verification link to ${formData.email}. Please check your email to continue.`}
                </p>
                <Button className="w-full bg-brand-emerald hover:bg-emerald-600 text-white h-12" asChild>
                  <Link href="/login">Go to Login</Link>
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSignup}>
                {/* Basic Details */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="Your full legal name"
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
                </div>

                {role === "guide" && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Registered City</label>
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

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hourly Rate (₹)</label>
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
                        <label className="text-sm font-medium">Specialties</label>
                        <div className="relative">
                          <Heart className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <input 
                            type="text" 
                            placeholder="Food, History, Heritage"
                            className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                            value={formData.specialties}
                            onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* KYC Document & Live Photo Section */}
                    <div className="rounded-2xl border border-brand-blue/30 bg-brand-blue/5 p-5 space-y-5 my-2">
                      <div className="flex items-center gap-2 text-brand-blue font-semibold text-sm">
                        <ShieldCheck className="h-5 w-5" />
                        <span>Government Document & Identity Verification</span>
                      </div>
                      
                      {/* Document Type & Number */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Document Type</label>
                          <select
                            className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                            value={formData.govDocType}
                            onChange={(e) => setFormData({ ...formData, govDocType: e.target.value })}
                          >
                            <option value="Aadhaar Card">Aadhaar Card</option>
                            <option value="Passport">Passport</option>
                            <option value="Driving License">Driving License</option>
                            <option value="Voter ID">Voter ID</option>
                            <option value="Tour Guide License">Govt Tour Guide License</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Document / ID Number</label>
                          <input
                            type="text"
                            placeholder="e.g. 4829 1928 3829"
                            className="h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                            value={formData.govDocNumber}
                            onChange={(e) => setFormData({ ...formData, govDocNumber: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      {/* Document Upload */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                          <span>Upload Photo of {formData.govDocType}</span>
                          <span className="text-muted-foreground font-normal text-[11px]">(JPG/PNG/PDF up to 5MB)</span>
                        </label>

                        {docFilePreview ? (
                          <div className="relative rounded-xl border bg-card p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src={docFilePreview} alt="Gov Doc Preview" className="h-12 w-16 object-cover rounded-lg border" />
                              <div>
                                <p className="text-xs font-semibold">{formData.govDocType} Uploaded</p>
                                <p className="text-[11px] text-brand-emerald flex items-center gap-1 font-medium">
                                  <Check className="h-3.5 w-3.5" /> Ready for verification
                                </p>
                              </div>
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setDocFilePreview(null)}
                              className="text-xs text-destructive"
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 bg-background hover:bg-muted/40 cursor-pointer transition-colors text-center">
                            <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                            <span className="text-xs font-medium text-brand-blue">Click to select document image</span>
                            <span className="text-[10px] text-muted-foreground">Front side showing your name and photo clearly</span>
                            <input 
                              type="file" 
                              accept="image/*,application/pdf" 
                              className="hidden" 
                              onChange={handleDocFileUpload} 
                            />
                          </label>
                        )}
                      </div>

                      {/* Live Selfie Photo Verification */}
                      <div className="space-y-2 pt-2 border-t">
                        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                          <span>Live Face Verification Photo</span>
                          <span className="text-muted-foreground font-normal text-[11px]">(Matches document photo)</span>
                        </label>

                        {/* Webcam Capture Interface */}
                        {isCameraActive && (
                          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-sm mx-auto">
                            <video 
                              ref={videoRef} 
                              autoPlay 
                              playsInline 
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-3">
                              <Button 
                                type="button" 
                                size="sm" 
                                onClick={capturePhoto} 
                                className="bg-brand-emerald hover:bg-emerald-600 text-white text-xs px-4"
                              >
                                <Camera className="mr-1.5 h-4 w-4" /> Capture Photo
                              </Button>
                              <Button 
                                type="button" 
                                size="sm" 
                                variant="destructive" 
                                onClick={stopCamera} 
                                className="text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {cameraError && (
                          <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg">{cameraError}</p>
                        )}

                        {selfiePreview ? (
                          <div className="relative rounded-xl border bg-card p-3 flex items-center justify-between max-w-sm">
                            <div className="flex items-center gap-3">
                              <img src={selfiePreview} alt="Selfie Preview" className="h-14 w-14 object-cover rounded-full border-2 border-brand-emerald" />
                              <div>
                                <p className="text-xs font-semibold">Live Photo Captured</p>
                                <p className="text-[11px] text-brand-emerald flex items-center gap-1 font-medium">
                                  <Check className="h-3.5 w-3.5" /> Face verification ready
                                </p>
                              </div>
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => { setSelfiePreview(null); startCamera(); }}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Retake
                            </Button>
                          </div>
                        ) : !isCameraActive && (
                          <div className="flex gap-3">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={startCamera}
                              className="flex-1 text-xs h-11 border-brand-blue/30 text-brand-blue hover:bg-brand-blue/10"
                            >
                              <Camera className="mr-2 h-4 w-4" />
                              Take Live Photo with Camera
                            </Button>

                            <label className="flex-1 inline-flex items-center justify-center rounded-xl border bg-background hover:bg-muted text-xs font-medium cursor-pointer h-11 px-3">
                              <Upload className="mr-2 h-4 w-4 text-muted-foreground" />
                              Upload Selfie
                              <input 
                                type="file" 
                                accept="image/*" 
                                capture="user"
                                className="hidden" 
                                onChange={handleSelfieFileUpload} 
                              />
                            </label>
                          </div>
                        )}
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
                  className="w-full h-12 mt-6 bg-brand-emerald hover:bg-emerald-600 text-white font-semibold text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    `Submit ${role === "guide" ? "Guide Application" : "Registration"}`
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
