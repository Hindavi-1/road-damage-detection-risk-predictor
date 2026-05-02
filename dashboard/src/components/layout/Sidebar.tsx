/**
 * Sidebar — persistent navigation rail with active-state highlighting.
 * Collapses to icon-only on mobile via a toggle.
 */

import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ScanSearch,
  Database,
  BookOpen,
  Info,
  Cpu,
  X,
  Menu,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard",   path: "/dashboard",   icon: <LayoutDashboard size={20} /> },
  { label: "Detect",      path: "/detect",       icon: <ScanSearch      size={20} /> },
  { label: "Dataset",     path: "/dataset",      icon: <Database        size={20} /> },
  { label: "Methodology", path: "/methodology",  icon: <BookOpen        size={20} /> },
  { label: "About",       path: "/about",        icon: <Info            size={20} /> },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/[0.04]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0 border border-white/10">
          <Cpu size={18} className="text-white" />
        </div>
        <div className="overflow-hidden flex flex-col justify-center mt-0.5">
          <p className="text-[13px] font-bold text-white leading-none tracking-wide">Damage<span className="text-blue-400">Sense</span></p>
          <p className="text-[9px] text-slate-500 font-medium tracking-widest mt-1 uppercase">AI Assessment</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
               ${
                 isActive
                   ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                   : "text-slate-400 hover:bg-white/[0.03] hover:text-white border border-transparent"
               }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`transition-colors ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/5">
        <p className="text-[10px] text-slate-600 leading-snug">
          Road Damage Detection<br />& Risk Assessment v1.0
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-full bg-[var(--bg-surface)] border-r border-white/[0.04] flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg glass border border-white/10 text-slate-400 hover:text-white transition"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-64 bg-[var(--bg-surface)] border-r border-white/[0.04] z-50 lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
