"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { CompanySize } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import {
  useAuth,
  getAuthErrorMessage,
} from "@/providers/auth-provider";

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Other",
] as const;

const COMPANY_SIZES: CompanySize[] = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "500+",
];

function getInitials(
  fullName: string,
  organizationName: string,
  email: string,
): string {
  const name =
    fullName.trim() ||
    organizationName.trim() ||
    email.split("@")[0] ||
    "R";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const {
    firebaseUser,
    recruiter,
    changePassword,
    sendPasswordReset,
    updateRecruiter,
    isConfigured,
  } = useAuth();

  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState<CompanySize | "">("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const hydratedRecruiterId = useRef<string | null>(null);

  useEffect(() => {
    if (!recruiter?._id || hydratedRecruiterId.current === recruiter._id) {
      return;
    }
    hydratedRecruiterId.current = recruiter._id;
    setFullName(recruiter.full_name ?? "");
    setJobTitle(recruiter.job_title ?? "");
    setPhone(recruiter.phone ?? "");
    setOrganizationName(recruiter.organization_name ?? "");
    setWebsite(recruiter.website ?? "");
    setIndustry(recruiter.industry ?? "");
    setCompanySize(recruiter.company_size ?? "");
    setCompanyDescription(recruiter.company_description ?? "");
  }, [recruiter]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [resetEmailLoading, setResetEmailLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const hasPasswordProvider = firebaseUser?.providerData.some(
    (p) => p.providerId === "password",
  );
  const accountEmail = firebaseUser?.email ?? recruiter?.email ?? "";
  const initials = getInitials(fullName, organizationName, accountEmail);

  const handleSaveChanges = async () => {
    if (activeTab === "notifications") {
      toast.message("Notification preferences are coming soon");
      return;
    }

    setSaveLoading(true);
    try {
      if (activeTab === "profile") {
        await updateRecruiter({
          full_name: fullName.trim(),
          job_title: jobTitle.trim(),
          phone: phone.trim(),
        });
        toast.success("Profile saved");
      } else if (activeTab === "company") {
        await updateRecruiter({
          organization_name: organizationName.trim(),
          website: website.trim(),
          industry: industry.trim(),
          company_size: companySize || "",
          company_description: companyDescription.trim(),
        });
        toast.success("Company details saved");
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to save changes";
      toast.error(message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Fill in all password fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("New password must be different from your current password");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendPasswordResetEmail = async () => {
    if (!accountEmail) {
      toast.error("No email on file for this account");
      return;
    }
    setResetEmailLoading(true);
    try {
      await sendPasswordReset(accountEmail);
      toast.success(
        "If an account exists for that email, we sent a link to set or reset your password.",
      );
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setResetEmailLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "company", label: "Company" },
    { id: "notifications", label: "Notifications" },
  ];

  const saveDisabled =
    saveLoading || activeTab === "notifications";

  return (
    <>
        {/* Header */}
        <header className="h-[72px] bg-white border-b border-[#E8E2D9] px-8 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-display font-extrabold text-[#0F0F0F] text-xl">
            Settings
          </h1>
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={saveDisabled}
            className="px-5 py-2.5 bg-[#C8F135] rounded-full font-display font-semibold text-sm text-[#0F0F0F] hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {saveLoading ? "Saving…" : "Save Changes"}
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
                <h2 className="font-display font-bold text-[#0F0F0F] text-lg mb-2">
                  Personal Information
                </h2>
                <p className="font-body text-sm text-[#6B6560] mb-6">
                  Optional — you can complete this anytime.
                </p>
                <div className="flex items-start gap-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-[#0057FF] flex items-center justify-center">
                      <span className="font-display font-bold text-white text-3xl">
                        {initials}
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
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 bg-[#F5F0E8] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] placeholder:text-[#6B6560] focus:outline-none focus:border-[#C8F135] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={accountEmail}
                        readOnly
                        className="w-full px-4 py-3 bg-[#F5F0E8] border border-transparent rounded-xl font-body text-sm text-[#6B6560] cursor-not-allowed focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="Your job title"
                        className="w-full px-4 py-3 bg-[#F5F0E8] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] placeholder:text-[#6B6560] focus:outline-none focus:border-[#C8F135] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your phone number"
                        className="w-full px-4 py-3 bg-[#F5F0E8] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] placeholder:text-[#6B6560] focus:outline-none focus:border-[#C8F135] transition-colors"
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
                {!isConfigured ? (
                  <p className="font-body text-sm text-[#6B6560]">
                    Firebase is not configured. Password changes are unavailable.
                  </p>
                ) : hasPasswordProvider ? (
                  <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                        className="w-full px-4 py-3 pr-11 bg-[#F5F0E8] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] placeholder:text-[#6B6560] focus:outline-none focus:border-[#C8F135] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6B6560] hover:text-[#0F0F0F] transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8F135]"
                        aria-label={
                          showCurrentPassword
                            ? "Hide current password"
                            : "Show current password"
                        }
                        tabIndex={-1}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-5 h-5" aria-hidden />
                        ) : (
                          <Eye className="w-5 h-5" aria-hidden />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                      New Password
                    </label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      className="w-full px-4 py-3 bg-[#F5F0E8] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] placeholder:text-[#6B6560] focus:outline-none focus:border-[#C8F135] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                      Confirm Password
                    </label>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      className="w-full px-4 py-3 bg-[#F5F0E8] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] placeholder:text-[#6B6560] focus:outline-none focus:border-[#C8F135] transition-colors"
                    />
                  </div>
                </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="px-6 py-2.5 bg-[#C8F135] rounded-full font-display font-semibold text-sm text-[#0F0F0F] hover:scale-[1.02] transition-transform disabled:opacity-50"
                      >
                        {passwordLoading ? "Updating…" : "Update password"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <p className="font-body text-sm text-[#6B6560] leading-relaxed">
                      You signed in with Google. Manage your password in your
                      Google account. To sign in with email and password as well,
                      you can set a password via a reset link sent to{" "}
                      <span className="text-[#0F0F0F] font-medium">
                        {accountEmail || "your email"}
                      </span>
                      .
                    </p>
                    <button
                      type="button"
                      onClick={handleSendPasswordResetEmail}
                      disabled={resetEmailLoading || !accountEmail}
                      className="px-5 py-2.5 border border-[#E8E2D9] rounded-full font-display font-semibold text-sm text-[#0F0F0F] hover:border-[#0F0F0F] transition-colors disabled:opacity-50"
                    >
                      {resetEmailLoading
                        ? "Sending…"
                        : "Send password setup email"}
                    </button>
                  </div>
                )}
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
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Company name"
                    className="w-full px-4 py-3 bg-[#F5F0E8] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] placeholder:text-[#6B6560] focus:outline-none focus:border-[#C8F135] transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 bg-[#F5F0E8] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] focus:outline-none focus:border-[#C8F135] transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                    Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F5F0E8] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] focus:outline-none focus:border-[#C8F135] transition-colors"
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                    Company Size
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) =>
                      setCompanySize(e.target.value as CompanySize | "")
                    }
                    className="w-full px-4 py-3 bg-[#F5F0E8] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] focus:outline-none focus:border-[#C8F135] transition-colors"
                  >
                    <option value="">Select company size</option>
                    {COMPANY_SIZES.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block font-display font-semibold text-xs text-[#6B6560] uppercase tracking-wide mb-2">
                    Company Description
                  </label>
                  <textarea
                    rows={4}
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    placeholder="Brief description of your company"
                    className="w-full px-4 py-3 bg-[#F5F0E8] border border-transparent rounded-xl font-body text-sm text-[#0F0F0F] placeholder:text-[#6B6560] focus:outline-none focus:border-[#C8F135] transition-colors resize-none"
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

        </div>
    </>
  );
}
