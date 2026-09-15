import React from "react";

export function AuthDoodles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none bg-[#070709]">
      {/* Deep Atmospheric Studio Stage Lighting */}
      <div 
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-40"
        style={{
          background: "radial-gradient(ellipse at center, rgba(124, 58, 237, 0.25) 0%, rgba(76, 29, 149, 0.12) 45%, transparent 75%)"
        }}
      />
      <div 
        className="absolute bottom-0 right-10 w-[600px] h-[400px] rounded-full blur-[150px] pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)"
        }}
      />

      {/* Subtle Acoustic Studio Frequency Matrix Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px"
        }}
      />

      {/* Elegant Architectural Horizon Line */}
      <div className="absolute top-1/3 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/10 to-transparent pointer-events-none" />
    </div>
  );
}
