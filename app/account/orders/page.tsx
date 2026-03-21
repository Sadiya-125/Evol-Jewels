"use client";

import Link from "next/link";
import { format } from "date-fns";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { trpc } from "@/lib/trpc/client";

export default function OrdersPage() {
  const { data: orders, isLoading } = trpc.orders.list.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-body text-evol-metallic">Loading Orders...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-evol-dark-grey mb-4">
            No orders yet
          </h1>
          <p className="font-body text-evol-metallic mb-6">
            Start shopping to see your orders here
          </p>
          <Link href="/shop">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-evol-off-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl text-evol-dark-grey mb-8">
          Your Orders
        </h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block bg-white border-2 border-evol-grey p-6 hover:border-evol-dark-grey transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <p className="font-sans text-sm text-evol-dark-grey mb-1">
                    Order #{order.orderNumber}
                  </p>
                  <p className="font-body text-sm text-evol-metallic">
                    {format(new Date(order.createdAt), "PPP")}
                  </p>
                </div>
                <Badge
                  variant={
                    order.status === "delivered"
                      ? "success"
                      : order.status === "cancelled"
                        ? "error"
                        : "default"
                  }
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <p className="font-body text-sm text-evol-metallic">Total</p>
                <p className="font-sans text-lg font-bold text-evol-dark-grey">
                  ₹{parseFloat(order.total).toLocaleString("en-IN")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
