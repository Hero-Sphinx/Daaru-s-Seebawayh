import type { Metadata } from "next";
import { VisionWrapper } from "@/libs";

export const metadata: Metadata = { title: "Our vision" };

export default function VisionPage() {
  return <VisionWrapper />;
}
