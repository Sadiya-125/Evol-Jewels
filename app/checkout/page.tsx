"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Check, Edit2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import OrderSummaryPanel from "@/components/checkout/OrderSummaryPanel";
import { useCartStore } from "@/lib/stores/cart";
import { useSession } from "@/hooks/useSession";
import { trpc } from "@/lib/trpc/client";

// Indian states list
const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

// Validation schemas
const contactSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
});

const addressSchema = z.object({
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pinCode: z.string().regex(/^\d{6}$/, "PIN code must be 6 digits"),
  country: z.string().default("India"),
});

type ContactInfo = z.infer<typeof contactSchema>;
type AddressInfo = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Step 1: Contact Information
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    fullName: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
  });
  const [contactErrors, setContactErrors] = useState<
    Partial<Record<keyof ContactInfo, string>>
  >({});

  // Step 2: Delivery Address
  const [deliveryAddress, setDeliveryAddress] = useState<AddressInfo>({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
  });
  const [billingAddress, setBillingAddress] = useState<AddressInfo>({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
  });
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressErrors, setAddressErrors] = useState<
    Partial<Record<keyof AddressInfo, string>>
  >({});

  // Step 3: Order Notes
  const [orderNotes, setOrderNotes] = useState("");

  const createOrderMutation = trpc.orders.create.useMutation();
  const saveAddressMutation = trpc.users.saveAddress.useMutation();
  const savePhoneMutation = trpc.users.savePhone.useMutation();

  // Load user profile to get saved address
  const { data: userProfile } = trpc.users.getProfile.useQuery(undefined, {
    enabled: !!session,
  });

  // Prefill phone number from user profile when it becomes available
  useEffect(() => {
    if (userProfile?.phone && contactInfo.phone === "") {
      // Extract digits only (remove +91 if present)
      const phoneDigits = userProfile.phone.replace(/^\+91/, "");
      setContactInfo((prev) => ({ ...prev, phone: phoneDigits }));
    }
  }, [userProfile?.phone]);

  // Prefill delivery address from saved address if available
  useEffect(() => {
    if (userProfile?.savedAddress && deliveryAddress.line1 === "") {
      setDeliveryAddress(userProfile.savedAddress);
    }
  }, [userProfile?.savedAddress]);

  // Validate and proceed from Step 1
  const handleStep1Continue = () => {
    try {
      contactSchema.parse(contactInfo);
      setContactErrors({});
      setCurrentStep(2);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof ContactInfo, string>> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof ContactInfo] = err.message;
          }
        });
        setContactErrors(errors);
      }
    }
  };

  // Validate and proceed from Step 2
  const handleStep2Continue = () => {
    try {
      addressSchema.parse(deliveryAddress);
      if (!useSameAddress) {
        addressSchema.parse(billingAddress);
      }
      setAddressErrors({});
      setCurrentStep(3);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof AddressInfo, string>> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof AddressInfo] = err.message;
          }
        });
        setAddressErrors(errors);
      }
    }
  };

  // Place order
  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);

    try {
      const orderData = {
        items: items.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        shippingAddress: {
          name: contactInfo.fullName,
          phone: contactInfo.phone,
          ...deliveryAddress,
        },
        billingAddress: useSameAddress
          ? {
              name: contactInfo.fullName,
              phone: contactInfo.phone,
              ...deliveryAddress,
            }
          : {
              name: contactInfo.fullName,
              phone: contactInfo.phone,
              ...billingAddress,
            },
        notes: orderNotes,
      };

      const result = await createOrderMutation.mutateAsync(orderData);

      // Save phone number if not already saved (format: +91XXXXXXXXXX)
      if (session && !userProfile?.phone && contactInfo.phone) {
        try {
          const formattedPhone = `+91${contactInfo.phone}`;
          await savePhoneMutation.mutateAsync({ phone: formattedPhone });
        } catch (error) {
          // Silent fail - order was already placed successfully
          console.error("Failed to save phone:", error);
        }
      }

      // Save address to user profile if checkbox is checked
      if (saveAddress) {
        try {
          await saveAddressMutation.mutateAsync(deliveryAddress);
        } catch (error) {
          // Silent fail - order was already placed successfully
          console.error("Failed to save address:", error);
        }
      }

      // Set flag to prevent empty cart redirect
      setOrderPlaced(true);

      // Clear cart on success
      clearCart();

      // Hard redirect to order confirmation (prevents showing empty cart message)
      window.location.href = `/account/orders/${result.orderId}`;
    } catch (error: any) {
      toast.error(error.message || "Failed to place order. Please try again.");
      setIsPlacingOrder(false);
    }
  };

  // Redirect if cart is empty (but not if order was just placed)
  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-evol-light-grey">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-evol-dark-grey mb-4">
            Your cart is empty
          </h1>
          <Button variant="primary" onClick={() => router.push("/shop")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-evol-light-grey py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Left Column: Checkout Form */}
          <div className="bg-white border-2 border-evol-grey p-6 md:p-10">
            <h1 className="font-serif text-3xl text-evol-dark-grey mb-8">
              Checkout
            </h1>

            {/* Step 1: Contact Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-evol-red text-white flex items-center justify-center font-sans text-sm font-bold">
                    1
                  </div>
                  <h2 className="font-sans text-lg font-semibold text-evol-dark-grey">
                    Contact Information
                  </h2>
                </div>

                <div className="space-y-4 pl-11">
                  <div>
                    <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                      Full Name <span className="text-evol-red">*</span>
                    </label>
                    <Input
                      value={contactInfo.fullName}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo,
                          fullName: e.target.value,
                        })
                      }
                      placeholder="Enter your Full Name"
                      error={contactErrors.fullName}
                    />
                    {contactErrors.fullName && (
                      <p className="font-body text-xs text-evol-red mt-1">
                        {contactErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                      Email Address <span className="text-evol-red">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            email: e.target.value,
                          })
                        }
                        placeholder="Enter your Email"
                        readOnly={!!session?.user?.email}
                        error={contactErrors.email}
                      />
                      {session?.user?.email && (
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-evol-grey" />
                      )}
                    </div>
                    {contactErrors.email && (
                      <p className="font-body text-xs text-evol-red mt-1">
                        {contactErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                      Phone Number <span className="text-evol-red">*</span>
                    </label>
                    <Input
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo,
                          phone: e.target.value,
                        })
                      }
                      placeholder="10-digit number"
                      maxLength={10}
                      error={contactErrors.phone}
                    />
                    {contactErrors.phone && (
                      <p className="font-body text-xs text-evol-red mt-1">
                        {contactErrors.phone}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleStep1Continue}
                    className="w-full"
                  >
                    Continue to Delivery
                  </Button>
                </div>
              </div>
            )}

            {/* Step 1 Summary (when completed) */}
            {currentStep > 1 && (
              <div className="mb-6 p-4 bg-evol-off-white border border-evol-grey">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-evol-dark-grey text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-sans text-sm font-semibold text-evol-dark-grey">
                        Contact Information
                      </h3>
                      <p className="font-body text-sm text-evol-metallic">
                        {contactInfo.fullName} • {contactInfo.email} •{" "}
                        {contactInfo.phone}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="p-2 hover:bg-white rounded transition-colors"
                    aria-label="Edit contact info"
                  >
                    <Edit2 className="w-4 h-4 text-evol-metallic" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Delivery Address */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-evol-red text-white flex items-center justify-center font-sans text-sm font-bold">
                    2
                  </div>
                  <h2 className="font-sans text-lg font-semibold text-evol-dark-grey">
                    Delivery Address
                  </h2>
                </div>

                <div className="space-y-4 pl-11">
                  <div>
                    <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                      Address Line 1 <span className="text-evol-red">*</span>
                    </label>
                    <Input
                      value={deliveryAddress.line1}
                      onChange={(e) =>
                        setDeliveryAddress({
                          ...deliveryAddress,
                          line1: e.target.value,
                        })
                      }
                      placeholder="Street address, house number"
                      error={addressErrors.line1}
                    />
                  </div>

                  <div>
                    <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                      Address Line 2
                    </label>
                    <Input
                      value={deliveryAddress.line2}
                      onChange={(e) =>
                        setDeliveryAddress({
                          ...deliveryAddress,
                          line2: e.target.value,
                        })
                      }
                      placeholder="Apartment, suite, floor (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                        City <span className="text-evol-red">*</span>
                      </label>
                      <Input
                        value={deliveryAddress.city}
                        onChange={(e) =>
                          setDeliveryAddress({
                            ...deliveryAddress,
                            city: e.target.value,
                          })
                        }
                        placeholder="City"
                        error={addressErrors.city}
                      />
                    </div>

                    <div>
                      <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                        PIN Code <span className="text-evol-red">*</span>
                      </label>
                      <Input
                        value={deliveryAddress.pinCode}
                        onChange={(e) =>
                          setDeliveryAddress({
                            ...deliveryAddress,
                            pinCode: e.target.value,
                          })
                        }
                        placeholder="6 digits"
                        maxLength={6}
                        error={addressErrors.pinCode}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                      State <span className="text-evol-red">*</span>
                    </label>
                    <select
                      value={deliveryAddress.state}
                      onChange={(e) =>
                        setDeliveryAddress({
                          ...deliveryAddress,
                          state: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-evol-grey font-body text-sm text-evol-dark-grey focus:outline-none focus:border-evol-dark-grey"
                    >
                      <option value="">Select state</option>
                      {indianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                      Country
                    </label>
                    <Input
                      value="India"
                      readOnly
                      className="bg-evol-light-grey"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="useSameAddress"
                      checked={useSameAddress}
                      onChange={(e) => setUseSameAddress(e.target.checked)}
                      className="w-4 h-4 text-evol-red border-evol-grey rounded focus:ring-evol-red"
                    />
                    <label
                      htmlFor="useSameAddress"
                      className="font-body text-sm text-evol-dark-grey"
                    >
                      Use this address for billing
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="saveAddress"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="w-4 h-4 text-evol-red border-evol-grey rounded focus:ring-evol-red"
                    />
                    <label
                      htmlFor="saveAddress"
                      className="font-body text-sm text-evol-dark-grey"
                    >
                      Save this address to my profile
                    </label>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleStep2Continue}
                    className="w-full"
                  >
                    Continue to Review
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2 Summary (when completed) */}
            {currentStep > 2 && (
              <div className="mb-6 p-4 bg-evol-off-white border border-evol-grey">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-evol-dark-grey text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-sans text-sm font-semibold text-evol-dark-grey">
                        Delivery Address
                      </h3>
                      <p className="font-body text-sm text-evol-metallic">
                        {deliveryAddress.line1}, {deliveryAddress.city},{" "}
                        {deliveryAddress.state} {deliveryAddress.pinCode}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="p-2 hover:bg-white rounded transition-colors"
                    aria-label="Edit delivery address"
                  >
                    <Edit2 className="w-4 h-4 text-evol-metallic" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Place Order */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-evol-red text-white flex items-center justify-center font-sans text-sm font-bold">
                    3
                  </div>
                  <h2 className="font-sans text-lg font-semibold text-evol-dark-grey">
                    Review & Place Order
                  </h2>
                </div>

                <div className="space-y-4 pl-11">
                  <div>
                    <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Any special instructions for your order?"
                      rows={4}
                      className="w-full px-4 py-3 border border-evol-grey font-body text-sm text-evol-dark-grey placeholder:text-evol-grey focus:outline-none focus:border-evol-dark-grey resize-none"
                    />
                  </div>

                  <Button
                    variant="primary"
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="w-full font-sans text-sm uppercase tracking-[0.1em]"
                  >
                    {isPlacingOrder ? "Placing Your Order..." : "Place Order"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div>
            <OrderSummaryPanel sticky />
          </div>
        </div>
      </div>
    </div>
  );
}
