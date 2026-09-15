"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Upload,
  Headphones,
  CheckCircle2,
  X,
  FileAudio,
  ImageIcon,
  Loader2,
  Plus,
  Play,
  Pause,
  Sparkles,
  Building,
  Tag,
  ShieldCheck,
  Disc,
  Trash2,
  Lock,
  LogIn,
  ArrowRight,
  Sliders,
  Radio,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

const CAMPUS_GENRES = [
  "Malayalam Indie",
  "College Rock",
  "Hip-Hop & Rap",
  "Lo-Fi Study",
  "Acoustic & Unplugged",
  "Electronic & EDM",
  "Folk Fusion",
  "Classical & Raga",
];

const RELEASE_TYPES = [
  "Single",
  "Dorm Jam / Demo",
  "Live Campus Recording",
  "Acoustic Session",
  "Remix / Beat",
];

const CAMPUS_DEPARTMENTS = [
  "Campus Music Club / College Band",
  "Computer Science & Engg (CSE)",
  "Electronics & Communication (ECE)",
  "Mechanical Engineering (ME)",
  "Civil Engineering (CE)",
  "Electrical & Electronics (EEE)",
  "Information Technology (IT)",
  "Dorm & Hostel Jam Sessions",
  "Campus Cultural Committee",
  "Independent Student Musician",
];

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Metadata Form State
  const [songTitle, setSongTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [genre, setGenre] = useState("Malayalam Indie");
  const [releaseType, setReleaseType] = useState("Single");
  const [department, setDepartment] = useState("Campus Music Club / College Band");
  const [featuredArtists, setFeaturedArtists] = useState("");
  const [isExplicit, setIsExplicit] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(null);

  const [downloadEnabled, setDownloadEnabled] = useState(true);

  // Status & Progress State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [uploadedTracks, setUploadedTracks] = useState([]);

  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const audioPreviewRef = useRef(null);
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);

    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setIsAuthLoading(false);
    }
    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
      setIsAuthLoading(false);
    });

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("upload") === "true") {
        setShowUploadModal(true);
      }
    }

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Handle Audio File Selection & Local Preview
  const handleAudioSelect = (file) => {
    setAudioFile(file);
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
      setAudioPreviewUrl(null);
    }
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioPreviewUrl(url);
    }
  };

  // Handle Cover Artwork Selection & Local Preview
  const handleCoverSelect = (file) => {
    setCoverFile(file);
    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl);
      setCoverPreviewUrl(null);
    }
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverPreviewUrl(url);
    }
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    };
  }, [audioPreviewUrl, coverPreviewUrl]);

  // Load Tracks uploaded by the logged-in student
  useEffect(() => {
    async function loadTracks() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("songs")
          .select("*")
          .eq("artist_id", user.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setUploadedTracks(data);
        }
      } catch (e) {
        console.error("Error loading tracks:", e);
      }
    }

    loadTracks();
  }, [supabase, user, uploadSuccess]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!songTitle.trim()) {
      setUploadError("Please provide a track title.");
      return;
    }
    if (!audioFile) {
      setUploadError("Please select a high-fidelity audio master file (MP3/WAV/FLAC).");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadStep("Uploading audio master to secure storage...");

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        throw new Error("You must be signed in as an authenticated student to publish music.");
      }

      // 1. Upload audio file
      const audioExt = audioFile.name.split(".").pop();
      const audioPath = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${audioExt}`;
      const { error: audioUploadErr } = await supabase.storage
        .from("songs")
        .upload(audioPath, audioFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (audioUploadErr) {
        throw new Error(`Audio upload failed: ${audioUploadErr.message}`);
      }

      const { data: audioUrlData } = supabase.storage.from("songs").getPublicUrl(audioPath);
      const audioUrl = audioUrlData.publicUrl;

      // 2. Upload cover artwork if provided
      setUploadStep("Processing official release artwork...");
      let coverUrl = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80";
      if (coverFile) {
        const coverExt = coverFile.name.split(".").pop();
        const coverPath = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${coverExt}`;
        const { error: coverUploadErr } = await supabase.storage
          .from("covers")
          .upload(coverPath, coverFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (!coverUploadErr) {
          const { data: coverUrlData } = supabase.storage.from("covers").getPublicUrl(coverPath);
          coverUrl = coverUrlData.publicUrl;
        }
      }

      // 3. Register Record in Supabase DB (derived artist_id from auth.user)
      setUploadStep("Publishing to CampusTunes Student Showcase...");
      const fullArtistDisplay = featuredArtists.trim()
        ? `${artistName || "Student Artist"} ft. ${featuredArtists}`
        : artistName || "Student Artist";

      const { data: songRecord, error: songInsertErr } = await supabase
        .from("songs")
        .insert({
          title: songTitle.trim(),
          artist_id: user.id,
          artist_name: fullArtistDisplay,
          description: `${department} • ${releaseType}`,
          genre: genre,
          audio_url: audioUrl,
          cover_url: coverUrl,
          duration: 180,
          download_enabled: downloadEnabled,
          status: "published",
        })
        .select()
        .single();

      if (songInsertErr) {
        throw new Error(`Database record creation failed: ${songInsertErr.message}`);
      }

      // 4. Success Reset
      setUploadSuccess(true);
      setShowUploadModal(false);
      setSongTitle("");
      setArtistName("");
      setFeaturedArtists("");
      setAudioFile(null);
      setCoverFile(null);
      setAudioPreviewUrl(null);
      setCoverPreviewUrl(null);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to publish track. Please verify your connection.");
    } finally {
      setIsUploading(false);
      setUploadStep("");
    }
  };

  // Unauthenticated Student Artist Barrier View
  if (!isAuthLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-4 pb-28 px-4 select-none max-w-lg mx-auto">
        <div className="bg-[#0b0a16] border border-white/15 rounded-3xl w-full p-6 sm:p-7 text-center space-y-4 sm:space-y-5 shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Icon Badge */}
          <div className="relative pt-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-primary to-cyan-500 p-0.5 mx-auto shadow-[0_0_30px_rgba(168,85,247,0.35)]">
              <div className="w-full h-full bg-[#0c0a18] rounded-[14px] flex items-center justify-center text-white">
                <Radio size={24} className="text-violet-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              </div>
            </div>
          </div>

          {/* Header Texts */}
          <div className="space-y-1.5 relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold tracking-widest text-violet-300 uppercase">
              <ShieldCheck size={12} className="text-cyan-400" />
              <span>Campus Artist Studio</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              Artist Studio Access
            </h2>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
              Sign in with your student account to upload master audio, distribute original releases, and manage your campus catalog.
            </p>
          </div>

          {/* Feature Highlights Card */}
          <div className="p-3.5 rounded-2xl bg-[#121024] border border-white/[0.08] text-left space-y-2.5 text-xs text-white/85 max-w-sm mx-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                <Upload size={13} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-xs">Direct Audio Distribution</p>
                <p className="text-[10px] text-on-surface-variant">Publish singles, demos, and live campus recordings.</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <Building size={13} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-xs">Department & Band Tagging</p>
                <p className="text-[10px] text-on-surface-variant">Tag your engineering dept or college music band.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1 max-w-sm mx-auto">
            <Link
              href="/login"
              className="flex-1 py-2.5 px-5 rounded-full bg-gradient-to-r from-violet-600 via-primary to-cyan-500 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-transform active:scale-98 cursor-pointer"
            >
              <LogIn size={14} /> Sign In
            </Link>
            <Link
              href="/signup"
              className="flex-1 py-2.5 px-5 rounded-full bg-white/[0.06] hover:bg-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
            >
              Create Account <ArrowRight size={13} className="text-white/60" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16 select-none max-w-7xl mx-auto">
      {/* Header & Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">Artist Studio</h1>
            <span className="text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-violet-400" /> Student Creator Hub
            </span>
          </div>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Distribute, broadcast, and track original campus tracks and dorm productions.
          </p>
        </div>

        <button
          onClick={() => {
            setShowUploadModal(true);
            setUploadError("");
            setUploadSuccess(false);
          }}
          className="bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-full px-7 py-3 flex items-center justify-center gap-2.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Upload size={18} />
          <span>Upload Original Track</span>
        </button>
      </div>

      {uploadSuccess && (
        <div className="p-4 rounded-2xl bg-violet-500/15 border border-violet-500/40 text-violet-200 text-xs md:text-sm font-semibold flex items-center justify-between shadow-lg shadow-violet-950/40">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-violet-400" />
            Track published successfully to CampusTunes!
          </span>
          <Link href="/campus" className="underline font-bold text-white hover:text-violet-300 transition-colors">
            View on Student Showcase →
          </Link>
        </div>
      )}

      {/* Published Tracks Catalog */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              Your Uploaded Catalog ({uploadedTracks.length})
            </h2>
            <p className="text-xs text-zinc-400">Live streaming releases distributed to the campus</p>
          </div>
          <Link href="/campus" className="text-xs text-violet-400 font-bold hover:underline flex items-center gap-1">
            <span>Explore Student Showcase</span> →
          </Link>
        </div>

        {uploadedTracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedTracks.map((track, idx) => (
              <div
                key={track.id || idx}
                className="flex items-center gap-4 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-violet-500/40 transition-all shadow-md group hover:-translate-y-0.5"
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-zinc-800 bg-zinc-800">
                  <Image
                    src={track.cover_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"}
                    alt={track.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white truncate">{track.title}</h4>
                  <p className="text-xs text-zinc-400 truncate">{track.artist_name || track.artist}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
                        track.status === "published"
                          ? "text-emerald-300 bg-emerald-500/10 border border-emerald-500/20"
                          : "text-amber-300 bg-amber-500/10 border border-amber-500/20"
                      }`}
                    >
                      {track.status || "published"}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium truncate">
                      {track.genre || "Campus Track"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!confirm(`Are you sure you want to delete "${track.title}"?`)) return;
                    try {
                      await supabase.from("songs").delete().eq("id", track.id);
                      setUploadedTracks((prev) => prev.filter((t) => t.id !== track.id));
                    } catch (err) {
                      console.error("Failed to delete song:", err);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                  title="Delete track"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl p-12 text-center border border-zinc-800 bg-zinc-900/60 space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mx-auto shadow-sm">
              <FileAudio size={32} />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="font-display font-bold text-lg text-white">No Tracks Uploaded Yet</h3>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                Ready to share your original student tracks, dorm jams, or beats? Publish your audio master to get discovered across campus.
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
            >
              <Plus size={16} /> Upload First Track
            </button>
          </div>
        )}
      </section>

      {/* Professional Track Distribution Modal */}
      {isMounted &&
        showUploadModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-10 z-[9999] animate-in fade-in duration-200">
            <div className="bg-[#0e0d1f] border border-white/20 rounded-3xl max-w-3xl w-full max-h-[86vh] flex flex-col shadow-[0_30px_90px_rgba(0,0,0,0.98)] relative overflow-hidden zoom-in-95 duration-200">
              {/* 1. Modal Header (Sticky Top) */}
              <div className="p-5 md:p-6 pb-4 border-b border-white/10 shrink-0 flex items-start justify-between gap-4 bg-[#0e0d1f]/95 z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
                      Master Audio Distribution
                    </span>
                  </div>
                  <h2 className="font-display text-xl md:text-2xl font-black text-white mt-1">
                    Upload Original Track
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Broadcast your original demo, acoustic song, or beat directly to the CampusTunes streaming network.
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => {
                    if (!isUploading) setShowUploadModal(false);
                  }}
                  className="text-on-surface-variant hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  title="Close dialog"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 2. Modal Body (Scrollable Form) */}
              <form id="upload-track-form" onSubmit={handleUploadSubmit} className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1 [scrollbar-width:thin]">
                {uploadError && (
                  <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold">
                    {uploadError}
                  </div>
                )}

                {/* 2-Column Studio Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Left Column: Cover Artwork Dropzone (4 Cols) */}
                  <div className="md:col-span-4 space-y-2">
                    <label className="block text-xs font-bold text-violet-200 uppercase tracking-wider">
                      Release Artwork
                    </label>
                    <input
                      type="file"
                      ref={coverInputRef}
                      accept="image/*"
                      onChange={(e) => handleCoverSelect(e.target.files?.[0] || null)}
                      className="hidden"
                    />

                    <div
                      onClick={() => coverInputRef.current?.click()}
                      className="relative w-full aspect-square rounded-2xl border-2 border-dashed border-white/20 hover:border-violet-500/60 transition-all bg-[#141228] flex flex-col items-center justify-center p-3 text-center cursor-pointer group overflow-hidden shadow-inner"
                    >
                      {coverPreviewUrl ? (
                        <>
                          <Image
                            src={coverPreviewUrl}
                            alt="Artwork Preview"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                            <ImageIcon size={22} />
                            <span className="text-[11px] font-bold">Change Artwork</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-secondary mb-2 group-hover:scale-110 transition-transform">
                            <ImageIcon size={20} />
                          </div>
                          <p className="text-xs font-bold text-white">Upload Cover Art</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">1:1 Square (JPG/PNG)</p>
                        </>
                      )}
                    </div>

                    {coverFile && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCoverSelect(null);
                        }}
                        className="text-[11px] text-red-400 hover:underline flex items-center gap-1 mx-auto pt-0.5 cursor-pointer"
                      >
                        <Trash2 size={12} /> Remove artwork
                      </button>
                    )}
                  </div>

                  {/* Right Column: Track Metadata & Credits (8 Cols) */}
                  <div className="md:col-span-8 space-y-3.5">
                    {/* Track Title */}
                    <div>
                      <label className="block text-xs font-bold text-violet-200 uppercase tracking-wider mb-1">
                        Track Title <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        placeholder="Enter track title"
                        required
                        className="w-full bg-[#15132a] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                      />
                    </div>

                    {/* Primary Artist & Collaborators */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-violet-200 uppercase tracking-wider mb-1">
                          Primary Artist / Band <span className="text-primary">*</span>
                        </label>
                        <input
                          type="text"
                          value={artistName}
                          onChange={(e) => setArtistName(e.target.value)}
                          placeholder="Artist or band name"
                          required
                          className="w-full bg-[#15132a] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-violet-200 uppercase tracking-wider mb-1">
                          Featured Artists
                        </label>
                        <input
                          type="text"
                          value={featuredArtists}
                          onChange={(e) => setFeaturedArtists(e.target.value)}
                          placeholder="Featured artists (optional)"
                          className="w-full bg-[#15132a] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                        />
                      </div>
                    </div>

                    {/* Genre & Release Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-violet-200 uppercase tracking-wider mb-1">
                          Genre / Style <span className="text-primary">*</span>
                        </label>
                        <select
                          value={genre}
                          onChange={(e) => setGenre(e.target.value)}
                          className="w-full bg-[#15132a] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-primary cursor-pointer"
                        >
                          {CAMPUS_GENRES.map((g) => (
                            <option key={g} value={g} className="bg-[#121124] text-white">
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-violet-200 uppercase tracking-wider mb-1">
                          Release Format
                        </label>
                        <select
                          value={releaseType}
                          onChange={(e) => setReleaseType(e.target.value)}
                          className="w-full bg-[#15132a] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-primary cursor-pointer"
                        >
                          {RELEASE_TYPES.map((t) => (
                            <option key={t} value={t} className="bg-[#121124] text-white">
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* College Department / Club Affiliation */}
                    <div>
                      <label className="block text-xs font-bold text-violet-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Building size={13} className="text-cyan-400" /> College Department / Campus Club
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-[#15132a] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-primary cursor-pointer"
                      >
                        {CAMPUS_DEPARTMENTS.map((d) => (
                          <option key={d} value={d} className="bg-[#121124] text-white">
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Master Audio File Dropzone with Live Inline Preview Player */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="block text-xs font-bold text-violet-200 uppercase tracking-wider">
                    Audio Master Track (MP3 / WAV / FLAC / M4A) <span className="text-primary">*</span>
                  </label>
                  <input
                    type="file"
                    ref={audioInputRef}
                    accept="audio/*"
                    onChange={(e) => handleAudioSelect(e.target.files?.[0] || null)}
                    className="hidden"
                  />

                  <div
                    onClick={() => audioInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                      audioFile
                        ? "border-primary/60 bg-primary/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                        : "border-white/15 hover:border-primary/50 bg-[#141228]"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-primary shrink-0 shadow-md">
                          <FileAudio size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate max-w-sm">
                            {audioFile ? audioFile.name : "Click or drop your master audio track"}
                          </p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">
                            {audioFile
                              ? `${(audioFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to stream`
                              : "High fidelity lossless support (MP3, WAV, FLAC, M4A)"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          audioInputRef.current?.click();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/10 shrink-0 transition-colors"
                      >
                        {audioFile ? "Replace Audio" : "Browse File"}
                      </button>
                    </div>

                    {/* Inline Audio Player Preview */}
                    {audioPreviewUrl && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-3 bg-[#0d0c18] p-2.5 rounded-xl"
                      >
                        <audio
                          ref={audioPreviewRef}
                          src={audioPreviewUrl}
                          onPlay={() => setIsPlayingAudio(true)}
                          onPause={() => setIsPlayingAudio(false)}
                          onEnded={() => setIsPlayingAudio(false)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (audioPreviewRef.current) {
                              if (isPlayingAudio) {
                                audioPreviewRef.current.pause();
                              } else {
                                audioPreviewRef.current.play();
                              }
                            }
                          }}
                          className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-md hover:scale-105 transition-transform cursor-pointer"
                        >
                          {isPlayingAudio ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                        </button>
                        <div className="flex-1 text-left">
                          <p className="text-xs font-semibold text-white">Audio Playback Preview</p>
                          <p className="text-[10px] text-cyan-400">Master track verified before distribution</p>
                        </div>
                        <span className="text-[10px] font-mono text-on-surface-variant">Live Preview</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Progress Status Display */}
                {isUploading && (
                  <div className="p-3.5 rounded-2xl bg-violet-950/40 border border-violet-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-violet-200">
                      <span className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-primary" />
                        {uploadStep}
                      </span>
                      <span className="text-cyan-400 font-mono">Processing...</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary via-fuchsia-400 to-cyan-400 animate-pulse w-3/4 rounded-full" />
                    </div>
                  </div>
                )}
              </form>

              {/* 3. Modal Footer (Sticky Bottom Action Bar) */}
              <div className="p-4 md:px-6 border-t border-white/10 bg-[#090814]/95 shrink-0 flex items-center justify-between gap-4 z-10">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isExplicit}
                      onChange={(e) => setIsExplicit(e.target.checked)}
                      className="rounded bg-[#161528] border-white/20 text-primary focus:ring-0"
                    />
                    <span>Explicit Lyrics</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer">
                    <input
                      type="checkbox"
                      checked={downloadEnabled}
                      onChange={(e) => setDownloadEnabled(e.target.checked)}
                      className="rounded bg-[#161528] border-white/20 text-violet-500 focus:ring-0"
                    />
                    <span className="text-zinc-300">Allow Student Downloads</span>
                  </label>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-on-surface-variant hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="upload-track-form"
                    disabled={isUploading}
                    className="px-7 py-2.5 rounded-full text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-sm transition-transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Publish to Showcase</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
