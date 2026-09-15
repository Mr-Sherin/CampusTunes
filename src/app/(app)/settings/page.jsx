"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Camera,
  Check,
  Save,
  Loader2,
  ShieldCheck,
  Building,
  GraduationCap,
  Sparkles,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";

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

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, profile, refreshProfile, isLoading: isAuthLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [semester, setSemester] = useState(SEMESTERS[0]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
      if (profile.department) setDepartment(profile.department);
      if (profile.semester) setSemester(profile.semester);
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setStatusMessage({ text: "", type: "" });

    try {
      let finalAvatarUrl = avatarUrl;

      // 1. Upload new avatar if selected
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, { upsert: true });

        if (!uploadErr) {
          const { data: pubData } = supabase.storage.from("avatars").getPublicUrl(filePath);
          finalAvatarUrl = pubData.publicUrl;
        }
      }

      // 2. Update profile record in Supabase (cannot change role or username)
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          bio: bio.trim(),
          department,
          semester,
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateErr) throw updateErr;

      await refreshProfile();
      setStatusMessage({ text: "Profile settings updated successfully!", type: "success" });
      setTimeout(() => setStatusMessage({ text: "", type: "" }), 3500);
    } catch (err) {
      console.error("Save profile error:", err);
      setStatusMessage({ text: `Update failed: ${err.message}`, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="text-violet-500 animate-spin" />
        <p className="text-xs text-zinc-400 font-medium">Loading account settings...</p>
      </div>
    );
  }

  if (!user) {
    router.replace("/login?redirectTo=/settings");
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage your public student profile and campus details
          </p>
        </div>

        {profile?.username && (
          <Link
            href={`/profile/${profile.username}`}
            className="px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-all cursor-pointer border border-zinc-700"
          >
            View Public Profile →
          </Link>
        )}
      </div>

      {statusMessage.text && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold text-center animate-in fade-in duration-200 ${
            statusMessage.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
              : "bg-red-500/15 border border-red-500/30 text-red-300"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-xl"
      >
        {/* Avatar Section */}
        <div className="flex items-center gap-5 pb-6 border-b border-zinc-800">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-violet-500/30 shrink-0">
            <Image
              src={
                avatarPreview ||
                avatarUrl ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
              }
              alt="Avatar"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 hover:bg-black/70 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              title="Change profile picture"
            >
              <Camera size={20} />
            </button>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">Profile Photo</h3>
            <p className="text-xs text-zinc-400">
              Recommended: Square JPG or PNG, at least 400x400px.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors pt-1 cursor-pointer"
            >
              Upload New Photo
            </button>
          </div>
        </div>

        {/* Read-Only Account Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-zinc-800">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
              Unique Username (Handle)
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800/40 border border-zinc-800 text-xs font-mono text-zinc-400 select-all">
              <span>@{profile?.username || "student"}</span>
              <Lock size={12} className="ml-auto text-zinc-600" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
              Student Email
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800/40 border border-zinc-800 text-xs text-zinc-400 select-all">
              <span>{user.email}</span>
              <Lock size={12} className="ml-auto text-zinc-600" />
            </div>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-zinc-800/80 border border-zinc-700/80 rounded-xl py-2 px-3.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-zinc-800/80 border border-zinc-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-zinc-900 text-white">
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-zinc-800/80 border border-zinc-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem} className="bg-zinc-900 text-white">
                    {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              Bio & Musical Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell fellow students about your music, instruments, or bands..."
              className="w-full bg-zinc-800/80 border border-zinc-700/80 rounded-xl py-2 px-3.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-[0_4px_15px_rgba(124,58,237,0.35)] disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
