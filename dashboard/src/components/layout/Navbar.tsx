/**
 * Navbar — top bar showing current page title + status indicators.
 */

import { useLocation } from "react-router-dom";
import { Bell, Circle } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/":            "Home",
  "/dashboard":   "Dashboard",
  "/detect":      "Detection & Risk Assessment",
  "/dataset":     "Dataset Overview",
  "/methodology": "Methodology",
  "/about":       "About",
};

export default function Navbar() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? "Road AI System";

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06] bg-[#0d1117]/80 backdrop-blur-md flex-shrink-0 z-10">
      {/* Page title — padded on mobile to clear hamburger */}
      <h1 className="text-sm font-semibold text-slate-200 pl-10 lg:pl-0 tracking-wide">
        {title}
      </h1>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        {/* System status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Circle size={7} className="fill-emerald-400 text-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">System Online</span>
        </div>

        {/* Notification bell */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-200" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shadow-md cursor-pointer select-none">
          AI
        </div>
      </div>
    </header>
  );
}
