import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { user } from "./index";

export const customisationInquiries = pgTable("customisation_inquiries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  requirement: text("requirement").notNull(),
  budgetRange: text("budget_range"), // optional: under_50k, 50k_1l, 1l_3l, 3l_5l, above_5l
  occasion: text("occasion"), // optional: engagement, wedding, anniversary, birthday, self, gift, other
  timeline: text("timeline"), // optional: When do you need it by?
  referenceImageUrl: text("reference_image_url"), // Cloudinary URL
  referenceImageKey: text("reference_image_key"), // Cloudinary public_id for deletion
  status: text("status").notNull().default("new"), // new, reviewed, in_discussion, quoted, completed, cancelled
  adminNotes: text("admin_notes"), // internal notes, not visible to customer
  userId: text("user_id").references(() => user.id), // nullable - guests can submit
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CustomisationInquiry = typeof customisationInquiries.$inferSelect;
export type NewCustomisationInquiry = typeof customisationInquiries.$inferInsert;
