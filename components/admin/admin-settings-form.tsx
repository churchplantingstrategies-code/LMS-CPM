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
    paymongoPublicKey: string;
    paymongoSecretKey: string;
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
    smsProvider: "TWILIO" | "PLIVO" | "VONAGE" | "NONE";
    twilioAccountSid: string;
    twilioAuthToken: string;
    twilioSenderId: string;
    plivoAuthId: string;
    plivoAuthToken: string;
    plivoSenderId: string;
    vonageApiKey: string;
    vonageApiSecret: string;
    vonageSenderId: string;
    emailProvider: "SENDGRID" | "MAILGUN" | "SMTP" | "NONE";
    emailApiKey: string;
    emailApiSecret: string;
    emailFromAddress: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
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

type SmsProvider = Exclude<AdminSettings["integrations"]["smsProvider"], "NONE">;
type EmailProvider = Exclude<AdminSettings["integrations"]["emailProvider"], "NONE">;

const EMPTY_STATE: AdminSettings = {
  payment: {
    provider: "PAYMONGO",
    currency: "PHP",
    trialDays: 14,
    taxPercent: 0,
    allowManualEnrollment: false,
    paymongoPublicKey: "",
    paymongoSecretKey: "",
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
    smsProvider: "NONE",
    twilioAccountSid: "",
    twilioAuthToken: "",
    twilioSenderId: "",
    plivoAuthId: "",
    plivoAuthToken: "",
    plivoSenderId: "",
    vonageApiKey: "",
    vonageApiSecret: "",
    vonageSenderId: "",
    emailProvider: "NONE",
    emailApiKey: "",
    emailApiSecret: "",
    emailFromAddress: "",
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
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

function getInitialSmsProviders(integrations: AdminSettings["integrations"]): SmsProvider[] {
  const providers: SmsProvider[] = [];
  if (integrations.smsProvider !== "NONE") {
    providers.push(integrations.smsProvider as SmsProvider);
  }

  if (
    (integrations.twilioAccountSid || integrations.twilioAuthToken || integrations.twilioSenderId) &&
    !providers.includes("TWILIO")
  ) {
    providers.push("TWILIO");
  }
  if (
    (integrations.plivoAuthId || integrations.plivoAuthToken || integrations.plivoSenderId) &&
    !providers.includes("PLIVO")
  ) {
    providers.push("PLIVO");
  }
  if (
    (integrations.vonageApiKey || integrations.vonageApiSecret || integrations.vonageSenderId) &&
    !providers.includes("VONAGE")
  ) {
    providers.push("VONAGE");
  }

  return providers;
}

function getInitialEmailProviders(integrations: AdminSettings["integrations"]): EmailProvider[] {
  const providers: EmailProvider[] = [];
  if (integrations.emailProvider !== "NONE") {
    providers.push(integrations.emailProvider as EmailProvider);
  }

  if ((integrations.emailApiKey || integrations.emailApiSecret) && !providers.includes("SENDGRID") && !providers.includes("MAILGUN")) {
    providers.push("SENDGRID");
  }
  if ((integrations.smtpHost || integrations.smtpUser || integrations.smtpPassword) && !providers.includes("SMTP")) {
    providers.push("SMTP");
  }

  return providers;
}

export function AdminSettingsForm() {
  const [settings, setSettings] = useState<AdminSettings>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [paymentTabAuthenticated, setPaymentTabAuthenticated] = useState(false);
  const [showPaymentAuthModal, setShowPaymentAuthModal] = useState(false);
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [enabledSmsProviders, setEnabledSmsProviders] = useState<SmsProvider[]>([]);
  const [enabledEmailProviders, setEnabledEmailProviders] = useState<EmailProvider[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) {
          throw new Error("Failed to load settings");
        }
        const data = (await res.json()) as AdminSettings;
        setSettings(data);
        setEnabledSmsProviders(getInitialSmsProviders(data.integrations));
        setEnabledEmailProviders(getInitialEmailProviders(data.integrations));
      } catch {
        setMessage("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function verifyPaymentPassword() {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/admin/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: authPassword }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setAuthError("Not authorized. Ensure your account has admin privileges.");
        } else if (res.status === 400) {
          setAuthError("This account has no password set (OAuth login). Password verification cannot be performed.");
        } else if (res.status === 500) {
          setAuthError("Server error. Please try again.");
        } else {
          setAuthError("Invalid password");
        }
        return;
      }

      setPaymentTabAuthenticated(true);
      setShowPaymentAuthModal(false);
      setAuthPassword("");
    } catch {
      setAuthError("Verification failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  function handlePaymentTabClick() {
    if (!paymentTabAuthenticated) {
      setShowPaymentAuthModal(true);
    }
  }

  function addSmsProvider(provider: SmsProvider) {
    setEnabledSmsProviders((prev) => {
      if (prev.includes(provider)) return prev;
      return [...prev, provider];
    });

    setSettings((prev) => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        smsProvider: prev.integrations.smsProvider === "NONE" ? provider : prev.integrations.smsProvider,
      },
    }));
  }

  function removeSmsProvider(provider: SmsProvider) {
    setEnabledSmsProviders((prevProviders) => {
      const nextProviders = prevProviders.filter((p) => p !== provider);

      setSettings((prev) => {
        const nextIntegrations = { ...prev.integrations };
        if (provider === "TWILIO") {
          nextIntegrations.twilioAccountSid = "";
          nextIntegrations.twilioAuthToken = "";
          nextIntegrations.twilioSenderId = "";
        }
        if (provider === "PLIVO") {
          nextIntegrations.plivoAuthId = "";
          nextIntegrations.plivoAuthToken = "";
          nextIntegrations.plivoSenderId = "";
        }
        if (provider === "VONAGE") {
          nextIntegrations.vonageApiKey = "";
          nextIntegrations.vonageApiSecret = "";
          nextIntegrations.vonageSenderId = "";
        }

        if (prev.integrations.smsProvider === provider) {
          nextIntegrations.smsProvider = nextProviders[0] ?? "NONE";
        }

        return { ...prev, integrations: nextIntegrations };
      });

      return nextProviders;
    });
  }

  function addEmailProvider(provider: EmailProvider) {
    setEnabledEmailProviders((prev) => {
      const next = prev.filter((p) => {
        if ((provider === "SENDGRID" || provider === "MAILGUN") && (p === "SENDGRID" || p === "MAILGUN")) {
          return false;
        }
        return true;
      });

      if (!next.includes(provider)) {
        next.push(provider);
      }
      return next;
    });

    setSettings((prev) => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        emailProvider: provider,
      },
    }));
  }

  function removeEmailProvider(provider: EmailProvider) {
    setEnabledEmailProviders((prevProviders) => {
      const nextProviders = prevProviders.filter((p) => p !== provider);

      setSettings((prev) => {
        const nextIntegrations = { ...prev.integrations };

        if (provider === "SENDGRID" || provider === "MAILGUN") {
          nextIntegrations.emailApiKey = "";
          nextIntegrations.emailApiSecret = "";
        }
        if (provider === "SMTP") {
          nextIntegrations.smtpHost = "";
          nextIntegrations.smtpPort = 587;
          nextIntegrations.smtpUser = "";
          nextIntegrations.smtpPassword = "";
        }

        if (prev.integrations.emailProvider === provider) {
          nextIntegrations.emailProvider = nextProviders[0] ?? "NONE";
        }

        return { ...prev, integrations: nextIntegrations };
      });

      return nextProviders;
    });
  }

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
      {/* Payment Authentication Modal */}
      {showPaymentAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 w-full max-w-sm shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Verify Admin Access</h3>
            </div>
            <p className="mb-4 text-sm text-gray-600">Payment configuration contains sensitive API keys. Please verify your account password to proceed.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Login Password</label>
                <input
                  type="password"
                  className="w-full rounded-md border px-3 py-2 text-sm text-gray-900"
                  placeholder="Enter your account password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") verifyPaymentPassword();
                  }}
                  disabled={authLoading}
                />
              </div>

              {authError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                  {authError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowPaymentAuthModal(false);
                    setAuthPassword("");
                    setAuthError(null);
                  }}
                  disabled={authLoading}
                  className="flex-1 rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyPaymentPassword}
                  disabled={authLoading || !authPassword}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authLoading ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="payment" className="w-full" onValueChange={(value) => {
        if (value === "payment") {
          handlePaymentTabClick();
        }
      }}>
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
          {!paymentTabAuthenticated ? (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-8 text-center">
              <Lock className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Restricted Access</h3>
              <p className="mb-4 text-sm text-gray-600">Payment settings containing API keys require password verification.</p>
              <button
                onClick={() => setShowPaymentAuthModal(true)}
                className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
              >
                Verify Access
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
                <p className="text-xs text-green-700">Payment configuration access verified</p>
              </div>
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
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">PayMongo Public Key</label>
                <input type="text" className="w-full rounded-md border px-3 py-2 text-sm text-gray-900 font-mono" placeholder="pk_live_..." value={settings.payment.paymongoPublicKey} onChange={(e) => setSettings(prev => ({ ...prev, payment: { ...prev.payment, paymongoPublicKey: e.target.value } }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">PayMongo Secret Key</label>
                <input type="password" className="w-full rounded-md border px-3 py-2 text-sm text-gray-900 font-mono" placeholder="sk_live_..." value={settings.payment.paymongoSecretKey} onChange={(e) => setSettings(prev => ({ ...prev, payment: { ...prev.payment, paymongoSecretKey: e.target.value } }))} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
                <input type="checkbox" checked={settings.payment.allowManualEnrollment} onChange={(e) => setSettings(prev => ({ ...prev, payment: { ...prev.payment, allowManualEnrollment: e.target.checked } }))} />
                Allow admins to grant enrollment without payment
              </label>
            </div>
          </div>
            </div>
          )}
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

        <TabsContent value="integrations" className="space-y-6">
          {/* SMS / Messaging */}
          <div className="rounded-xl border bg-white p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                <Key className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">SMS / Messaging</h2>
                <p className="text-xs text-gray-500">Add only the SMS providers you want to configure, then set one as active.</p>
              </div>
            </div>

            <div className="mb-5">
              <p className="mb-2 text-sm font-medium text-gray-700">Add SMS Provider</p>
              <div className="flex flex-wrap gap-2">
                {(["TWILIO", "PLIVO", "VONAGE"] as const).map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => addSmsProvider(provider)}
                    disabled={enabledSmsProviders.includes(provider)}
                    className="rounded-md border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    + {provider === "VONAGE" ? "Vonage" : provider.charAt(0) + provider.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5 space-y-2">
              <label className="text-sm font-medium text-gray-700">Active SMS Provider</label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm text-gray-900"
                value={settings.integrations.smsProvider}
                onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, smsProvider: e.target.value as AdminSettings["integrations"]["smsProvider"] } }))}
              >
                <option value="NONE">None (disabled)</option>
                {enabledSmsProviders.includes("TWILIO") && <option value="TWILIO">Twilio</option>}
                {enabledSmsProviders.includes("PLIVO") && <option value="PLIVO">Plivo</option>}
                {enabledSmsProviders.includes("VONAGE") && <option value="VONAGE">Vonage (Nexmo)</option>}
              </select>
            </div>

            {enabledSmsProviders.length === 0 ? (
              <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">No SMS provider added yet.</p>
            ) : (
              <div className="space-y-5">
                {enabledSmsProviders.includes("TWILIO") && (
                  <div className={`rounded-lg border p-4 transition-colors ${settings.integrations.smsProvider === "TWILIO" ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50"}`}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">Twilio</span>
                        {settings.integrations.smsProvider === "TWILIO" && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">Active</span>}
                      </div>
                      <button type="button" onClick={() => removeSmsProvider("TWILIO")} className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50">Delete</button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Account SID (API Key)</label>
                        <input type="text" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="ACxxxxxxxxxxxxxxxx" value={settings.integrations.twilioAccountSid} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, twilioAccountSid: e.target.value } }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Auth Token (Secret)</label>
                        <input type="password" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="Auth token" value={settings.integrations.twilioAuthToken} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, twilioAuthToken: e.target.value } }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Sender ID / Phone Number</label>
                        <input type="text" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="+1234567890" value={settings.integrations.twilioSenderId} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, twilioSenderId: e.target.value } }))} />
                      </div>
                    </div>
                  </div>
                )}

                {enabledSmsProviders.includes("PLIVO") && (
                  <div className={`rounded-lg border p-4 transition-colors ${settings.integrations.smsProvider === "PLIVO" ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50"}`}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">Plivo</span>
                        {settings.integrations.smsProvider === "PLIVO" && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">Active</span>}
                      </div>
                      <button type="button" onClick={() => removeSmsProvider("PLIVO")} className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50">Delete</button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Auth ID (API Key)</label>
                        <input type="text" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="MAxxxxxxxxxxxxxxxx" value={settings.integrations.plivoAuthId} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, plivoAuthId: e.target.value } }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Auth Token (Secret)</label>
                        <input type="password" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="Auth token" value={settings.integrations.plivoAuthToken} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, plivoAuthToken: e.target.value } }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Sender ID / Phone Number</label>
                        <input type="text" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="+1234567890 or BRANDNAME" value={settings.integrations.plivoSenderId} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, plivoSenderId: e.target.value } }))} />
                      </div>
                    </div>
                  </div>
                )}

                {enabledSmsProviders.includes("VONAGE") && (
                  <div className={`rounded-lg border p-4 transition-colors ${settings.integrations.smsProvider === "VONAGE" ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50"}`}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">Vonage (Nexmo)</span>
                        {settings.integrations.smsProvider === "VONAGE" && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">Active</span>}
                      </div>
                      <button type="button" onClick={() => removeSmsProvider("VONAGE")} className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50">Delete</button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">API Key</label>
                        <input type="text" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="xxxxxxxx" value={settings.integrations.vonageApiKey} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, vonageApiKey: e.target.value } }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">API Secret</label>
                        <input type="password" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="API secret" value={settings.integrations.vonageApiSecret} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, vonageApiSecret: e.target.value } }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Sender ID / Brand Name</label>
                        <input type="text" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="BRANDNAME" value={settings.integrations.vonageSenderId} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, vonageSenderId: e.target.value } }))} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="rounded-xl border bg-white p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
                <Key className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Email Provider</h2>
                <p className="text-xs text-gray-500">Add the email provider cards you need, then choose the active one.</p>
              </div>
            </div>

            <div className="mb-5">
              <p className="mb-2 text-sm font-medium text-gray-700">Add Email Provider</p>
              <div className="flex flex-wrap gap-2">
                {(["SENDGRID", "MAILGUN", "SMTP"] as const).map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => addEmailProvider(provider)}
                    disabled={enabledEmailProviders.includes(provider)}
                    className="rounded-md border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    + {provider === "SMTP" ? "Custom SMTP" : provider.charAt(0) + provider.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5 space-y-2">
              <label className="text-sm font-medium text-gray-700">Active Email Provider</label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm text-gray-900"
                value={settings.integrations.emailProvider}
                onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, emailProvider: e.target.value as AdminSettings["integrations"]["emailProvider"] } }))}
              >
                <option value="NONE">None (disabled)</option>
                {enabledEmailProviders.includes("SENDGRID") && <option value="SENDGRID">SendGrid</option>}
                {enabledEmailProviders.includes("MAILGUN") && <option value="MAILGUN">Mailgun</option>}
                {enabledEmailProviders.includes("SMTP") && <option value="SMTP">Custom SMTP</option>}
              </select>
            </div>

            {enabledEmailProviders.length === 0 ? (
              <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">No email provider added yet.</p>
            ) : (
              <div className="space-y-5">
                {enabledEmailProviders.includes("SENDGRID") && (
                  <div className={`rounded-lg border p-4 transition-colors ${settings.integrations.emailProvider === "SENDGRID" ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50"}`}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">SendGrid</span>
                        {settings.integrations.emailProvider === "SENDGRID" && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">Active</span>}
                      </div>
                      <button type="button" onClick={() => removeEmailProvider("SENDGRID")} className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50">Delete</button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">API Key</label>
                        <input type="text" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="SG.xxxxxxx" value={settings.integrations.emailApiKey} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, emailApiKey: e.target.value } }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">API Secret (optional)</label>
                        <input type="password" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="Optional" value={settings.integrations.emailApiSecret} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, emailApiSecret: e.target.value } }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">From / Sender Address</label>
                        <input type="email" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="no-reply@yourdomain.com" value={settings.integrations.emailFromAddress} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, emailFromAddress: e.target.value } }))} />
                      </div>
                    </div>
                  </div>
                )}

                {enabledEmailProviders.includes("MAILGUN") && (
                  <div className={`rounded-lg border p-4 transition-colors ${settings.integrations.emailProvider === "MAILGUN" ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50"}`}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">Mailgun</span>
                        {settings.integrations.emailProvider === "MAILGUN" && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">Active</span>}
                      </div>
                      <button type="button" onClick={() => removeEmailProvider("MAILGUN")} className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50">Delete</button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">API Key (Domain)</label>
                        <input type="text" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="key-xxxxxxxx" value={settings.integrations.emailApiKey} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, emailApiKey: e.target.value } }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">API Secret</label>
                        <input type="password" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="Mailgun secret" value={settings.integrations.emailApiSecret} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, emailApiSecret: e.target.value } }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">From / Sender Address</label>
                        <input type="email" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="no-reply@yourdomain.com" value={settings.integrations.emailFromAddress} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, emailFromAddress: e.target.value } }))} />
                      </div>
                    </div>
                  </div>
                )}

                {enabledEmailProviders.includes("SMTP") && (
                  <div className={`rounded-lg border p-4 transition-colors ${settings.integrations.emailProvider === "SMTP" ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50"}`}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">Custom SMTP</span>
                        {settings.integrations.emailProvider === "SMTP" && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">Active</span>}
                      </div>
                      <button type="button" onClick={() => removeEmailProvider("SMTP")} className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50">Delete</button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">SMTP Host</label>
                        <input type="text" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="smtp.gmail.com" value={settings.integrations.smtpHost} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, smtpHost: e.target.value } }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Port</label>
                        <input type="number" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="587" value={settings.integrations.smtpPort} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, smtpPort: Number(e.target.value) } }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">SMTP Username</label>
                        <input type="text" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="user@domain.com" value={settings.integrations.smtpUser} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, smtpUser: e.target.value } }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">SMTP Password (Secret)</label>
                        <input type="password" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="App password or SMTP password" value={settings.integrations.smtpPassword} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, smtpPassword: e.target.value } }))} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-medium text-gray-600">From / Sender Address</label>
                        <input type="email" className="w-full rounded-md border px-3 py-2 text-xs font-mono text-gray-900" placeholder="no-reply@yourdomain.com" value={settings.integrations.emailFromAddress} onChange={(e) => setSettings((prev) => ({ ...prev, integrations: { ...prev.integrations, emailFromAddress: e.target.value } }))} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
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
