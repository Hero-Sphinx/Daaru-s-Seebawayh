import PageBanner from "@/layouts/PageBanner";
import type { SettingsPageData } from "@/types/settings";
import ProfileForm from "./components/ProfileForm";
import SettingsForm from "./components/SettingsForm";

export default function SettingsWrapper({ user, boxCounts }: SettingsPageData) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageBanner tone="stone" titleAr="الإِعْدَادَاتُ" title="Settings" description="Your name and how your vocabulary reviews are scheduled." />
      <ProfileForm displayName={user.display_name} email={user.email} />
      <SettingsForm
        currentAlgorithm={user.srs_algorithm === "leitner" ? "leitner" : "sm2"}
        boxCounts={boxCounts}
      />
    </div>
  );
}
