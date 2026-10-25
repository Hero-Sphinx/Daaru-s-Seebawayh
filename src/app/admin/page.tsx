import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminWrapper } from "@/libs";
import { currentUserIsAdmin, getCurrentUserId } from "@/server/lib";
import { getAllReleasedSections } from "@/server/services";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  await getCurrentUserId();
  // Not "forbidden": to anyone else the page simply doesn't exist.
  if (!(await currentUserIsAdmin())) notFound();
  return <AdminWrapper released={await getAllReleasedSections()} />;
}
