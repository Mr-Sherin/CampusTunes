"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Music,
  Radio,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  Search,
  Check,
  X,
  Lock,
  ArrowRight,
  ExternalLink,
  Sliders,
  GraduationCap,
  Play,
  Pause,
  Loader2,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, profile, role, isAdmin, isLoading: isAuthLoading } = useAuth();
  const { currentSong, isPlaying, setCurrentSong, setIsPlaying } = usePlayerStore();

  const [activeTab, setActiveTab] = useState("moderation");
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSongs: 0,
    totalPlays: 0,
    pendingSongs: 0,
    activeReports: 0,
  });

  const [songs, setSongs] = useState([]);
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadAdminData = async () => {
    setIsLoadingData(true);
    try {
      // 1. Fetch Students
      const { data: profilesData, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      // 2. Fetch All Songs (including pending and rejected)
      const { data: songsData, error: songsErr } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false });

      // 3. Fetch Reports
      const { data: reportsData, error: reportsErr } = await supabase
        .from("reports")
        .select("*, profiles:reporter_id(full_name, username), songs:song_id(title, artist_name)")
        .order("created_at", { ascending: false });

      const allProfiles = profilesData || [];
      const allSongs = songsData || [];
      const allReports = reportsData || [];

      setStudents(allProfiles);
      setSongs(allSongs);
      setReports(allReports);

      // Compute aggregates
      const totalPlays = allSongs.reduce((sum, s) => sum + (Number(s.play_count) || 0), 0);
      const pendingSongs = allSongs.filter((s) => s.status === "pending").length;
      const activeReports = allReports.filter((r) => r.status === "pending").length;

      setStats({
        totalStudents: allProfiles.length,
        totalSongs: allSongs.length,
        totalPlays,
        pendingSongs,
        activeReports,
      });
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    const isDesignatedAdmin = user?.email?.toLowerCase() === "mizpam54@gmail.com";
    if (!isAuthLoading && (isAdmin || isDesignatedAdmin)) {
      loadAdminData();
    }
  }, [isAuthLoading, isAdmin, user]);

  // Song status actions
  const handleUpdateSongStatus = async (songId, newStatus) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("songs")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", songId);

      if (error) throw error;

      setActionMessage(`Track status changed to "${newStatus}".`);
      setTimeout(() => setActionMessage(""), 3000);
      await loadAdminData();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Song deletion action
  const handleDeleteSong = async (songId, title) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase.from("songs").delete().eq("id", songId);

      if (error) throw error;

      setActionMessage(`Song "${title}" was permanently removed.`);
      setTimeout(() => setActionMessage(""), 3000);
      await loadAdminData();
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Report status actions
  const handleResolveReport = async (reportId, newStatus) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status: newStatus })
        .eq("id", reportId);

      if (error) throw error;

      setActionMessage(`Report marked as "${newStatus}".`);
      setTimeout(() => setActionMessage(""), 3000);
      await loadAdminData();
    } catch (err) {
      alert(`Report action failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // -------------------------------------------------------------
  // ACCESS DENIED / UNAUTHORIZED BARRIER (Zero Bypass)
  // -------------------------------------------------------------
  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="text-violet-500 animate-spin" />
        <p className="text-xs text-zinc-400 font-medium">Verifying administrator credentials...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-zinc-950/90 backdrop-blur-xl p-8 text-center space-y-4 shadow-[0_20px_50px_rgba(239,68,68,0.15)]">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <Lock size={30} />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold tracking-widest text-red-400 uppercase font-mono">
              SECURITY PROTOCOL 403
            </span>
            <h2 className="text-2xl font-black text-white">Access Denied</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The CampusTunes Administration Control Center is strictly restricted to verified campus administrators.
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-2.5">
            <Link
              href="/"
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all hover:scale-[1.01]"
            >
              Return to Campus Discover
            </Link>
            {!user && (
              <Link
                href="/login?redirectTo=/admin"
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all"
              >
                Sign in with Admin Account
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Filtered lists
  const filteredSongs = songs.filter(
    (s) =>
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(
    (st) =>
      st.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 select-none">
      {/* 1. Admin Header */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-[#100d1c] to-zinc-900 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck size={13} />
              <span>Campus Control Center</span>
            </span>
            <span className="text-xs text-zinc-400 font-mono">Logged as {profile?.full_name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Administrator Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAdminData}
            disabled={isLoadingData || isProcessing}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-zinc-700 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoadingData ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </section>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center animate-in fade-in duration-200">
          {actionMessage}
        </div>
      )}

      {/* 2. Key Metrics Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Students</span>
            <Users size={16} className="text-violet-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.totalStudents}</p>
          <p className="text-[10px] text-zinc-500">Registered campus accounts</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Songs</span>
            <Music size={16} className="text-violet-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.totalSongs}</p>
          <p className="text-[10px] text-zinc-500">Original student releases</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Plays</span>
            <Radio size={16} className="text-violet-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.totalPlays.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-500">Streamed audio sessions</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Review</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{stats.pendingSongs}</p>
          <p className="text-[10px] text-zinc-500">Awaiting audio approval</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Reports</span>
            <AlertTriangle size={16} className="text-red-400" />
          </div>
          <p className="text-2xl font-black text-red-400">{stats.activeReports}</p>
          <p className="text-[10px] text-zinc-500">Flagged content alerts</p>
        </div>
      </section>

      {/* 3. Navigation Tabs & Search */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("moderation")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "moderation"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300"
              }`}
            >
              Song Moderation ({songs.length})
            </button>

            <button
              onClick={() => setActiveTab("students")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "students"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300"
              }`}
            >
              Student Directory ({students.length})
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "reports"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300"
              }`}
            >
              Reports ({reports.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search table..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* TAB 1: SONG MODERATION */}
        {activeTab === "moderation" && (
          <div className="space-y-3">
            {filteredSongs.length === 0 ? (
              <p className="text-xs text-zinc-500 py-8 text-center">No songs match your query.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-900/30">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="p-3.5">Track</th>
                      <th className="p-3.5">Artist & Dept</th>
                      <th className="p-3.5">Genre</th>
                      <th className="p-3.5">Streams</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredSongs.map((s) => {
                      const isCurrent = currentSong?.id === s.id;
                      const isTrackPlaying = isCurrent && isPlaying;

                      return (
                        <tr key={s.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="p-3.5 flex items-center gap-3">
                            <button
                              onClick={() => {
                                if (isCurrent) {
                                  setIsPlaying(!isPlaying);
                                } else {
                                  setCurrentSong({
                                    id: s.id,
                                    title: s.title,
                                    artist: s.artist_name,
                                    coverUrl: s.cover_url,
                                    audioUrl: s.audio_url,
                                    duration: s.duration || 180,
                                    source: "campus",
                                  });
                                }
                              }}
                              className="w-8 h-8 rounded-lg bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                            >
                              {isTrackPlaying ? (
                                <Pause size={14} />
                              ) : (
                                <Play size={14} fill="currentColor" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate">{s.title}</p>
                              <p className="text-[10px] text-zinc-500">
                                {new Date(s.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <p className="font-medium text-white">{s.artist_name}</p>
                          </td>

                          <td className="p-3.5 text-zinc-400">{s.genre}</td>

                          <td className="p-3.5 font-mono text-zinc-300">
                            {Number(s.play_count || 0).toLocaleString()}
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                s.status === "published"
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                  : s.status === "pending"
                                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                  : "bg-red-500/15 text-red-300 border border-red-500/30"
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>

                          <td className="p-3.5 text-right space-x-1.5">
                            {s.status !== "published" && (
                              <button
                                onClick={() => handleUpdateSongStatus(s.id, "published")}
                                title="Approve & Publish"
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer"
                              >
                                Approve
                              </button>
                            )}

                            {s.status !== "rejected" && (
                              <button
                                onClick={() => handleUpdateSongStatus(s.id, "rejected")}
                                title="Reject"
                                className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer"
                              >
                                Reject
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteSong(s.id, s.title)}
                              title="Delete permanently"
                              className="p-1 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white transition-all cursor-pointer inline-flex items-center justify-center align-middle"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STUDENT DIRECTORY */}
        {activeTab === "students" && (
          <div className="space-y-3">
            {filteredStudents.length === 0 ? (
              <p className="text-xs text-zinc-500 py-8 text-center">No students match your query.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-900/30">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="p-3.5">Student</th>
                      <th className="p-3.5">Username</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Semester</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5 text-right">Profile Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="p-3.5 flex items-center gap-2.5">
                          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                            <Image
                              src={st.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80"}
                              alt={st.full_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-semibold text-white">{st.full_name}</span>
                        </td>

                        <td className="p-3.5 font-mono text-zinc-400">@{st.username}</td>
                        <td className="p-3.5 text-zinc-300">{st.email}</td>
                        <td className="p-3.5 text-zinc-300">{st.department || "General"}</td>
                        <td className="p-3.5 text-zinc-400">{st.semester || "Semester 1"}</td>

                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              st.role === "admin"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                            }`}
                          >
                            {st.role}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <Link
                            href={`/profile/${st.username}`}
                            className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 font-semibold text-[11px]"
                          >
                            <span>View</span>
                            <ExternalLink size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONTENT REPORTS */}
        {activeTab === "reports" && (
          <div className="space-y-3">
            {reports.length === 0 ? (
              <p className="text-xs text-zinc-500 py-8 text-center">No reports filed. All clean!</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-900/30">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="p-3.5">Reported Song</th>
                      <th className="p-3.5">Reporter</th>
                      <th className="p-3.5">Reason & Details</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Resolution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {reports.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="p-3.5 font-semibold text-white">
                          {r.songs?.title || "Song Record"}
                        </td>
                        <td className="p-3.5 text-zinc-300">
                          {r.profiles?.full_name ? `@${r.profiles.username}` : "Anonymous"}
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-red-300">{r.reason}</p>
                          {r.description && (
                            <p className="text-[11px] text-zinc-400 mt-0.5">{r.description}</p>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              r.status === "pending"
                                ? "bg-red-500/15 text-red-300 border border-red-500/30"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          {r.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleResolveReport(r.id, "reviewed")}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer"
                              >
                                Resolve
                              </button>
                              <button
                                onClick={() => handleResolveReport(r.id, "dismissed")}
                                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold transition-all cursor-pointer"
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
