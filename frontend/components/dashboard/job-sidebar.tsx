"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  HelpCircle,
  LogOut,
  Plus,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: false },
  { icon: Users, label: "Candidates", active: false },
  { icon: Settings, label: "Job Settings", active: true },
  { icon: BarChart3, label: "Analytics", active: false },
  { icon: HelpCircle, label: "Help", active: false },
];

export function JobSidebar() {
  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-[280px] h-screen bg-white border-r border-[rgba(15,15,15,0.10)] flex flex-col shrink-0"
    >
      {/* Logo */}
      <div className="p-6 border-b border-[rgba(15,15,15,0.10)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C8F135] rounded-lg flex items-center justify-center">
            <span className="font-display font-bold text-[#0F0F0F] text-sm">H</span>
          </div>
          <span className="font-display font-bold text-[#0F0F0F] text-lg">
            HireDoc AI
          </span>
        </div>
      </div>

      {/* New Job Badge */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 px-4 py-3 bg-[#C8F135] rounded-xl">
          <Plus className="w-4 h-4 text-[#0F0F0F]" />
          <span className="font-body text-[#0F0F0F] text-sm font-semibold">
            Creating New Job
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        {navItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
              item.active
                ? "bg-[rgba(200,241,53,0.08)] border-l-[3px] border-[#C8F135] text-[#C8F135]"
                : "text-[#6B6560] hover:bg-[#F5F0E8] hover:text-[#0F0F0F]"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-body text-sm font-medium">{item.label}</span>
          </motion.button>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-[rgba(15,15,15,0.10)]">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 rounded-full bg-[#0057FF] flex items-center justify-center">
            <span className="font-body text-white text-sm font-semibold">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-[#0F0F0F] text-sm font-medium truncate">
              Jane Doe
            </p>
            <button className="font-body text-[#6B6560] text-xs hover:text-[#FF4D2E] transition-colors flex items-center gap-1">
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
