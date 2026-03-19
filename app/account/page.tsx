"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, LogOut, ShoppingBag, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useSession } from "@/hooks/useSession";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";

export default function AccountPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  // Fetch user's orders
  const { data: orders, isLoading: ordersLoading } = trpc.orders.list.useQuery(undefined, {
    enabled: !!session,
  });

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      setSigningOut(false);
    }
  };

  if (isPending || !session) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-body text-evol-metallic">Loading...</p>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Account" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl text-evol-dark-grey mb-2">
                Your Account
              </h1>
              <p className="font-body text-evol-metallic">
                Welcome back, {session.user?.name || session.user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              loading={signingOut}
              className="hidden sm:flex"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-evol-light-grey p-6 border border-evol-grey">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-evol-off-white flex items-center justify-center">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-evol-dark-grey" />
                  )}
                </div>
                <div>
                  <h3 className="font-sans text-sm font-medium text-evol-dark-grey">
                    {session.user?.name || "User"}
                  </h3>
                  <p className="font-body text-xs text-evol-metallic">
                    {session.user?.email}
                  </p>
                </div>
              </div>
              <Button variant="secondary" className="w-full">
                Edit Profile
              </Button>
            </div>

            {/* Orders Card */}
            <div className="bg-evol-light-grey p-6 border border-evol-grey">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingBag className="h-6 w-6 text-evol-red" />
                <h3 className="font-sans text-sm font-medium text-evol-dark-grey uppercase tracking-widest">
                  Orders
                </h3>
              </div>
              <p className="font-body text-sm text-evol-metallic mb-4">
                {ordersLoading ? (
                  "Loading Orders..."
                ) : orders && orders.length > 0 ? (
                  `You have ${orders.length} Order${orders.length === 1 ? "" : "s"}`
                ) : (
                  "No Orders Yet. Start Shopping!"
                )}
              </p>
              <Button
                variant="secondary"
                className="w-full"
                disabled={ordersLoading || !orders || orders.length === 0}
                onClick={() => {
                  document.getElementById("orders-list")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {orders && orders.length > 0 ? "View Orders" : "Browse Shop"}
              </Button>
            </div>

            {/* Addresses Card */}
            <div className="bg-evol-light-grey p-6 border border-evol-grey">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-6 w-6 text-evol-red" />
                <h3 className="font-sans text-sm font-medium text-evol-dark-grey uppercase tracking-widest">
                  Addresses
                </h3>
              </div>
              <p className="font-body text-sm text-evol-metallic mb-4">
                Manage your shipping and billing addresses
              </p>
              <Button variant="secondary" className="w-full">
                Manage Addresses
              </Button>
            </div>
          </div>

          {/* Orders List */}
          {orders && orders.length > 0 && (
            <div id="orders-list" className="mt-12">
              <h2 className="font-serif text-2xl text-evol-dark-grey mb-6">
                Your Orders
              </h2>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-evol-light-grey p-6 border border-evol-grey"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="font-sans text-sm font-medium text-evol-dark-grey mb-1">
                          Order #{order.orderNumber}
                        </p>
                        <p className="font-body text-xs text-evol-metallic">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-body text-sm text-evol-metallic mb-1">
                            Status
                          </p>
                          <p className="font-sans text-sm font-medium text-evol-dark-grey capitalize">
                            {order.status}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-body text-sm text-evol-metallic mb-1">
                            Total
                          </p>
                          <p className="font-sans text-sm font-medium text-evol-dark-grey">
                            ₹{parseFloat(order.total).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Sign Out */}
          <div className="sm:hidden mt-8">
            <Button
              variant="secondary"
              onClick={handleSignOut}
              loading={signingOut}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
