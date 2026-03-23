"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CreditCard, Video, Settings, Key, Lock, Palette } from "lucide-react";

type AdminSettings = {
  payment: {
    provider: "PAYMONGO" | "MANUAL";
    currency: string;
    trialDays: number;
    taxPercent: number;
    allowManualEnrollment: boolean;
  };
  video: {
    defaultProvider: "UPLOAD" | "YOUTUBE" | "VIMEO" | "CLOUDFLARE_STREAM";
    allowDownloads: boolean;
    maxUploadSizeMb: number;
    transcodeOnUpload: boolean;
  };
  platform: {
    supportEmail: string;
    enableCertificates: boolean;
    enableDiscussions: boolean;
  };
  integrations: {
    paymongoSecretKey: string;
    paymongoPublicKey: string;
    smsProvider: string;
    smsApiKey: string;
    emailProvider: string;
    emailApiKey: string;
  };
  oauth: {
    googleClientId: string;
    googleClientSecret: string;
  };
  branding: {
    themeMode: "dark" | "light";
    primaryColor: string;
    logoUrl: string;
  };
  pages: {
    homeLeadFormEnabled: boolean;
    maintenanceMode: boolean;
    customFooterText: string;
  };
  updatedAt: string;
};

const EMPTY_STATE: AdminSettings = {
  payment: {
    provider: "PAYMONGO",
    currency: "PHP",
    trialDays: 14,
    taxPercent: 0,
    allowManualEnrollment: false,
  },
  video: {
    defaultProvider: "UPLOAD",
    allowDownloads: false,
    maxUploadSizeMb: 500,
    transcodeOnUpload: true,
  },
  platform: {
    supportEmail: "support@ediscipleship.local",
    enableCertificates: true,
    enableDiscussions: true,
  },
  integrations: {
    paymongoSecretKey: "",
    paymongoPublicKey: "",
    smsProvider: "Twilio",
    smsApiKey: "",
    emailProvider: "SendGrid",
    emailApiKey: "",
  },
  oauth: {
    googleClientId: "",
    googleClientSecret: "",
  },
  branding: {
    themeMode: "dark",
    primaryColor: "#4f46e5",
    logoUrl: "",
  },
  pages: {
    homeLeadFormEnabled: true,
    maintenanceMode: false,
    customFooterText: "Empowering discipleship through digital learning.",
  },
  updatedAt: new Date().toISOString(),
};

