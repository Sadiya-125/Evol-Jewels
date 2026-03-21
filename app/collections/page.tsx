import { Metadata } from "next";
import { getServerCaller } from "@/lib/trpc/server";
import CollectionsContent from "./CollectionsContent";

export const metadata: Metadata = {
  title: "The Edit | Evol Jewels",
  description:
    "Explore our curated collections - each a narrative in gold and gemstones. Discover pieces that move the way you do.",
  openGraph: {
    title: "The Edit | Evol Jewels",
    description:
      "Explore our curated collections - each a narrative in gold and gemstones.",
    type: "website",
  },
};

export default async function CollectionsPage() {
  const caller = await getServerCaller();
  const collections = await caller.collections.list();

  return <CollectionsContent collections={collections} />;
}
