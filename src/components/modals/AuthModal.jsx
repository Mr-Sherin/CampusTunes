"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Lock, Heart, ListPlus, GraduationCap, X, ArrowRight, LogIn, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthModalStore } from "@/store/useAuthModalStore";

export function AuthModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  actionText: propActionText,
} = {}) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const store = useAuthModalStore();

  const isControlled = typeof propIsOpen === "boolean";
  const isOpen = isControlled ? propIsOpen : store.isOpen;
  const onClose = isControlled ? propOnClose : store.closeAuthModal;
  const actionText = propActionText || store.actionText || "access playlists & saved songs";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted) return null;

  const handleDismiss = () => {
    onClose();
    router.push("/");
  };

  return createPortal(
    <div
      onClick={handleDismiss}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-[9999] animate-in fade-in duration-200 select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#121216] border border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] space-y-6 text-center zoom-in-95 duration-200 overflow-hidden cursor-default before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-violet-500/50 before:to-transparent"
      >
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Exit / Close Button (X Mark) */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer z-10"
          title="Exit to Discover"
        >
          <X size={18} />
        </button>

        {/* Brand Shield & Lock Icon */}
        <div className="relative pt-1">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-violet-400 mx-auto shadow-inner">
            <Lock size={22} className="stroke-[2.2]" />
          </div>
        </div>

        {/* Header Content */}
        <div className="space-y-2 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold tracking-widest text-violet-300 uppercase">
            <ShieldCheck size={12} className="text-violet-400" />
            <span>Campus Member Access</span>
          </div>
          <h3 className="font-display font-black text-2xl text-white tracking-tight">
            Sign In to Unlock
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Sign in with your student credentials to {actionText} and personalize your stream.
          </p>
        </div>

        {/* Key Features List */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 text-left space-y-3 text-xs text-zinc-300">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-violet-400 shrink-0">
              <Heart size={14} className="fill-violet-400/20" />
            </div>
            <span className="font-medium">Permanent saved & liked track collection</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-violet-400 shrink-0">
              <ListPlus size={14} />
            </div>
            <span className="font-medium">Unlimited custom student playlists & mixes</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-violet-400 shrink-0">
              <GraduationCap size={14} />
            </div>
            <span className="font-medium">Artist studio & campus showcase streaming</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <Link
            href="/login"
            onClick={onClose}
            className="w-full py-3 rounded-full bg-gradient-to-b from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm border-t border-violet-400/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <LogIn size={15} />
            <span>Sign In to Your Account</span>
          </Link>

          <Link
            href="/signup"
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-zinc-800 transition-colors cursor-pointer"
          >
            <span>Create Student Account</span>
            <ArrowRight size={13} className="text-zinc-400" />
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}