export function AdminSettingsForm() {
  const [settings, setSettings] = useState<AdminSettings>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) {
          throw new Error("Failed to load settings");
        }
        const data = (await res.json()) as AdminSettings;
        setSettings(data);
      } catch {
        setMessage("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function saveSettings() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        throw new Error("Failed to save settings");
      }
      const data = (await res.json()) as AdminSettings;
      setSettings(data);
      setMessage("Settings saved successfully");
    } catch {
      setMessage("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading settings...</p>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="payment" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
          <TabsTrigger value="payment" className="gap-2 flex items-center justify-center">
            <CreditCard className="h-4 w-4 hidden sm:block" />
            <span className="hidden sm:inline">Payment</span>
            <span className="sm:hidden">Pay</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-2 flex items-center justify-center">
            <Video className="h-4 w-4 hidden sm:block" />
            <span className="hidden sm:inline">Video</span>
            <span className="sm:hidden">Vid</span>
          </TabsTrigger>
          <TabsTrigger value="platform" className="gap-2 flex items-center justify-center">
            <Settings className="h-4 w-4 hidden sm:block" />
            <span className="hidden sm:inline">Platform</span>
            <span className="sm:hidden">Plat</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2 flex items-center justify-center">
            <Key className="h-4 w-4 hidden sm:block" />
            <span className="hidden sm:inline">API</span>
            <span className="sm:hidden">API</span>
          </TabsTrigger>
          <TabsTrigger value="oauth" className="gap-2 flex items-center justify-center">
            <Lock className="h-4 w-4 hidden sm:block" />
            <span className="hidden sm:inline">OAuth</span>
            <span className="sm:hidden">Auth</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2 flex items-center justify-center">
            <Palette className="h-4 w-4 hidden sm:block" />
            <span className="hidden sm:inline">Branding</span>
            <span className="sm:hidden">Brand</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="space-y-4">
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">Payment Setup</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Provider</label>
                <select className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={settings.payment.provider} onChange={(e) => setSettings(prev => ({ ...prev, payment: { ...prev.payment, provider: e.target.value as "PAYMONGO" | "MANUAL" } }))}>
                  <option value="PAYMONGO">PayMongo</option>
                  <option value="MANUAL">Manual Payments</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Currency</label>
                <input className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={settings.payment.currency} onChange={(e) => setSettings(prev => ({ ...prev, payment: { ...prev.payment, currency: e.target.value.toUpperCase() } }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Trial Days</label>
                <input type="number" className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={settings.payment.trialDays} onChange={(e) => setSettings(prev => ({ ...prev, payment: { ...prev.payment, trialDays: Number(e.target.value) } }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tax (%)</label>
                <input type="number" className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={settings.payment.taxPercent} onChange={(e) => setSettings(prev => ({ ...prev, payment: { ...prev.payment, taxPercent: Number(e.target.value) } }))} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
                <input type="checkbox" checked={settings.payment.allowManualEnrollment} onChange={(e) => setSettings(prev => ({ ...prev, payment: { ...prev.payment, allowManualEnrollment: e.target.checked } }))} />
                Allow admins to grant enrollment without payment
              </label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="video" className="space-y-4">
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">Video Course Setup</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Default Video Provider</label>
                <select className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={settings.video.defaultProvider} onChange={(e) => setSettings(prev => ({ ...prev, video: { ...prev.video, defaultProvider: e.target.value as AdminSettings["video"]["defaultProvider"] } }))}>
                  <option value="UPLOAD">Upload</option>
                  <option value="YOUTUBE">YouTube</option>
                  <option value="VIMEO">Vimeo</option>
                  <option value="CLOUDFLARE_STREAM">Cloudflare Stream</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Max Upload Size (MB)</label>
                <input type="number" className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={settings.video.maxUploadSizeMb} onChange={(e) => setSettings(prev => ({ ...prev, video: { ...prev.video, maxUploadSizeMb: Number(e.target.value) } }))} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={settings.video.allowDownloads} onChange={(e) => setSettings(prev => ({ ...prev, video: { ...prev.video, allowDownloads: e.target.checked } }))} />
                Allow video downloads
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={settings.video.transcodeOnUpload} onChange={(e) => setSettings(prev => ({ ...prev, video: { ...prev.video, transcodeOnUpload: e.target.checked } }))} />
                Transcode uploaded videos
              </label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="platform" className="space-y-4">
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">Platform Features</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Support Email</label>
                <input className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={settings.platform.supportEmail} onChange={(e) => setSettings(prev => ({ ...prev, platform: { ...prev.platform, supportEmail: e.target.value } }))} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={settings.platform.enableCertificates} onChange={(e) => setSettings(prev => ({ ...prev, platform: { ...prev.platform, enableCertificates: e.target.checked } }))} />
                Enable certificates
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={settings.platform.enableDiscussions} onChange={(e) => setSettings(prev => ({ ...prev, platform: { ...prev.platform, enableDiscussions: e.target.checked } }))} />
                Enable discussions
              </label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">API Configurations</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">PayMongo Secret Key</label>
                <input type="password" className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={settings.integrations.paymongoSecretKey} onChange={(e) => setSettings(prev => ({ ...prev, integrations: { ...prev.integrations, paymongoSecretKey: e.target.value } }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">PayMongo Public Key</label>
                <input type="text" className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={settings.integrations.paymongoPublicKey} onChange={(e) => setSettings(prev => ({ ...prev, integrations: { ...prev.integrations, paymongoPublicKey: e.target.value } }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">SMS Provider</label>
                <input type="text" className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={settings.integrations.smsProvider} onChange={(e) => setSettings(prev => ({ ...prev, integrations: { ...prev.integrations, smsProvider: e.target.value } }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">SMS API Key</label>
                <input type="password" className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={settings.integrations.smsApiKey} onChange={(e) => setSettings(prev => ({ ...prev, integrations: { ...prev.integrations, smsApiKey: e.target.value } }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Provider</label>
                <input type="text" className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={settings.integrations.emailProvider} onChange={(e) => setSettings(prev => ({ ...prev, integrations: { ...prev.integrations, emailProvider: e.target.value } }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email API Key</label>
                <input type="password" className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={settings.integrations.emailApiKey} onChange={(e) => setSettings(prev => ({ ...prev, integrations: { ...prev.integrations, emailApiKey: e.target.value } }))} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="oauth" className="space-y-4">
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Google OAuth Setup</h2>
            <p className="mb-4 text-sm text-gray-600">Enable Google login for students. Leave empty to disable.</p>
            <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
              <p className="text-xs font-medium text-blue-900 mb-2">📌 How to set up Google OAuth:</p>
              <ol className="list-decimal list-inside text-xs text-blue-800 space-y-1">
                <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-blue-600">console.cloud.google.com</a></li>
                <li>Create or select a project</li>
                <li>Enable the &quot;Google+ API&quot;</li>
                <li>Go to &quot;Credentials&quot; → &quot;Create Credentials&quot; → &quot;OAuth 2.0 Client IDs&quot;</li>
                <li>Add <code className="bg-blue-100 px-2 py-1 rounded text-xs font-mono">http://localhost:3000/api/auth/callback/google</code> as an authorized redirect URI (or your production domain)</li>
                <li>Copy your Client ID and Client Secret below</li>
              </ol>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Google Client ID</label>
                <input type="text" className="w-full rounded-md border px-3 py-2 text-sm font-mono text-gray-900" placeholder="xxxx-xxxx.apps.googleusercontent.com" value={settings.oauth.googleClientId} onChange={(e) => setSettings(prev => ({ ...prev, oauth: { ...prev.oauth, googleClientId: e.target.value } }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Google Client Secret</label>
                <input type="password" className="w-full rounded-md border px-3 py-2 text-sm font-mono text-gray-900" placeholder="GOCSPX-xxxx..." value={settings.oauth.googleClientSecret} onChange={(e) => setSettings(prev => ({ ...prev, oauth: { ...prev.oauth, googleClientSecret: e.target.value } }))} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">Branding, Logo & Page Setup</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Theme Mode</label>
                <select className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={settings.branding.themeMode} onChange={(e) => setSettings(prev => ({ ...prev, branding: { ...prev.branding, themeMode: e.target.value as "dark" | "light" } }))}>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Primary Color</label>
                <input type="text" className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={settings.branding.primaryColor} onChange={(e) => setSettings(prev => ({ ...prev, branding: { ...prev.branding, primaryColor: e.target.value } }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Logo URL</label>
                <input type="url" className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={settings.branding.logoUrl} onChange={(e) => setSettings(prev => ({ ...prev, branding: { ...prev.branding, logoUrl: e.target.value } }))} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={settings.pages.homeLeadFormEnabled} onChange={(e) => setSettings(prev => ({ ...prev, pages: { ...prev.pages, homeLeadFormEnabled: e.target.checked } }))} />
                Enable home page lead generator form
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={settings.pages.maintenanceMode} onChange={(e) => setSettings(prev => ({ ...prev, pages: { ...prev.pages, maintenanceMode: e.target.checked } }))} />
                Enable maintenance mode
              </label>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Footer Text</label>
                <textarea rows={2} className="w-full rounded-md border px-3 py-2 text-sm text-gray-900" value={settings.pages.customFooterText} onChange={(e) => setSettings(prev => ({ ...prev, pages: { ...prev.pages, customFooterText: e.target.value } }))} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between rounded-lg border bg-white p-4">
        <p className="text-xs text-gray-500">Last updated: {new Date(settings.updatedAt).toLocaleString()}</p>
        <button type="button" onClick={saveSettings} disabled={saving} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : "Save Settings"}</button>
      </div>

      {message ? <p className="text-sm text-gray-600">{message}</p> : null}
    </div>
  );
}
