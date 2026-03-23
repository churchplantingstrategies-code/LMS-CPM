import { promises as fs } from "fs";
import path from "path";

export type AdminSettings = {
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
  // Handle legacy structure: if PayMongo keys are in integrations, move them to payment
  const inputWithMigration = { ...input };
  if (input.integrations) {
    const integrations = input.integrations as any;
    if (integrations.paymongoSecretKey && !input.payment?.paymongoSecretKey) {
      if (!inputWithMigration.payment) inputWithMigration.payment = {};
      (inputWithMigration.payment as any).paymongoSecretKey = integrations.paymongoSecretKey;
    }
    if (integrations.paymongoPublicKey && !input.payment?.paymongoPublicKey) {
      if (!inputWithMigration.payment) inputWithMigration.payment = {};
      (inputWithMigration.payment as any).paymongoPublicKey = integrations.paymongoPublicKey;
    }
  }

  const merged: AdminSettings = {
    payment: {
      ...DEFAULT_SETTINGS.payment,
      ...(inputWithMigration.payment || {}),
    },
    video: {
      ...DEFAULT_SETTINGS.video,
      ...(inputWithMigration.video || {}),
    },
    platform: {
      ...DEFAULT_SETTINGS.platform,
      ...(inputWithMigration.platform || {}),
    },
    integrations: {
      ...DEFAULT_SETTINGS.integrations,
      ...(inputWithMigration.integrations || {}),
    },
    branding: {
      ...DEFAULT_SETTINGS.branding,
      ...(inputWithMigration.branding || {}),
    },
    pages: {
      ...DEFAULT_SETTINGS.pages,
      ...(inputWithMigration.pages || {}),
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
