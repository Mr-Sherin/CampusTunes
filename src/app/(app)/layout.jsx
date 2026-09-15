"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomPlayer } from "@/components/layout/BottomPlayer";
import { RightPanel } from "@/components/layout/RightPanel";
import { AuthModal } from "@/components/modals/AuthModal";

export default function AppLayout({ children }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#09090b] text-white relative">
      {/* Subtle Top Ambient Gradient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[350px] bg-gradient-to-b from-white/[0.03] to-transparent rounded-full blur-[100px]" />
      </div>

      {/* Top Navigation */}
      <Navbar />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Scrollable Center Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden relative z-10">
          {children}
        </main>

        {/* Right Active Track Details */}
        <RightPanel />
      </div>

      {/* Fixed Bottom Audio Player */}
      <BottomPlayer />

      {/* Global Action Barrier Auth Modal */}
      <AuthModal />
    </div>
  );
}
