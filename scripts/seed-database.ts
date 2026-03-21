import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function seedDatabase() {
  console.log("\n🌱 Starting Database Seed...\n");

  const { db } = await import("../lib/db");
  const { nanoid } = await import("nanoid");
  const {
    user,
    categories,
    baseVariants,
    stoneSpecifications,
    products,
    productVariants,
    stores,
    items,
    orders,
    orderItems,
    payments,
  } = await import("@/db/schema");

  try {
    // 1. Seed Users (including Admin)
    console.log("👤 Seeding Users...");
    const now = new Date();
    const userData = [
      {
        id: nanoid(),
        name: "Admin User",
        email: "admin@evoljewels.com",
        phone: "+91 9876543210",
        emailVerified: true,
        image: null,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: nanoid(),
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        phone: "+91 9876543211",
        emailVerified: true,
        image: null,
        role: "customer",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: nanoid(),
        name: "Rahul Mehta",
        email: "rahul.mehta@example.com",
        phone: "+91 9876543212",
        emailVerified: true,
        image: null,
        role: "customer",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: nanoid(),
        name: "Anita Reddy",
        email: "anita.reddy@example.com",
        phone: "+91 9876543213",
        emailVerified: true,
        image: null,
        role: "customer",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: nanoid(),
        name: "Vikram Singh",
        email: "vikram.singh@example.com",
        phone: "+91 9876543214",
        emailVerified: false,
        image: null,
        role: "customer",
        createdAt: now,
        updatedAt: now,
      },
    ];

    await db.insert(user).values(userData);
    console.log(`✅ Created ${userData.length} Users (including 1 Admin)`);

    // 2. Seed Categories
    console.log("\n📁 Seeding Categories...");
    const categoryData = [
      {
        id: nanoid(),
        name: "Rings",
        slug: "rings",
        description: "Timeless rings crafted with precision and artistry",
        image:
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
      },
      {
        id: nanoid(),
        name: "Necklaces",
        slug: "necklaces",
        description: "Elegant necklaces that complement every neckline",
        image:
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
      },
      {
        id: nanoid(),
        name: "Earrings",
        slug: "earrings",
        description: "Delicate earrings designed to frame your face",
        image:
          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
      },
      {
        id: nanoid(),
        name: "Bracelets",
        slug: "bracelets",
        description: "Refined bracelets that adorn your wrists",
        image:
          "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80",
      },
      {
        id: nanoid(),
        name: "Pendants",
        slug: "pendants",
        description: "Stunning pendants that make a statement",
        image:
          "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80",
      },
    ];

    await db.insert(categories).values(categoryData);
    console.log(`✅ Created ${categoryData.length} Categories`);

    // 3. Seed Base Variants (Gold Types)
    console.log("\n💎 Seeding Base Variants...");
    const baseVariantData = [
      // 18K Variants
      {
        id: nanoid(),
        name: "18K Yellow Gold",
        goldKarat: "18K",
        goldColor: "Yellow",
        goldWeight: 5,
        isCustomizable: true,
      },
      {
        id: nanoid(),
        name: "18K White Gold",
        goldKarat: "18K",
        goldColor: "White",
        goldWeight: 5,
        isCustomizable: true,
      },
      {
        id: nanoid(),
        name: "18K Rose Gold",
        goldKarat: "18K",
        goldColor: "Rose",
        goldWeight: 5,
        isCustomizable: true,
      },
      // 22K Variants
      {
        id: nanoid(),
        name: "22K Yellow Gold",
        goldKarat: "22K",
        goldColor: "Yellow",
        goldWeight: 6,
        isCustomizable: false,
      },
      {
        id: nanoid(),
        name: "22K Rose Gold",
        goldKarat: "22K",
        goldColor: "Rose",
        goldWeight: 6,
        isCustomizable: false,
      },
      // 24K Variants
      {
        id: nanoid(),
        name: "24K Yellow Gold",
        goldKarat: "24K",
        goldColor: "Yellow",
        goldWeight: 8,
        isCustomizable: false,
      },
    ];

    await db.insert(baseVariants).values(baseVariantData);
    console.log(`✅ Created ${baseVariantData.length} Base Variants`);

    // 4. Seed Stone Specifications
    console.log("\n💠 Seeding Stone Specifications...");
    const stoneSpecData = [
      {
        id: nanoid(),
        stoneType: "Diamond",
        stoneQuality: "VVS1",
        stoneColor: "D",
        stoneWeight: "0.50",
        stoneCount: 1,
      },
      {
        id: nanoid(),
        stoneType: "Diamond",
        stoneQuality: "VS1",
        stoneColor: "E",
        stoneWeight: "0.30",
        stoneCount: 3,
      },
      {
        id: nanoid(),
        stoneType: "Diamond",
        stoneQuality: "SI1",
        stoneColor: "F",
        stoneWeight: "0.25",
        stoneCount: 5,
      },
      {
        id: nanoid(),
        stoneType: "Ruby",
        stoneQuality: "AAA",
        stoneColor: "Pigeon Blood Red",
        stoneWeight: "1.00",
        stoneCount: 1,
      },
      {
        id: nanoid(),
        stoneType: "Emerald",
        stoneQuality: "AA",
        stoneColor: "Deep Green",
        stoneWeight: "0.75",
        stoneCount: 1,
      },
      {
        id: nanoid(),
        stoneType: "Sapphire",
        stoneQuality: "AAA",
        stoneColor: "Royal Blue",
        stoneWeight: "0.60",
        stoneCount: 1,
      },
      {
        id: nanoid(),
        stoneType: "Pearl",
        stoneQuality: "AA",
        stoneColor: "Cream White",
        stoneWeight: "2.00",
        stoneCount: 1,
      },
    ];

    await db.insert(stoneSpecifications).values(stoneSpecData);
    console.log(`✅ Created ${stoneSpecData.length} Stone Specifications`);

    // 5. Seed Products
    console.log("\n📦 Seeding Products...");
    const productData = [
      // Heart Shape Diamond Products (for Heart of Diamond Collection)
      {
        id: nanoid(),
        name: "Heart Shape Diamond Solitaire Ring",
        slug: "heart-shape-diamond-solitaire-ring",
        description:
          "A stunning heart-shaped lab grown diamond solitaire ring. Perfect for engagements and romantic occasions.",
        categoryId: categoryData[0].id, // Rings
        basePrice: "95000.00",
        images: [
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
          "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800",
        ],
        isFeatured: true,
        isActive: true,
        makingCharges: "5500.00",
        gst: "3.00",
        stockQuantity: 8,
      },
      {
        id: nanoid(),
        name: "Heart Shape Diamond Pendant",
        slug: "heart-shape-diamond-pendant",
        description:
          "A romantic heart-shaped lab grown diamond pendant that captures the essence of love.",
        categoryId: categoryData[4].id, // Pendants
        basePrice: "65000.00",
        images: [
          "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800",
          "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
        ],
        isFeatured: true,
        isActive: true,
        makingCharges: "4000.00",
        gst: "3.00",
        stockQuantity: 10,
      },
      {
        id: nanoid(),
        name: "Heart Shape Diamond Earrings",
        slug: "heart-shape-diamond-earrings",
        description:
          "Elegant heart-shaped lab grown diamond earrings. A symbol of eternal love.",
        categoryId: categoryData[2].id, // Earrings
        basePrice: "75000.00",
        images: [
          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
          "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80",
        ],
        isFeatured: true,
        isActive: true,
        makingCharges: "4500.00",
        gst: "3.00",
        stockQuantity: 6,
      },
      {
        id: nanoid(),
        name: "Heart Shape Diamond Necklace",
        slug: "heart-shape-diamond-necklace",
        description:
          "A delicate necklace featuring a stunning heart-shaped lab grown diamond centerpiece.",
        categoryId: categoryData[1].id, // Necklaces
        basePrice: "125000.00",
        images: [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
        ],
        isFeatured: true,
        isActive: true,
        makingCharges: "7000.00",
        gst: "3.00",
        stockQuantity: 5,
      },
      {
        id: nanoid(),
        name: "Heart Shape Diamond Bracelet",
        slug: "heart-shape-diamond-bracelet",
        description:
          "An enchanting bracelet with heart-shaped lab grown diamonds linked in harmony.",
        categoryId: categoryData[3].id, // Bracelets
        basePrice: "115000.00",
        images: [
          "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
          "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800",
        ],
        isFeatured: false,
        isActive: true,
        makingCharges: "6500.00",
        gst: "3.00",
        stockQuantity: 4,
      },
      // Flower Diamond Products (for Together Forever Collection)
      {
        id: nanoid(),
        name: "Flower Diamond Ring",
        slug: "flower-diamond-ring",
        description:
          "A captivating ring featuring lab grown diamonds arranged in a beautiful flower motif.",
        categoryId: categoryData[0].id, // Rings
        basePrice: "85000.00",
        images: [
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
          "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800",
        ],
        isFeatured: true,
        isActive: true,
        makingCharges: "5000.00",
        gst: "3.00",
        stockQuantity: 10,
      },
      {
        id: nanoid(),
        name: "Flower Diamond Pendant",
        slug: "flower-diamond-pendant",
        description:
          "A delicate pendant with lab grown diamonds forming a stunning floral design.",
        categoryId: categoryData[4].id, // Pendants
        basePrice: "55000.00",
        images: [
          "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800",
          "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800",
        ],
        isFeatured: true,
        isActive: true,
        makingCharges: "3500.00",
        gst: "3.00",
        stockQuantity: 12,
      },
      {
        id: nanoid(),
        name: "Flower Diamond Earrings",
        slug: "flower-diamond-earrings",
        description:
          "Exquisite earrings featuring lab grown diamonds arranged in elegant floral patterns.",
        categoryId: categoryData[2].id, // Earrings
        basePrice: "65000.00",
        images: [
          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
          "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800",
        ],
        isFeatured: true,
        isActive: true,
        makingCharges: "4000.00",
        gst: "3.00",
        stockQuantity: 8,
      },
      {
        id: nanoid(),
        name: "Flower Diamond Necklace",
        slug: "flower-diamond-necklace",
        description:
          "A stunning necklace with lab grown diamonds forming intricate floral designs.",
        categoryId: categoryData[1].id, // Necklaces
        basePrice: "135000.00",
        images: [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
        ],
        isFeatured: true,
        isActive: true,
        makingCharges: "8000.00",
        gst: "3.00",
        stockQuantity: 4,
      },
      {
        id: nanoid(),
        name: "Flower Diamond Bracelet",
        slug: "flower-diamond-bracelet",
        description:
          "An enchanting bracelet adorned with lab grown diamonds in beautiful flower motifs.",
        categoryId: categoryData[3].id, // Bracelets
        basePrice: "95000.00",
        images: [
          "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800",
          "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
        ],
        isFeatured: false,
        isActive: true,
        makingCharges: "6000.00",
        gst: "3.00",
        stockQuantity: 6,
      },
      // Additional General Products
      {
        id: nanoid(),
        name: "Eternal Solitaire Ring",
        slug: "eternal-solitaire-ring",
        description:
          "A timeless solitaire ring featuring a brilliant-cut diamond set in refined gold. This piece embodies understated elegance and enduring beauty.",
        categoryId: categoryData[0].id, // Rings
        basePrice: "85000.00",
        images: [
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
          "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800",
        ],
        isFeatured: true,
        isActive: true,
        makingCharges: "5000.00",
        gst: "3.00",
        stockQuantity: 10,
      },
      {
        id: nanoid(),
        name: "Heritage Gold Necklace",
        slug: "heritage-gold-necklace",
        description:
          "A classic gold necklace inspired by traditional Indian craftsmanship. Delicate filigree work meets contemporary design in this stunning piece.",
        categoryId: categoryData[1].id, // Necklaces
        basePrice: "125000.00",
        images: [
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
        ],
        isFeatured: true,
        isActive: true,
        makingCharges: "8000.00",
        gst: "3.00",
        stockQuantity: 5,
      },
      {
        id: nanoid(),
        name: "Cascade Diamond Earrings",
        slug: "cascade-diamond-earrings",
        description:
          "Graceful drop earrings adorned with carefully selected diamonds. Each stone catches the light to create a mesmerizing cascade effect.",
        categoryId: categoryData[2].id, // Earrings
        basePrice: "65000.00",
        images: [
          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
          "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80",
        ],
        isFeatured: true,
        isActive: true,
        makingCharges: "4000.00",
        gst: "3.00",
        stockQuantity: 8,
      },
      {
        id: nanoid(),
        name: "Celestial Bangle",
        slug: "celestial-bangle",
        description:
          "A refined bangle featuring intricate patterns inspired by celestial bodies. The perfect balance of weight and wearability.",
        categoryId: categoryData[3].id, // Bracelets
        basePrice: "95000.00",
        images: [
          "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
          "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800",
        ],
        isFeatured: false,
        isActive: true,
        makingCharges: "6000.00",
        gst: "3.00",
        stockQuantity: 6,
      },
      {
        id: nanoid(),
        name: "Radiant Ruby Ring",
        slug: "radiant-ruby-ring",
        description:
          "A statement ring showcasing a vivid ruby surrounded by diamond accents. Bold yet refined, this piece commands attention.",
        categoryId: categoryData[0].id, // Rings
        basePrice: "155000.00",
        images: [
          "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800",
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
        ],
        isFeatured: true,
        isActive: true,
        makingCharges: "8000.00",
        gst: "3.00",
        stockQuantity: 4,
      },
      {
        id: nanoid(),
        name: "Minimalist Gold Studs",
        slug: "minimalist-gold-studs",
        description:
          "Simple yet sophisticated gold studs for everyday elegance. These versatile earrings complement any outfit, from casual to formal.",
        categoryId: categoryData[2].id, // Earrings
        basePrice: "25000.00",
        images: [
          "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800",
          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
        ],
        isFeatured: false,
        isActive: true,
        makingCharges: "2000.00",
        gst: "3.00",
        stockQuantity: 15,
      },
      {
        id: nanoid(),
        name: "Royal Emerald Pendant",
        slug: "royal-emerald-pendant",
        description:
          "An exquisite pendant featuring a natural emerald of exceptional clarity. Surrounded by a halo of brilliant diamonds.",
        categoryId: categoryData[4].id, // Pendants
        basePrice: "185000.00",
        images: [
          "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800",
          "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
        ],
        isFeatured: true,
        isActive: true,
        makingCharges: "10000.00",
        gst: "3.00",
        stockQuantity: 3,
      },
      {
        id: nanoid(),
        name: "Pearl Elegance Necklace",
        slug: "pearl-elegance-necklace",
        description:
          "A graceful necklace featuring lustrous South Sea pearls. The epitome of classic luxury and refined taste.",
        categoryId: categoryData[1].id, // Necklaces
        basePrice: "145000.00",
        images: [
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
        ],
        isFeatured: false,
        isActive: true,
        makingCharges: "7000.00",
        gst: "3.00",
        stockQuantity: 4,
      },
      {
        id: nanoid(),
        name: "Sapphire Dreams Bracelet",
        slug: "sapphire-dreams-bracelet",
        description:
          "An enchanting bracelet adorned with royal blue sapphires. Each stone is hand-selected for its color saturation and brilliance.",
        categoryId: categoryData[3].id, // Bracelets
        basePrice: "175000.00",
        images: [
          "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800",
          "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
        ],
        isFeatured: true,
        isActive: true,
        makingCharges: "9000.00",
        gst: "3.00",
        stockQuantity: 2,
      },
      {
        id: nanoid(),
        name: "Classic Diamond Band",
        slug: "classic-diamond-band",
        description:
          "A timeless eternity band featuring channel-set diamonds. Perfect as a wedding band or anniversary gift.",
        categoryId: categoryData[0].id, // Rings
        basePrice: "75000.00",
        images: [
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
          "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800",
        ],
        isFeatured: false,
        isActive: true,
        makingCharges: "4500.00",
        gst: "3.00",
        stockQuantity: 12,
      },
    ];

    await db.insert(products).values(productData);
    console.log(`✅ Created ${productData.length} Products`);

    // 6. Seed Product Variants
    console.log("\n🎨 Seeding Product Variants...");
    const variantData: {
      id: string;
      productId: string;
      baseVariantId: string;
      stoneSpecId: string | null;
      sku: string;
      variantPrice: string;
      stockQuantity: number;
    }[] = [];

    // Create 2-3 variants per product
    for (const product of productData) {
      const basePrice = parseFloat(product.basePrice);

      // Variant 1: 18K Yellow Gold with Diamond
      variantData.push({
        id: nanoid(),
        productId: product.id,
        baseVariantId: baseVariantData[0].id, // 18K Yellow Gold
        stoneSpecId: stoneSpecData[0].id, // Diamond VVS1
        sku: `${product.slug}-18k-yellow-diamond`.toUpperCase().slice(0, 50),
        variantPrice: basePrice.toFixed(2),
        stockQuantity: Math.floor(product.stockQuantity / 2) || 1,
      });

      // Variant 2: 18K White Gold with Diamond
      variantData.push({
        id: nanoid(),
        productId: product.id,
        baseVariantId: baseVariantData[1].id, // 18K White Gold
        stoneSpecId: stoneSpecData[1].id, // Diamond VS1
        sku: `${product.slug}-18k-white-diamond`.toUpperCase().slice(0, 50),
        variantPrice: (basePrice * 1.05).toFixed(2),
        stockQuantity: Math.floor(product.stockQuantity / 3) || 1,
      });

      // Variant 3: 18K Rose Gold (only for featured products)
      if (product.isFeatured) {
        variantData.push({
          id: nanoid(),
          productId: product.id,
          baseVariantId: baseVariantData[2].id, // 18K Rose Gold
          stoneSpecId: stoneSpecData[0].id, // Diamond VVS1
          sku: `${product.slug}-18k-rose-diamond`.toUpperCase().slice(0, 50),
          variantPrice: (basePrice * 1.08).toFixed(2),
          stockQuantity: Math.floor(product.stockQuantity / 4) || 1,
        });
      }
    }

    await db.insert(productVariants).values(variantData);
    console.log(`✅ Created ${variantData.length} Product Variants`);

    // 7. Seed Stores
    console.log("\n🏪 Seeding Stores...");
    const storeData = [
      {
        id: nanoid(),
        name: "Banjara Hills Flagship",
        slug: "banjara-hills-flagship",
        address: "Road No. 12, Banjara Hills",
        city: "Hyderabad",
        state: "Telangana",
        postalCode: "500034",
        country: "India",
        phone: "+91 40 2354 8900",
        email: "banjarahills@evoljewels.com",
        openingHours:
          "Monday - Saturday: 11:00 AM - 8:00 PM, Sunday: 12:00 PM - 6:00 PM",
        coordinates: "17.4239,78.4738",
        isActive: true,
      },
      {
        id: nanoid(),
        name: "Jubilee Hills Boutique",
        slug: "jubilee-hills-boutique",
        address: "Plot No. 78, Jubilee Hills",
        city: "Hyderabad",
        state: "Telangana",
        postalCode: "500033",
        country: "India",
        phone: "+91 40 2355 7800",
        email: "jubileehills@evoljewels.com",
        openingHours: "Monday - Saturday: 11:00 AM - 8:00 PM, Sunday: Closed",
        coordinates: "17.4326,78.4071",
        isActive: true,
      },
      {
        id: nanoid(),
        name: "Secunderabad Heritage",
        slug: "secunderabad-heritage",
        address: "MG Road, Secunderabad",
        city: "Hyderabad",
        state: "Telangana",
        postalCode: "500003",
        country: "India",
        phone: "+91 40 2784 5600",
        email: "secunderabad@evoljewels.com",
        openingHours:
          "Monday - Saturday: 10:30 AM - 8:30 PM, Sunday: 11:00 AM - 5:00 PM",
        coordinates: "17.4399,78.4983",
        isActive: true,
      },
    ];

    await db.insert(stores).values(storeData);
    console.log(`✅ Created ${storeData.length} Stores`);

    // 8. Seed Items (Inventory)
    console.log("\n📦 Seeding Inventory Items...");
    const itemsData: {
      id: string;
      storeId: string;
      productVariantId: string;
      quantity: number;
      reservedQuantity: number;
    }[] = [];

    // Distribute variants across stores
    for (const variant of variantData) {
      for (const store of storeData) {
        // Random quantity between 0 and 5
        const quantity = Math.floor(Math.random() * 6);
        const reservedQuantity =
          quantity > 0 ? Math.floor(Math.random() * Math.min(2, quantity)) : 0;

        itemsData.push({
          id: nanoid(),
          storeId: store.id,
          productVariantId: variant.id,
          quantity,
          reservedQuantity,
        });
      }
    }

    await db.insert(items).values(itemsData);
    console.log(`✅ Created ${itemsData.length} Inventory Items`);

    // 9. Seed Orders
    console.log("\n🛒 Seeding Orders...");
    const orderStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    const orderData: {
      id: string;
      userId: string;
      storeId: string | null;
      orderNumber: string;
      status: string;
      subtotal: string;
      tax: string;
      shippingCost: string;
      total: string;
      shippingAddress: string;
      billingAddress: string;
      notes: string | null;
      createdAt: Date;
    }[] = [];

    // Create orders for each customer (not admin)
    const customers = userData.filter((u) => u.role === "customer");
    let orderCounter = 1000;

    for (const customer of customers) {
      // Each customer gets 1-3 orders
      const numOrders = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < numOrders; i++) {
        const subtotal = (Math.random() * 200000 + 50000).toFixed(2);
        const tax = (parseFloat(subtotal) * 0.03).toFixed(2);
        const shippingCost = parseFloat(subtotal) > 100000 ? "0.00" : "500.00";
        const total = (
          parseFloat(subtotal) +
          parseFloat(tax) +
          parseFloat(shippingCost)
        ).toFixed(2);
        const daysAgo = Math.floor(Math.random() * 30);
        const orderDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        orderData.push({
          id: nanoid(),
          userId: customer.id,
          storeId:
            Math.random() > 0.7
              ? storeData[Math.floor(Math.random() * storeData.length)].id
              : null,
          orderNumber: `Evol-${orderCounter++}`,
          status:
            orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
          subtotal,
          tax,
          shippingCost,
          total,
          shippingAddress: `${Math.floor(Math.random() * 999) + 1}, Street ${Math.floor(Math.random() * 99) + 1}, Hyderabad, Telangana 500${Math.floor(
            Math.random() * 99,
          )
            .toString()
            .padStart(2, "0")}, India`,
          billingAddress: `${Math.floor(Math.random() * 999) + 1}, Street ${Math.floor(Math.random() * 99) + 1}, Hyderabad, Telangana 500${Math.floor(
            Math.random() * 99,
          )
            .toString()
            .padStart(2, "0")}, India`,
          notes: Math.random() > 0.8 ? "Gift wrap requested" : null,
          createdAt: orderDate,
        });
      }
    }

    await db.insert(orders).values(orderData);
    console.log(`✅ Created ${orderData.length} Orders`);

    // 10. Seed Order Items
    console.log("\n📋 Seeding Order Items...");
    const orderItemsData: {
      id: string;
      orderId: string;
      productVariantId: string;
      quantity: number;
      unitPrice: string;
      subtotal: string;
      customizationDetails: string | null;
    }[] = [];

    for (const order of orderData) {
      // Each order has 1-3 items
      const numItems = Math.floor(Math.random() * 3) + 1;
      const usedVariants = new Set<string>();

      for (let i = 0; i < numItems; i++) {
        let variant;
        do {
          variant = variantData[Math.floor(Math.random() * variantData.length)];
        } while (usedVariants.has(variant.id));
        usedVariants.add(variant.id);

        const quantity = Math.floor(Math.random() * 2) + 1;
        const unitPrice = variant.variantPrice;
        const subtotal = (parseFloat(unitPrice) * quantity).toFixed(2);

        orderItemsData.push({
          id: nanoid(),
          orderId: order.id,
          productVariantId: variant.id,
          quantity,
          unitPrice,
          subtotal,
          customizationDetails:
            Math.random() > 0.9
              ? JSON.stringify({ engraving: "With Love" })
              : null,
        });
      }
    }

    await db.insert(orderItems).values(orderItemsData);
    console.log(`✅ Created ${orderItemsData.length} Order Items`);

    // 11. Seed Payments
    console.log("\n💳 Seeding Payments...");
    const paymentMethods = ["card", "upi", "netbanking", "wallet"];
    const paymentsData: {
      id: string;
      orderId: string;
      paymentMethod: string;
      paymentGateway: string;
      transactionId: string;
      status: string;
      amount: string;
      currency: string;
      paymentDetails: string | null;
    }[] = [];

    for (const order of orderData) {
      // Match payment status to order status
      let paymentStatus = "completed";
      if (order.status === "pending") paymentStatus = "pending";
      if (order.status === "cancelled")
        paymentStatus = Math.random() > 0.5 ? "failed" : "refunded";

      paymentsData.push({
        id: nanoid(),
        orderId: order.id,
        paymentMethod:
          paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        paymentGateway: "razorpay",
        transactionId: `pay_${nanoid(14)}`,
        status: paymentStatus,
        amount: order.total,
        currency: "INR",
        paymentDetails: JSON.stringify({
          gateway_order_id: `order_${nanoid(14)}`,
        }),
      });
    }

    await db.insert(payments).values(paymentsData);
    console.log(`✅ Created ${paymentsData.length} Payments`);

    console.log("\n✨ Database Seeding Completed Successfully!\n");
    console.log("📊 Summary:");
    console.log(
      `   - ${userData.length} Users (1 Admin, ${userData.length - 1} Customers)`,
    );
    console.log(`   - ${categoryData.length} Categories`);
    console.log(`   - ${baseVariantData.length} Base Variants`);
    console.log(`   - ${stoneSpecData.length} Stone Specifications`);
    console.log(`   - ${productData.length} Products`);
    console.log(`   - ${variantData.length} Product Variants`);
    console.log(`   - ${storeData.length} Stores`);
    console.log(`   - ${itemsData.length} Inventory Items`);
    console.log(`   - ${orderData.length} Orders`);
    console.log(`   - ${orderItemsData.length} Order Items`);
    console.log(`   - ${paymentsData.length} Payments\n`);
  } catch (error) {
    console.error("\n❌ Error Seeding Database:");
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
}

seedDatabase();
