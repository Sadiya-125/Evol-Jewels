import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerCaller } from "@/lib/trpc/server";
import CollectionDetailContent from "./CollectionDetailContent";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const caller = await getServerCaller();
    const collection = await caller.collections.bySlug({ slug });

    return {
      title: `${collection.name} Collection | Evol Jewels`,
      description:
        collection.description ||
        collection.tagline ||
        `Discover the ${collection.name} collection at Evol Jewels`,
      openGraph: {
        title: `${collection.name} Collection | Evol Jewels`,
        description:
          collection.tagline || `Explore the ${collection.name} collection`,
        images: collection.coverImageUrl ? [collection.coverImageUrl] : [],
        type: "website",
      },
    };
  } catch {
    return {
      title: "Collection | Evol Jewels",
    };
  }
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;

  try {
    const caller = await getServerCaller();
    const collection = await caller.collections.bySlug({ slug });

    return <CollectionDetailContent collection={collection} />;
  } catch {
    notFound();
  }
}
