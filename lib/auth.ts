import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { readFileSync } from "fs";
import path from "path";

// Ensure NEXTAUTH_SECRET is set
if (!process.env.NEXTAUTH_SECRET) {
  console.warn(
    "⚠️  NEXTAUTH_SECRET is not set. Please set it in your .env.local file for production use."
  );
}

// Load Google OAuth credentials from settings or env vars
let googleClientId = process.env.GOOGLE_CLIENT_ID || "";
let googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

// Try to load from admin settings JSON if env vars are empty
if ((!googleClientId || !googleClientSecret) && process.env.NODE_ENV !== "production") {
  try {
    const settingsPath = path.join(process.cwd(), "data", "admin-settings.json");
    const settingsData = JSON.parse(readFileSync(settingsPath, "utf-8"));
    if (settingsData.oauth?.googleClientId) {
      googleClientId = settingsData.oauth.googleClientId;
    }
    if (settingsData.oauth?.googleClientSecret) {
      googleClientSecret = settingsData.oauth.googleClientSecret;
    }
  } catch {
    // Settings file not found or can't be read - fall back to env vars
  }
}

const providers = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await db.user.findUnique({
        where: { email: credentials.email as string },
      });

      if (!user || !user.password) {
        return null;
      }

      const passwordMatch = await bcrypt.compare(
        credentials.password as string,
        user.password
      );

      if (!passwordMatch) return null;

      // Update last login
      await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

// Only add Google provider if credentials are available
if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      } else if (token.id) {
        // Keep role in sync with DB in case it was updated after login.
        const account = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });

        if (account?.role) {
          token.role = account.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Track analytics event on signup
      if (user.id) {
        try {
          await db.analyticsEvent.create({
            data: {
              userId: user.id,
              event: "user_registered",
              properties: { method: "credentials" },
            },
          });
        } catch (err) {
          console.error("Failed to create analytics event:", err);
        }
      }
    },
  },
});
