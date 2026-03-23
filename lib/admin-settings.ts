import { promises as fs } from "fs";
import path from "path";

export type AdminSettings = {
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

const DEFAULT_SETTINGS: AdminSettings = {
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

function getSettingsPath() {
  return path.join(process.cwd(), "data", "admin-settings.json");
}

async function ensureDirExists(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function readAdminSettings(): Promise<AdminSettings> {
  const filePath = getSettingsPath();

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as AdminSettings;
  } catch {
    await writeAdminSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
}

export async function writeAdminSettings(next: AdminSettings): Promise<AdminSettings> {
  const filePath = getSettingsPath();
  await ensureDirExists(filePath);

  const payload: AdminSettings = {
    ...next,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf-8");
  return payload;
}

export function sanitizeAdminSettings(input: Partial<AdminSettings>): AdminSettings {
  const merged: AdminSettings = {
    payment: {
      ...DEFAULT_SETTINGS.payment,
      ...(input.payment || {}),
    },
    video: {
      ...DEFAULT_SETTINGS.video,
      ...(input.video || {}),
    },
    platform: {
      ...DEFAULT_SETTINGS.platform,
      ...(input.platform || {}),
    },
    integrations: {
      ...DEFAULT_SETTINGS.integrations,
      ...(input.integrations || {}),
    },
    branding: {
      ...DEFAULT_SETTINGS.branding,
      ...(input.branding || {}),
    },
    pages: {
      ...DEFAULT_SETTINGS.pages,
      ...(input.pages || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  if (!["PAYMONGO", "MANUAL"].includes(merged.payment.provider)) {
    merged.payment.provider = DEFAULT_SETTINGS.payment.provider;
  }

  if (!["UPLOAD", "YOUTUBE", "VIMEO", "CLOUDFLARE_STREAM"].includes(merged.video.defaultProvider)) {
    merged.video.defaultProvider = DEFAULT_SETTINGS.video.defaultProvider;
  }

  if (!["dark", "light"].includes(merged.branding.themeMode)) {
    merged.branding.themeMode = DEFAULT_SETTINGS.branding.themeMode;
  }

  merged.payment.trialDays = Math.max(0, Math.min(365, Number(merged.payment.trialDays) || 0));
  merged.payment.taxPercent = Math.max(0, Math.min(100, Number(merged.payment.taxPercent) || 0));
  merged.video.maxUploadSizeMb = Math.max(10, Math.min(5000, Number(merged.video.maxUploadSizeMb) || 500));

  return merged;
}
