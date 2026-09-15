"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomPlayer } from "@/components/layout/BottomPlayer";
import { RightPanel } from "@/components/layout/RightPanel";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#07060e] text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Scrollable Center Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </main>

        {/* Right Active Track Details */}
        <RightPanel />
      </div>

      {/* Fixed Bottom Audio Player */}
      <BottomPlayer />
    </div>
  );
}
