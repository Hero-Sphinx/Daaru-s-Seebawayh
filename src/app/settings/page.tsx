import db from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import PageBanner from "@/components/PageBanner";
import ProfileForm from "@/components/ProfileForm";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const userId = await getCurrentUserId();
  const [user, boxCounts] = await Promise.all([
    db.users.findUniqueOrThrow({ where: { id: userId }, select: { email: true, display_name: true, srs_algorithm: true } }),
    db.srs_cards.groupBy({ by: ["leitner_box"], where: { user_id: userId }, _count: { _all: true }, orderBy: { leitner_box: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageBanner tone="stone" titleAr="الإِعْدَادَاتُ" title="Settings" description="Your name and how your vocabulary reviews are scheduled." />
      <ProfileForm displayName={user.display_name} email={user.email} />
      <SettingsForm
        currentAlgorithm={user.srs_algorithm === "leitner" ? "leitner" : "sm2"}
        boxCounts={boxCounts.map((b) => ({ box: b.leitner_box, count: b._count._all }))}
      />
    </div>
  );
}
