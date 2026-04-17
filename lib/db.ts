import { PrismaClient } from "@prisma/client";

const { loadEnvConfig } = require("@next/env") as {
  loadEnvConfig: (dir: string) => void;
};

type DbClient = PrismaClient & {
  user: PrismaClient["users"];
  account: PrismaClient["accounts"];
  session: PrismaClient["sessions"];
  verificationToken: PrismaClient["verification_tokens"];
  analyticsEvent: PrismaClient["analytics_events"];
  assignment: PrismaClient["assignments"];
  automationRule: PrismaClient["automation_rules"];
  certificate: PrismaClient["certificates"];
  course: PrismaClient["courses"];
  discussion: PrismaClient["discussions"];
  emailCampaign: PrismaClient["email_campaigns"];
  emailLog: PrismaClient["email_logs"];
  enrollment: PrismaClient["enrollments"];
  funnel: PrismaClient["funnels"];
  funnelCourse: PrismaClient["funnel_courses"];
  funnelStep: PrismaClient["funnel_steps"];
  lead: PrismaClient["leads"];
  lesson: PrismaClient["lessons"];
  lessonProgress: PrismaClient["lesson_progress"];
  module: PrismaClient["modules"];
  payment: PrismaClient["payments"];
  plan: PrismaClient["plans"];
  reply: PrismaClient["replies"];
  submission: PrismaClient["submissions"];
  subscription: PrismaClient["subscriptions"];
};

declare global {
  // eslint-disable-next-line no-var
  var prismaEnvLoaded: boolean | undefined;
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

if (!globalThis.prismaEnvLoaded) {
  loadEnvConfig(process.cwd());
  globalThis.prismaEnvLoaded = true;
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function withDelegateAliases(client: PrismaClient): DbClient {
  const dbWithAliases = client as DbClient;

  // Keep compatibility with code that expects singular/camelCase Prisma delegates.
  dbWithAliases.user = client.users;
  dbWithAliases.account = client.accounts;
  dbWithAliases.session = client.sessions;
  dbWithAliases.verificationToken = client.verification_tokens;
  dbWithAliases.analyticsEvent = client.analytics_events;
  dbWithAliases.assignment = client.assignments;
  dbWithAliases.automationRule = client.automation_rules;
  dbWithAliases.certificate = client.certificates;
  dbWithAliases.course = client.courses;
  dbWithAliases.discussion = client.discussions;
  dbWithAliases.emailCampaign = client.email_campaigns;
  dbWithAliases.emailLog = client.email_logs;
  dbWithAliases.enrollment = client.enrollments;
  dbWithAliases.funnel = client.funnels;
  dbWithAliases.funnelCourse = client.funnel_courses;
  dbWithAliases.funnelStep = client.funnel_steps;
  dbWithAliases.lead = client.leads;
  dbWithAliases.lesson = client.lessons;
  dbWithAliases.lessonProgress = client.lesson_progress;
  dbWithAliases.module = client.modules;
  dbWithAliases.payment = client.payments;
  dbWithAliases.plan = client.plans;
  dbWithAliases.reply = client.replies;
  dbWithAliases.submission = client.submissions;
  dbWithAliases.subscription = client.subscriptions;

  return dbWithAliases;
}

const prismaClient = globalThis.prisma ?? createPrismaClient();
export const db: DbClient = withDelegateAliases(prismaClient);

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prismaClient;
}
