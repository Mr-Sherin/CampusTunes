import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07060e] flex items-center justify-center p-4 selection:bg-primary/30">
      {children}
    </div>
  );
}
