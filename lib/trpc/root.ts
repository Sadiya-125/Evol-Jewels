import { router } from "./trpc";
import { productsRouter } from "./routers/products";
import { categoriesRouter } from "./routers/categories";
import { storesRouter } from "./routers/stores";
import { ordersRouter } from "./routers/orders";
import { adminRouter } from "./routers/admin";
import { collectionsRouter } from "./routers/collections";
import { usersRouter } from "./routers/users";
import { cartRouter } from "./routers/cart";
import { wishlistRouter } from "./routers/wishlist";
import { newsletterRouter } from "./routers/newsletter";
import { customiseRouter } from "./routers/customise";

export const appRouter = router({
  products: productsRouter,
  categories: categoriesRouter,
  stores: storesRouter,
  orders: ordersRouter,
  admin: adminRouter,
  collections: collectionsRouter,
  users: usersRouter,
  cart: cartRouter,
  wishlist: wishlistRouter,
  newsletter: newsletterRouter,
  customise: customiseRouter,
});

export type AppRouter = typeof appRouter;
