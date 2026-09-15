"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login?redirectTo=/profile");
      return;
    }

    if (profile?.username) {
      router.replace(`/profile/${profile.username}`);
    } else {
      router.replace(`/profile/${user.email?.split("@")[0] || "student"}`);
    }
  }, [user, profile, isLoading, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader2 size={36} className="text-violet-500 animate-spin" />
      <p className="text-xs text-zinc-400 font-medium">Navigating to your student profile...</p>
    </div>
  );
}
