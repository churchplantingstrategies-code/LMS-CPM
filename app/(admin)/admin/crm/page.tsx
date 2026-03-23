import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";

export default async function AdminCrmPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") redirect("/dashboard");

  const [leads, funnels, automations, campaigns] = await Promise.all([
    db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    db.funnel.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    db.automationRule.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    db.emailCampaign.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">CRM</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage leads, conversion funnels, and automation workflows connected to your LMS growth engine.
        </p>
      </div>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap bg-slate-900">
          <TabsTrigger value="leads">Leads & Conversion</TabsTrigger>
          <TabsTrigger value="funnels">Click Funnel & Landing Setup</TabsTrigger>
          <TabsTrigger value="automations">Automations & Newsletter</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="mt-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-3 py-3">Lead</th>
                  <th className="px-3 py-3">Source</th>
                  <th className="px-3 py-3">Tags</th>
                  <th className="px-3 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-slate-500" colSpan={4}>
                      No leads yet. Connect your home-page lead generator to start collecting.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead: { id: string; name: string | null; email: string; source: string | null; tags: string[]; createdAt: Date }) => (
                    <tr key={lead.id} className="border-b border-slate-900 text-slate-200">
                      <td className="px-3 py-3">
                        <p className="font-medium">{lead.name || "Unnamed Lead"}</p>
                        <p className="text-xs text-slate-500">{lead.email}</p>
                      </td>
                      <td className="px-3 py-3 text-slate-300">{lead.source || "Unknown"}</td>
                      <td className="px-3 py-3 text-slate-400">{lead.tags.length > 0 ? lead.tags.join(", ") : "—"}</td>
                      <td className="px-3 py-3 text-slate-400">{formatDate(lead.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="funnels" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="mb-3 text-base font-semibold text-slate-100">Funnel List</h2>
              <div className="space-y-2 text-sm text-slate-300">
                {funnels.length === 0 ? (
                  <p className="text-slate-500">No funnels configured yet.</p>
                ) : (
                  funnels.map((funnel: { id: string; title: string; type: string; isPublished: boolean }) => (
                    <div key={funnel.id} className="rounded-md border border-slate-800 px-3 py-2">
                      <p className="font-medium">{funnel.title}</p>
                      <p className="text-xs text-slate-500">{funnel.type} · {funnel.isPublished ? "Published" : "Draft"}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="mb-3 text-base font-semibold text-slate-100">Landing Page Setup</h2>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>Connect opt-in form from home page hero section.</li>
                <li>Set CTA and follow-up page URL for lead magnet delivery.</li>
                <li>Track conversion steps: Visit -&gt; Opt-in -&gt; Checkout -&gt; Enrollment.</li>
                <li>Use campaign tags to segment warm vs cold traffic.</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="automations" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="mb-3 text-base font-semibold text-slate-100">Automation Rules</h2>
              <div className="space-y-2 text-sm text-slate-300">
                {automations.length === 0 ? (
                  <p className="text-slate-500">No automation rules configured.</p>
                ) : (
                  automations.map((rule: { id: string; name: string; trigger: string; isActive: boolean }) => (
                    <div key={rule.id} className="rounded-md border border-slate-800 px-3 py-2">
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-xs text-slate-500">{rule.trigger} · {rule.isActive ? "Active" : "Inactive"}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="mb-3 text-base font-semibold text-slate-100">Newsletter / Outreach</h2>
              <div className="space-y-2 text-sm text-slate-300">
                {campaigns.length === 0 ? (
                  <p className="text-slate-500">No campaigns yet.</p>
                ) : (
                  campaigns.map((campaign: { id: string; title: string; type: string; status: string }) => (
                    <div key={campaign.id} className="rounded-md border border-slate-800 px-3 py-2">
                      <p className="font-medium">{campaign.title}</p>
                      <p className="text-xs text-slate-500">{campaign.type} · {campaign.status}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
