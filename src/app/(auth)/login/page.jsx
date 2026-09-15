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
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80"
  },
  {
    title: "Dorm Studios",
    subtitle: "United in Sound",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&q=80"
  },
  {
    title: "Student Beats",
    subtitle: "Drop Your Track",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80"
  }];


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
        password
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      router.push("/");
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
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) setErrorMsg(error.message);
    } catch {
      setErrorMsg("Failed to initiate Google sign in.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060510] p-4 md:p-8 lg:p-12 relative overflow-hidden select-none">
      {/* Dynamic Multi-Color Ambient Mesh Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[650px] h-[650px] bg-gradient-to-br from-purple-600/25 via-violet-800/15 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-1/4 -right-24 w-[600px] h-[600px] bg-gradient-to-bl from-cyan-500/20 via-blue-700/10 to-transparent rounded-full blur-[150px]" />
        <div className="absolute -bottom-32 left-1/3 w-[550px] h-[550px] bg-gradient-to-t from-pink-600/15 via-purple-900/15 to-transparent rounded-full blur-[160px]" />
      </div>

      <AuthDoodles />

      {/* Main Two-Card Side-by-Side Wrapper */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Interactive Carousel Card */}
        <div className="relative rounded-[2rem] overflow-hidden min-h-[520px] lg:min-h-[580px] p-8 md:p-10 flex flex-col justify-between border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-[#0d0c1c]/80 backdrop-blur-2xl group transition-all duration-500 hover:border-violet-500/30">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none z-10" />

          {slides.map((s, index) =>
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            activeSlide === index ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"}`
            }>
            
              <Image
              src={s.image}
              alt={s.title}
              fill
              className="object-cover brightness-75"
              priority={index === 0} />
            
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07060e] via-black/35 to-transparent z-10" />

          {/* Top Row: Logo & Back to Website Link */}
          <div className="relative z-20 flex items-center justify-between">
            <CampusLogo size={34} showText={false} />
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-full bg-black/50 hover:bg-black/70 border border-white/15 text-xs font-medium text-white/80 hover:text-white transition-all backdrop-blur-md shadow-sm hover:scale-105 active:scale-95">
              
              Back to website →
            </Link>
          </div>

          {/* Bottom Row: Animated Headline synced with Image Slide */}
          <div className="relative z-20 space-y-4">
            <div className="min-h-[70px]">
              <p
                key={`title-${activeSlide}`}
                className="font-display text-2xl md:text-3xl font-light text-white leading-tight animate-fade-in">
                
                {slides[activeSlide].title}
              </p>
              <p
                key={`sub-${activeSlide}`}
                className="font-display text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-cyan-300 leading-tight animate-fade-in">
                
                {slides[activeSlide].subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              {slides.map((_, i) =>
              <button
                key={i}
                type="button"
                onClick={() => setActiveSlide(i)}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                activeSlide === i ?
                "w-10 bg-gradient-to-r from-primary to-cyan-400 shadow-[0_0_12px_rgba(168,85,247,0.8)]" :
                "w-3 bg-white/30 hover:bg-white/60"}`
                }
                title={`Go to slide ${i + 1}`} />

              )}
            </div>
          </div>
        </div>

        {/* Right Glass Card: Sign-In Form */}
        <div className="relative rounded-[2rem] overflow-hidden min-h-[520px] lg:min-h-[580px] p-8 md:p-10 flex flex-col justify-between border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-[#0d0c1c]/90 backdrop-blur-2xl transition-all duration-500 hover:border-violet-500/30">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
          <div>
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">
              Sign in to account
            </h1>
            <p className="text-xs text-on-surface-variant mt-1.5">
              Enter your credentials to access your student music profile.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            {errorMsg &&
            <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold text-center">
                {errorMsg}
              </div>
            }

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full bg-[#161528] hover:bg-[#1b1a32] focus:bg-[#1b1a32] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500 transition-all" />
              
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full bg-[#161528] hover:bg-[#1b1a32] focus:bg-[#1b1a32] border border-white/10 rounded-xl py-3 px-4 pr-10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500 transition-all" />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer">
                
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-on-surface-variant pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary accent-primary cursor-pointer" />
                
                <span>Remember me</span>
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Password reset instructions sent to your email.");
                }}
                className="text-white/60 hover:text-white hover:underline">
                
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-[#5b40b2] hover:bg-[#6c4ecf] transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-violet-950/50 disabled:opacity-60">
              
              {isLoading ?
              <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing in...</span>
                </> :

              <span>Sign in</span>
              }
            </button>

            <div className="relative flex items-center justify-center py-1">
              <div className="w-full border-t border-white/10" />
              <span className="absolute px-3 bg-[#0d0c1c] text-[11px] text-white/40 uppercase">
                Or
              </span>
            </div>

            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 rounded-xl bg-[#161528] hover:bg-[#1f1e38] border border-white/10 text-xs font-medium text-white/80 hover:text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer">
                
                <span className="font-bold text-[#ea4335]">G</span>
                <span>Continue with Google</span>
              </button>
            </div>
          </form>

          <div className="pt-2 text-center text-xs text-on-surface-variant space-y-1.5">
            <p className="text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-white hover:text-cyan-400 font-semibold underline underline-offset-4 transition-colors ml-1">
                
                Sign up
              </Link>
            </p>
            <p className="text-[11px] text-white/40 leading-relaxed max-w-xs mx-auto">
              By signing in you agree to our Privacy Policy and Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>);

}