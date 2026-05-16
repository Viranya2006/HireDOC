"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "company", label: "Company" },
    { id: "notifications", label: "Notifications" },
    { id: "integrations", label: "Integrations" },
    { id: "billing", label: "Billing" },
  ];

  return (
    <>
        {/* Header */}
        <header className="h-[72px] bg-white border-b border-[#E8E2D9] px-8 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-display font-extrabold text-[#0F0F0F] text-xl">
            Settings
          </h1>
          <button className="px-5 py-2.5 bg-[#C8F135] rounded-full font-display font-semibold text-sm text-[#0F0F0F] hover:scale-[1.02] transition-transform">
            Save Changes
          </button>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex gap-2 mb-8"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full font-display font-semibold text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-[#EEF7D3] text-[#0F0F0F]"
                    : "bg-white border border-[#E8E2D9] text-[#6B6560] hover:border-[#0F0F0F] hover:text-[#0F0F0F]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-6"
            >
              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-8">
                <h2 className="font-display font-bold text-[#0F0F0F] text-lg mb-6">
                  Personal Information
                </h2>
                <div className="flex items-start gap-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-[#0057FF] flex items-center justify-center">
                      <span className="font-display font-bold text-white text-3xl">
                        SC
                      </span>
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#C8F135] rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                      <svg
                        className="w-4 h-4 text-[#0F0F0F]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-6">
                    <div>
                      <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Sarah Chen"
                        className="w-full px-4 py-3 bg-[#F6F7F9] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] focus:outline-none focus:border-[#C8F135] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue="sarah@acmecorp.com"
                        className="w-full px-4 py-3 bg-[#F6F7F9] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] focus:outline-none focus:border-[#C8F135] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        defaultValue="Head of Talent Acquisition"
                        className="w-full px-4 py-3 bg-[#F6F7F9] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] focus:outline-none focus:border-[#C8F135] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        defaultValue="+1 (555) 987-6543"
                        className="w-full px-4 py-3 bg-[#F6F7F9] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] focus:outline-none focus:border-[#C8F135] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Card */}
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-8">
                <h2 className="font-display font-bold text-[#0F0F0F] text-lg mb-6">
                  Change Password
                </h2>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="w-full px-4 py-3 bg-[#F6F7F9] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] placeholder:text-[#6B6560] focus:outline-none focus:border-[#C8F135] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 bg-[#F6F7F9] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] placeholder:text-[#6B6560] focus:outline-none focus:border-[#C8F135] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 bg-[#F6F7F9] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] placeholder:text-[#6B6560] focus:outline-none focus:border-[#C8F135] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "company" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white rounded-2xl border border-[#E8E2D9] p-8"
            >
              <h2 className="font-display font-bold text-[#0F0F0F] text-lg mb-6">
                Company Details
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Acme Corp"
                    className="w-full px-4 py-3 bg-[#F6F7F9] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] focus:outline-none focus:border-[#C8F135] transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    defaultValue="https://acmecorp.com"
                    className="w-full px-4 py-3 bg-[#F6F7F9] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] focus:outline-none focus:border-[#C8F135] transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                    Industry
                  </label>
                  <select className="w-full px-4 py-3 bg-[#F6F7F9] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] focus:outline-none focus:border-[#C8F135] transition-colors">
                    <option>Technology</option>
                    <option>Finance</option>
                    <option>Healthcare</option>
                    <option>Education</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                    Company Size
                  </label>
                  <select className="w-full px-4 py-3 bg-[#F6F7F9] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] focus:outline-none focus:border-[#C8F135] transition-colors">
                    <option>1-10</option>
                    <option>11-50</option>
                    <option>51-200</option>
                    <option>201-500</option>
                    <option>500+</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                    Company Description
                  </label>
                  <textarea
                    rows={4}
                    defaultValue="Acme Corp is a leading technology company building innovative solutions for the modern enterprise."
                    className="w-full px-4 py-3 bg-[#F6F7F9] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] focus:outline-none focus:border-[#C8F135] transition-colors resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white rounded-2xl border border-[#E8E2D9] p-8"
            >
              <h2 className="font-display font-bold text-[#0F0F0F] text-lg mb-6">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                {[
                  {
                    label: "New Applications",
                    desc: "Get notified when a candidate applies",
                    default: true,
                  },
                  {
                    label: "High Score Alerts",
                    desc: "Alert me when a candidate scores 85+",
                    default: true,
                  },
                  {
                    label: "Weekly Summary",
                    desc: "Receive a weekly summary of hiring activity",
                    default: true,
                  },
                  {
                    label: "Marketing Emails",
                    desc: "Receive product updates and tips",
                    default: false,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-[#FAFAF8] rounded-xl"
                  >
                    <div>
                      <p className="font-display font-semibold text-sm text-[#0F0F0F]">
                        {item.label}
                      </p>
                      <p className="font-body text-xs text-[#6B6560]">
                        {item.desc}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={item.default}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#E8E2D9] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C8F135]"></div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "integrations" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white rounded-2xl border border-[#E8E2D9] p-8"
            >
              <h2 className="font-display font-bold text-[#0F0F0F] text-lg mb-6">
                Connected Integrations
              </h2>
              <div className="space-y-4">
                {[
                  {
                    name: "Slack",
                    desc: "Get notifications in Slack",
                    connected: true,
                    color: "#4A154B",
                  },
                  {
                    name: "Google Calendar",
                    desc: "Sync interviews to your calendar",
                    connected: true,
                    color: "#4285F4",
                  },
                  {
                    name: "LinkedIn",
                    desc: "Import candidate profiles",
                    connected: false,
                    color: "#0A66C2",
                  },
                  {
                    name: "Greenhouse",
                    desc: "Sync with your ATS",
                    connected: false,
                    color: "#3AB549",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-[#FAFAF8] rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-display font-semibold text-sm text-[#0F0F0F]">
                          {item.name}
                        </p>
                        <p className="font-body text-xs text-[#6B6560]">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    {item.connected ? (
                      <span className="px-3 py-1 bg-[#00C896]/10 text-[#00C896] rounded-full font-display font-semibold text-xs">
                        Connected
                      </span>
                    ) : (
                      <button className="px-4 py-2 border border-[#E8E2D9] rounded-full font-display font-semibold text-xs text-[#6B6560] hover:border-[#0F0F0F] hover:text-[#0F0F0F] transition-colors">
                        Connect
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "billing" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-6"
            >
              {/* Current Plan */}
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-bold text-[#0F0F0F] text-lg">
                    Current Plan
                  </h2>
                  <span className="px-3 py-1 bg-[#C8F135] text-[#0F0F0F] rounded-full font-display font-semibold text-xs">
                    Pro
                  </span>
                </div>
                <div className="flex items-end gap-2 mb-4">
                  <span className="font-display font-extrabold text-[#0F0F0F] text-4xl">
                    $99
                  </span>
                  <span className="font-body text-[#6B6560] mb-1">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {[
                    "Unlimited job postings",
                    "Up to 500 candidates/month",
                    "MiniMax AI screening",
                    "Team collaboration",
                    "Priority support",
                  ].map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 font-body text-sm text-[#0F0F0F]"
                    >
                      <svg
                        className="w-4 h-4 text-[#00C896]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="px-4 py-2 border border-[#E8E2D9] rounded-full font-display font-semibold text-sm text-[#6B6560] hover:border-[#0F0F0F] hover:text-[#0F0F0F] transition-colors">
                  Upgrade to Enterprise
                </button>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-8">
                <h2 className="font-display font-bold text-[#0F0F0F] text-lg mb-6">
                  Payment Method
                </h2>
                <div className="flex items-center justify-between p-4 bg-[#FAFAF8] rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-[#1A1F71] rounded flex items-center justify-center">
                      <span className="font-display font-bold text-white text-xs">
                        VISA
                      </span>
                    </div>
                    <div>
                      <p className="font-mono text-sm text-[#0F0F0F]">
                        **** **** **** 4242
                      </p>
                      <p className="font-body text-xs text-[#6B6560]">
                        Expires 12/2025
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-[#E8E2D9] rounded-full font-display font-semibold text-xs text-[#6B6560] hover:border-[#0F0F0F] hover:text-[#0F0F0F] transition-colors">
                    Update
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
    </>
  );
}
