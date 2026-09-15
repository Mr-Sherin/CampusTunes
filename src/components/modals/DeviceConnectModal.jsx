"use client";

import React, { useState } from "react";
import { X, Laptop, Smartphone, Speaker, Radio, Check, Volume2, Wifi, Sparkles } from "lucide-react";

export function DeviceConnectModal({ isOpen, onClose }) {
  const [selectedDevice, setSelectedDevice] = useState("device-web");
  const [devices, setDevices] = useState([
    {
      id: "device-web",
      name: "This Computer (Web Browser)",
      type: "computer",
      icon: Laptop,
      status: "Active Device",
      quality: "Lossless 24-bit / 48kHz",
      battery: null,
    },
    {
      id: "device-hostel-bt",
      name: "Hostel Beats Studio (Bluetooth)",
      type: "speaker",
      icon: Speaker,
      status: "Nearby • Ready to stream",
      quality: "High Definition 320kbps",
      battery: "85%",
    },
    {
      id: "device-phone",
      name: "Student Mobile App (AirPlay / Cast)",
      type: "phone",
      icon: Smartphone,
      status: "Campus WiFi Connected",
      quality: "Standard 256kbps",
      battery: "92%",
    },
    {
      id: "device-campus-hub",
      name: "Auditorium Main Sound Hub",
      type: "hub",
      icon: Radio,
      status: "Campus Network • Open",
      quality: "Studio Master 96kHz",
      battery: null,
    },
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 select-none">
      <div className="bg-[#0b0a16] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-[0_30px_90px_rgba(0,0,0,0.95)] relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Wifi size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Connect to a Device</h3>
              <p className="text-xs text-on-surface-variant">Stream audio across your campus devices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-on-surface-variant hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Active Output */}
        <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-primary/15 via-cyan-500/10 to-transparent border border-primary/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-violet-300 font-semibold block">
                Current Output
              </span>
              <p className="text-sm font-bold text-white">
                {devices.find((d) => d.id === selectedDevice)?.name}
              </p>
            </div>
          </div>
          <Volume2 size={18} className="text-cyan-400" />
        </div>

        {/* Device List */}
        <div className="space-y-2.5 max-h-[280px] overflow-y-auto [scrollbar-width:none]">
          <span className="text-xs font-semibold text-on-surface-variant px-1 block mb-1">
            Available Devices
          </span>
          {devices.map((device) => {
            const Icon = device.icon;
            const isSelected = selectedDevice === device.id;
            return (
              <button
                key={device.id}
                onClick={() => setSelectedDevice(device.id)}
                className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left cursor-pointer ${
                  isSelected
                    ? "bg-white/[0.08] border-primary/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/15"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "bg-white/5 text-on-surface-variant border border-white/10"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${isSelected ? "text-white" : "text-white/80"}`}>
                      {device.name}
                    </p>
                    <p className="text-xs text-on-surface-variant flex items-center gap-2">
                      <span>{device.status}</span>
                      {device.battery && (
                        <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] text-cyan-300">
                          {device.battery}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.8)]">
                    <Check size={14} />
                  </div>
                ) : (
                  <span className="text-[11px] text-on-surface-variant hover:text-white shrink-0">
                    Connect
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-on-surface-variant">
          <span className="flex items-center gap-1 text-[11px]">
            <Sparkles size={12} className="text-primary" /> Campus Cast Link
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
