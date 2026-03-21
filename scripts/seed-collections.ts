import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function seedCollections() {
  console.log("\n🎨 Starting Collections Seed...\n");

  const { db } = await import("../lib/db");
  const { nanoid } = await import("nanoid");
  const { collections, collectionProducts, products } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");

  try {
    // 1. Seed Collections
    console.log("📚 Seeding Collections...");

    const collectionData = [
      {
        id: nanoid(),
        name: "Heart Of Diamond Collections",
        slug: "heart-of-diamond-collections",
        tagline: "Where brilliance meets the heart.",
        description:
          "The Heart Of Diamond Collections celebrates love in its purest form. Each piece features heart-shaped diamonds and romantic silhouettes - designed for those who wear their heart openly. From everyday elegance to special occasions, discover the perfect expression of love.",
        coverImageUrl:
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80",
        moodImageUrls: [
          "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80",
          "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80",
        ],
        accentColor: "#D4A5A5",
        displayOrder: 1,
        isActive: true,
        isFeatured: true,
      },
      {
        id: nanoid(),
        name: "Together Forever Collection",
        slug: "together-forever-collection",
        tagline: "Two souls, one eternal bond.",
        description:
          "The Together Forever Collection is crafted for couples who believe in timeless love. Featuring complementary pairs and intertwining designs, each piece symbolises the beautiful journey of togetherness. Perfect for engagements, anniversaries, and every milestone in between.",
        coverImageUrl:
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80",
        moodImageUrls: [
          "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80",
          "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80",
        ],
        accentColor: "#C4A77D",
        displayOrder: 2,
        isActive: true,
        isFeatured: true,
      },
    ];

    await db.insert(collections).values(collectionData);
    console.log(`✅ Created ${collectionData.length} Collections`);

    // 2. Get existing products to assign to collections
    console.log("\n🔗 Linking Products to Collections...");

    const existingProducts = await db.select().from(products).where(eq(products.isActive, true));

    if (existingProducts.length === 0) {
      console.log("⚠️ No products found. Run seed-database.ts first.");
      process.exit(0);
    }

    // Distribute products across collections based on their theme
    const collectionProductsData: {
      id: string;
      collectionId: string;
      productId: string;
      displayOrder: number;
    }[] = [];

    // Find collections
    const heartCollection = collectionData.find(c => c.slug === "heart-of-diamond-collections");
    const flowerCollection = collectionData.find(c => c.slug === "together-forever-collection");

    if (!heartCollection || !flowerCollection) {
      console.error("❌ Collections not found");
      process.exit(1);
    }

    // Assign products to collections based on their name/slug
    let heartDisplayOrder = 1;
    let flowerDisplayOrder = 1;

    for (const product of existingProducts) {
      const productName = product.name.toLowerCase();
      const productSlug = product.slug.toLowerCase();

      // Heart Shape products go to Heart of Diamond Collection
      if (productName.includes("heart shape") || productSlug.includes("heart-shape")) {
        collectionProductsData.push({
          id: nanoid(),
          collectionId: heartCollection.id,
          productId: product.id,
          displayOrder: heartDisplayOrder++,
        });
        console.log(`   ✓ Linked "${product.name}" to Heart of Diamond Collection`);
      }
      // Flower products go to Together Forever Collection
      else if (productName.includes("flower") || productSlug.includes("flower")) {
        collectionProductsData.push({
          id: nanoid(),
          collectionId: flowerCollection.id,
          productId: product.id,
          displayOrder: flowerDisplayOrder++,
        });
        console.log(`   ✓ Linked "${product.name}" to Together Forever Collection`);
      }
    }

    await db.insert(collectionProducts).values(collectionProductsData);
    console.log(`✅ Created ${collectionProductsData.length} Collection-Product Links`);

    console.log("\n✨ Collections Seeding Completed Successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - ${collectionData.length} Collections`);
    console.log(`   - ${collectionProductsData.length} Product-Collection Links\n`);

    // Display collection details
    console.log("📚 Collections Created:");
    for (const collection of collectionData) {
      const productCount = collectionProductsData.filter(
        (cp) => cp.collectionId === collection.id
      ).length;
      console.log(`   • ${collection.name}: "${collection.tagline}" (${productCount} pieces)`);
    }
    console.log("");
  } catch (error) {
    console.error("\n❌ Error Seeding Collections:");
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
}

seedCollections();
