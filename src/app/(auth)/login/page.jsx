"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { CampusLogo } from "@/components/brand/CampusLogo";
import { AuthDoodles } from "@/components/ui/AuthDoodles";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "Campus Rhythms",
      subtitle: "Streamed & Amplified",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
    },
    {
      title: "Dorm Studios",
      subtitle: "United in Sound",
      image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&q=80",
    },
    {
      title: "Student Beats",
      subtitle: "Drop Your Track",
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80",
    },
  ];

  // Auto-play carousel every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      // Check role to direct to /admin or student destination
      const { data: userResp } = await supabase.auth.getUser();
      const currentUser = userResp?.user;
      let targetRoute = "/";

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const redirectParam = params.get("redirectTo");
        if (redirectParam) targetRoute = redirectParam;
      }

      if (currentUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (profile?.role === "admin" && targetRoute === "/") {
          targetRoute = "/admin";
        }
      }

      router.push(targetRoute);
      router.refresh();
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) setErrorMsg(error.message);
    } catch {
      setErrorMsg("Failed to initiate Google sign in.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060510] p-4 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden select-none">
      <AuthDoodles />

      {/* Main Two-Card Side-by-Side Wrapper */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Interactive Carousel Card */}
        <div className="relative rounded-[2rem] overflow-hidden h-[580px] lg:h-[620px] p-8 md:p-10 flex flex-col justify-between border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-[#0d0c1c]/80 backdrop-blur-2xl group transition-all duration-500 hover:border-violet-500/30">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none z-10" />

          {slides.map((s, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                activeSlide === index ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
              }`}
            >
              <Image
                src={s.image}
                alt={s.title}
                fill
                className="object-cover brightness-75"
                priority={index === 0}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />

          {/* Top Row: Logo & Back to Website Link */}
          <div className="relative z-20 flex items-center justify-between">
            <CampusLogo size={34} showText={false} />
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-all backdrop-blur-md shadow-sm hover:scale-105 active:scale-95"
            >
              Back to website →
            </Link>
          </div>

          {/* Bottom Row: Animated Headline synced with Image Slide */}
          <div className="relative z-20 space-y-4">
            <div className="min-h-[70px]">
              <span className="text-[10px] tracking-widest text-violet-300/80 uppercase font-mono block mb-1">
                STUDIO SESSIONS
              </span>
              <p
                key={`title-${activeSlide}`}
                className="font-display text-2xl md:text-3xl font-light text-white leading-tight animate-fade-in"
              >
                {slides[activeSlide].title}
              </p>
              <p
                key={`sub-${activeSlide}`}
                className="font-display text-2xl md:text-3xl font-bold text-violet-400 leading-tight animate-fade-in"
              >
                {slides[activeSlide].subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeSlide === i
                      ? "w-8 bg-violet-400 shadow-sm"
                      : "w-2.5 bg-white/30 hover:bg-white/60"
                  }`}
                  title={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Glass Card: Sign-In Form */}
        <div className="relative rounded-[2rem] overflow-hidden h-[580px] lg:h-[620px] p-8 md:p-10 flex flex-col justify-between border border-zinc-800 shadow-[0_25px_60px_rgba(0,0,0,0.85)] bg-zinc-900/95 backdrop-blur-2xl transition-all duration-300 hover:border-violet-500/30">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-300 uppercase tracking-widest mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Student Authentication</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">
              Sign in to account
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Enter your credentials to access your student music profile.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5 my-auto py-1">
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold text-center animate-in fade-in duration-200">
                {errorMsg}
              </div>
            )}

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full bg-zinc-800/80 hover:bg-zinc-800 focus:bg-zinc-800 border border-zinc-700/70 rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-all"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full bg-zinc-800/80 hover:bg-zinc-800 focus:bg-zinc-800 border border-zinc-700/70 rounded-xl py-2.5 px-4 pr-10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-violet-600 focus:ring-violet-500 accent-violet-600 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Password reset instructions sent to your email.");
                }}
                className="text-zinc-400 hover:text-white hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-b from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 border-t border-violet-400/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>

            <div className="relative flex items-center justify-center py-0.5">
              <div className="w-full border-t border-zinc-800" />
              <span className="absolute px-3 bg-zinc-900 text-[10px] text-zinc-500 uppercase tracking-wider">
                Or
              </span>
            </div>

            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-medium text-zinc-200 hover:text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <span className="font-bold text-[#ea4335]">G</span>
                <span>Continue with Google</span>
              </button>
            </div>
          </form>

          <div className="pt-2 text-center text-xs text-zinc-400 space-y-1.5">
            <p className="text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4 transition-colors ml-1"
              >
                Sign up
              </Link>
            </p>
            <p className="text-[11px] text-zinc-500 leading-relaxed max-w-xs mx-auto">
              By signing in you agree to our Privacy Policy and Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}