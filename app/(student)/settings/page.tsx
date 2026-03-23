import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudentSettingsForm } from "@/components/student/student-settings-form";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <StudentSettingsForm
      initialName={session.user.name ?? ""}
      initialEmail={session.user.email ?? ""}
    />
  );
}
