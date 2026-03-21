import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  email: text("email").notNull().unique(),
  confirmed: boolean("confirmed").notNull().default(false),
  confirmationToken: text("confirmation_token")
    .notNull()
    .unique()
    .$defaultFn(() => nanoid(32)),
  subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
  unsubscribeToken: text("unsubscribe_token")
    .notNull()
    .unique()
    .$defaultFn(() => nanoid(32)),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type NewNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;
