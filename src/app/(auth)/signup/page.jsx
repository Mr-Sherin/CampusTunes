"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { CampusLogo } from "@/components/brand/CampusLogo";
import { AuthDoodles } from "@/components/ui/AuthDoodles";
import { createClient } from "@/utils/supabase/client";

const DEPARTMENTS = [
  "Computer Science & Engg",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical & Electronics",
  "Information Technology",
  "Biotechnology / Applied Sciences",
  "Management / MBA",
  "Independent Campus Musician",
];

const SEMESTERS = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",
  "Postgraduate / Research",
  "Alumni Member",
];

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [semester, setSemester] = useState(SEMESTERS[0]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "Join The Beat",
      subtitle: "Campus-Exclusive Sound",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
    },
    {
      title: "Student Playlists",
      subtitle: "Curated for College Life",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80",
    },
    {
      title: "Share & Showcase",
      subtitle: "Unleash Your Music",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80",
    },
  ];

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleSignUp = async (e) => {
    e.preventDefault();

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

    if (!email || !password || !fullName.trim() || !cleanUsername) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (cleanUsername.length < 3) {
      setErrorMsg("Username must be at least 3 characters (letters, numbers, underscores).");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setErrorMsg("Please agree to the Terms of Service to continue.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      // 1. Check if username is already taken in profiles table
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", cleanUsername)
        .maybeSingle();

      if (existingUser) {
        setErrorMsg("This username is already taken. Please choose another.");
        setIsLoading(false);
        return;
      }

      // 2. Perform Supabase Auth Sign Up
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            username: cleanUsername,
            department,
            semester,
            role: "student", // Strictly student
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      if (data?.user?.identities?.length === 0) {
        setErrorMsg("An account with this email already exists. Please sign in.");
        setIsLoading(false);
        return;
      }

      // If email confirmation is required by Supabase project
      if (data?.session) {
        setSuccessMsg("Account created! Redirecting to campus discover...");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 800);
      } else {
        setSuccessMsg("Success! Please check your email inbox to verify your student account.");
        setIsLoading(false);
      }
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
        <div className="relative rounded-[2rem] overflow-hidden h-[620px] lg:h-[680px] p-8 md:p-10 flex flex-col justify-between border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-[#0d0c1c]/80 backdrop-blur-2xl group transition-all duration-500 hover:border-violet-500/30">
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
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover brightness-75"
                priority={index === 0}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07060e] via-black/40 to-transparent z-10" />

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

        {/* Right Glass Card: Sign-Up Form */}
        <div className="relative rounded-[2rem] overflow-hidden h-[620px] lg:h-[680px] p-6 sm:p-8 md:p-10 flex flex-col justify-between border border-zinc-800 shadow-[0_25px_60px_rgba(0,0,0,0.85)] bg-zinc-900/95 backdrop-blur-2xl transition-all duration-300 hover:border-violet-500/30">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-300 uppercase tracking-widest mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Campus Music Community</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Create student account
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Join your campus tunes community to stream, like, and share.
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-2.5 my-auto py-1">
            {errorMsg && (
              <div className="p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold text-center animate-in fade-in duration-200">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold text-center animate-in fade-in duration-200">
                {successMsg}
              </div>
            )}

            {/* Full Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  required
                  className="w-full bg-zinc-800/80 hover:bg-zinc-800 focus:bg-zinc-800 border border-zinc-700/70 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username (e.g. sherin)"
                  required
                  className="w-full bg-zinc-800/80 hover:bg-zinc-800 focus:bg-zinc-800 border border-zinc-700/70 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            {/* Department & Semester */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-zinc-800/80 hover:bg-zinc-800 focus:bg-zinc-800 border border-zinc-700/70 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept} className="bg-zinc-900 text-white">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full bg-zinc-800/80 hover:bg-zinc-800 focus:bg-zinc-800 border border-zinc-700/70 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
                >
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem} className="bg-zinc-900 text-white">
                      {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Student Email */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Student email address"
                required
                className="w-full bg-zinc-800/80 hover:bg-zinc-800 focus:bg-zinc-800 border border-zinc-700/70 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-all"
              />
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (6+ chars)"
                  required
                  className="w-full bg-zinc-800/80 hover:bg-zinc-800 focus:bg-zinc-800 border border-zinc-700/70 rounded-xl py-2 px-3 pr-8 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="w-full bg-zinc-800/80 hover:bg-zinc-800 focus:bg-zinc-800 border border-zinc-700/70 rounded-xl py-2 px-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400 pt-0.5">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-800 text-violet-600 focus:ring-violet-500 accent-violet-600 cursor-pointer"
              />
              <label htmlFor="terms" className="cursor-pointer text-[11px] text-zinc-400">
                I agree to the <span className="text-violet-400 underline">Terms</span> & <span className="text-violet-400 underline">Privacy Policy</span>.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-b from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 border-t border-violet-400/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating student account...</span>
                </>
              ) : (
                <span>Create student account</span>
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

          <div className="pt-2 text-center text-xs text-zinc-400 space-y-1">
            <p className="text-xs">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4 transition-colors ml-1"
              >
                Sign in
              </Link>
            </p>
            <p className="text-[10px] text-zinc-500 leading-relaxed max-w-xs mx-auto">
              Protected student ecosystem • Instant stream & upload access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
