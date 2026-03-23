"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ThemeMode = "auto" | "light" | "dark";

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = mode === "dark" || (mode === "auto" && systemPrefersDark);
  root.classList.toggle("dark", shouldUseDark);
}

export function StudentSettingsForm({
  initialName,
  initialEmail,
}: {
  initialName: string;
  initialEmail: string;
}) {
  const { update } = useSession();

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>("auto");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const hasChanges = useMemo(() => {
    return (
      name !== initialName ||
      email !== initialEmail ||
      currentPassword.length > 0 ||
      newPassword.length > 0
    );
  }, [name, email, currentPassword, newPassword, initialName, initialEmail]);

  useEffect(() => {
    const stored = localStorage.getItem("theme-mode");
    const mode = stored === "light" || stored === "dark" || stored === "auto" ? stored : "auto";
    setThemeMode(mode);
    applyTheme(mode);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      if ((localStorage.getItem("theme-mode") || "auto") === "auto") {
        applyTheme("auto");
      }
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }

    media.addListener(listener);
    return () => media.removeListener(listener);
  }, []);

  async function saveSettings() {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload: {
        name?: string;
        email?: string;
        currentPassword?: string;
        newPassword?: string;
      } = {};

      if (name !== initialName) payload.name = name.trim();
      if (email !== initialEmail) payload.email = email.trim().toLowerCase();
      if (currentPassword) payload.currentPassword = currentPassword;
      if (newPassword) payload.newPassword = newPassword;

      if (Object.keys(payload).length > 0) {
        const response = await fetch("/api/student/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = (await response.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
          user?: { name: string | null; email: string };
        };

        if (!response.ok) {
          throw new Error(result.error || "Failed to update settings.");
        }

        if (result.user) {
          setName(result.user.name || "");
          setEmail(result.user.email);
          await update({ name: result.user.name || "", email: result.user.email });
        }

        setCurrentPassword("");
        setNewPassword("");
        setMessage(result.message || "Settings updated successfully.");
      } else {
        setMessage("No profile changes to save.");
      }
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  }

  function handleThemeChange(mode: ThemeMode) {
    setThemeMode(mode);
    localStorage.setItem("theme-mode", mode);
    applyTheme(mode);
    setMessage("Theme preference saved.");
    setError(null);
  }

  function resetProfileChanges() {
    setName(initialName);
    setEmail(initialEmail);
    setCurrentPassword("");
    setNewPassword("");
    setError(null);
    setMessage("Changes reset.");
  }

  return (
    <div className="max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Manage your account details and appearance.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Current password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Required when changing password for accounts with an existing password.</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">New Password</label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={saveSettings} disabled={saving || !hasChanges}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={resetProfileChanges} disabled={saving}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant={themeMode === "auto" ? "brand" : "outline"} onClick={() => handleThemeChange("auto")}>Auto</Button>
            <Button type="button" variant={themeMode === "light" ? "brand" : "outline"} onClick={() => handleThemeChange("light")}>Light</Button>
            <Button type="button" variant={themeMode === "dark" ? "brand" : "outline"} onClick={() => handleThemeChange("dark")}>Dark</Button>
          </div>
          <p className="mt-2 text-xs text-gray-500">Auto follows your device preference.</p>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}
      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>
      ) : null}
    </div>
  );
}
