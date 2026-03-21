import { appRouter } from "./root";
import { createTRPCContext } from "./context";
import { headers } from "next/headers";

/**
 * Server-side tRPC caller for use in Server Components
 */
export async function getServerCaller() {
  const headersList = await headers();
  const ctx = await createTRPCContext({ headers: headersList });
  return appRouter.createCaller(ctx);
}
