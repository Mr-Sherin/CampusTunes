"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Lock, Heart, ListPlus, Sparkles, X, ArrowRight, LogIn, ShieldCheck } from "lucide-react";
import Link from "next/link";







export function AuthModal({ isOpen, onClose, actionText = "access playlists & saved songs" }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-[9999] animate-in fade-in duration-200 select-none">
      <div className="bg-[#0b0a16] border border-white/15 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.98)] space-y-6 text-center relative zoom-in-95 duration-200 overflow-hidden">
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/50 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer z-10">
          
          <X size={18} />
        </button>

        {/* Brand Shield & Lock Icon */}
        <div className="relative pt-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-primary to-cyan-500 p-0.5 mx-auto shadow-[0_0_35px_rgba(168,85,247,0.4)]">
            <div className="w-full h-full bg-[#0c0a18] rounded-[14px] flex items-center justify-center text-white">
              <Lock size={26} className="text-violet-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            </div>
          </div>
        </div>

        {/* Header Content */}
        <div className="space-y-2 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold tracking-widest text-violet-300 uppercase">
            <ShieldCheck size={12} className="text-cyan-400" />
            <span>Campus Member Access</span>
          </div>
          <h3 className="font-display font-black text-2xl text-white tracking-tight">
            Sign In to Unlock
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed max-w-xs mx-auto">
            Sign in with your student credentials to {actionText} and personalize your stream.
          </p>
        </div>

        {/* Key Features List */}
        <div className="p-3.5 rounded-2xl bg-[#121024] border border-white/[0.08] text-left space-y-2.5 text-xs text-white/80">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
              <Heart size={13} className="fill-pink-400/20" />
            </div>
            <span>Permanent saved & liked track collection</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <ListPlus size={13} />
            </div>
            <span>Unlimited custom student playlists & mixes</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
              <Sparkles size={13} />
            </div>
            <span>Artist studio & campus showcase streaming</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <Link
            href="/login"
            onClick={onClose}
            className="w-full py-3 rounded-full bg-gradient-to-r from-violet-600 via-primary to-cyan-500 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(168,85,247,0.35)] transition-transform active:scale-98 cursor-pointer">
            
            <LogIn size={15} />
            <span>Sign In to Your Account</span>
          </Link>

          <Link
            href="/signup"
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-white/[0.06] hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer">
            
            <span>Create Student Account</span>
            <ArrowRight size={13} className="text-white/60" />
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}