"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, LogOut, ShoppingBag, MapPin, Gem, Clock, CheckCircle, MessageSquare, FileText, XCircle, Eye } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useSession } from "@/hooks/useSession";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";

export default function AccountPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showManageAddresses, setShowManageAddresses] = useState(false);

  // Profile editing state
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileErrors, setProfileErrors] = useState<{ name?: string; phone?: string }>({});
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Address editing state
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressPinCode, setAddressPinCode] = useState("");
  const [addressCountry, setAddressCountry] = useState("India");
  const [addressErrors, setAddressErrors] = useState<{
    line1?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    country?: string;
  }>({});
  const [addressSuccess, setAddressSuccess] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Fetch user's orders
  const { data: orders, isLoading: ordersLoading } = trpc.orders.list.useQuery(undefined, {
    enabled: !!session,
  });

  // Fetch user's customization inquiries
  const { data: customInquiries, isLoading: customInquiriesLoading } = trpc.customise.myInquiries.useQuery(undefined, {
    enabled: !!session,
  });

  // Fetch user profile for saved address
  const { data: userProfile } = trpc.users.getProfile.useQuery(undefined, {
    enabled: !!session,
  });

  // Profile update mutation
  const updateProfileMutation = trpc.users.updateProfile.useMutation();

  // Address update mutation
  const updateAddressMutation = trpc.users.updateAddress.useMutation();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  // Initialize profile form when data loads
  useEffect(() => {
    if (session?.user?.name) {
      setProfileName(session.user.name);
    }
    if (userProfile?.phone) {
      // Remove +91 prefix for display
      const phoneDigits = userProfile.phone.replace(/^\+91/, "");
      setProfilePhone(phoneDigits);
    }
  }, [session?.user?.name, userProfile?.phone]);

  // Initialize address form when data loads
  useEffect(() => {
    if (userProfile?.savedAddress) {
      setAddressLine1(userProfile.savedAddress.line1 || "");
      setAddressLine2(userProfile.savedAddress.line2 || "");
      setAddressCity(userProfile.savedAddress.city || "");
      setAddressState(userProfile.savedAddress.state || "");
      setAddressPinCode(userProfile.savedAddress.pinCode || "");
      setAddressCountry(userProfile.savedAddress.country || "India");
    }
  }, [userProfile?.savedAddress]);

  const handleSaveProfile = async () => {
    setProfileErrors({});
    setProfileSuccess(false);

    // Validate
    const errors: { name?: string; phone?: string } = {};

    if (!profileName.trim()) {
      errors.name = "Name is required";
    }

    if (profilePhone && !/^\d{10}$/.test(profilePhone)) {
      errors.phone = "Phone must be 10 digits";
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        name: profileName.trim(),
        phone: profilePhone ? `+91${profilePhone}` : undefined,
      });

      setProfileSuccess(true);

      // Refresh session and profile data
      window.location.reload();
    } catch (error: any) {
      setProfileErrors({ name: error.message || "Failed to update profile" });
    }
  };

  const handleCancelProfileEdit = () => {
    setShowEditProfile(false);
    setProfileErrors({});
    setProfileSuccess(false);

    // Reset to original values
    if (session?.user?.name) {
      setProfileName(session.user.name);
    }
    if (userProfile?.phone) {
      const phoneDigits = userProfile.phone.replace(/^\+91/, "");
      setProfilePhone(phoneDigits);
    } else {
      setProfilePhone("");
    }
  };

  const handleSaveAddress = async () => {
    setAddressErrors({});
    setAddressSuccess(false);

    // Validate
    const errors: {
      line1?: string;
      city?: string;
      state?: string;
      pinCode?: string;
      country?: string;
    } = {};

    if (!addressLine1.trim()) {
      errors.line1 = "Address line 1 is required";
    }
    if (!addressCity.trim()) {
      errors.city = "City is required";
    }
    if (!addressState.trim()) {
      errors.state = "State is required";
    }
    if (!addressPinCode.trim()) {
      errors.pinCode = "PIN code is required";
    }
    if (!addressCountry.trim()) {
      errors.country = "Country is required";
    }

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }

    try {
      await updateAddressMutation.mutateAsync({
        line1: addressLine1.trim(),
        line2: addressLine2.trim(),
        city: addressCity.trim(),
        state: addressState.trim(),
        pinCode: addressPinCode.trim(),
        country: addressCountry.trim(),
      });

      setAddressSuccess(true);
      setIsEditingAddress(false);

      // Refresh profile data
      window.location.reload();
    } catch (error: any) {
      setAddressErrors({ line1: error.message || "Failed to update address" });
    }
  };

  const handleCancelAddressEdit = () => {
    setIsEditingAddress(false);
    setAddressErrors({});
    setAddressSuccess(false);

    // Reset to original values
    if (userProfile?.savedAddress) {
      setAddressLine1(userProfile.savedAddress.line1 || "");
      setAddressLine2(userProfile.savedAddress.line2 || "");
      setAddressCity(userProfile.savedAddress.city || "");
      setAddressState(userProfile.savedAddress.state || "");
      setAddressPinCode(userProfile.savedAddress.pinCode || "");
      setAddressCountry(userProfile.savedAddress.country || "India");
    } else {
      setAddressLine1("");
      setAddressLine2("");
      setAddressCity("");
      setAddressState("");
      setAddressPinCode("");
      setAddressCountry("India");
    }
  };

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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
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
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowEditProfile(!showEditProfile)}
              >
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
                onClick={() => {
                  if (orders && orders.length > 0) {
                    router.push("/account/orders");
                  } else {
                    router.push("/shop");
                  }
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
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowManageAddresses(!showManageAddresses)}
              >
                Manage Addresses
              </Button>
            </div>

            {/* Bespoke Inquiries Card */}
            <div className="bg-evol-light-grey p-6 border border-evol-grey">
              <div className="flex items-center gap-3 mb-4">
                <Gem className="h-6 w-6 text-evol-red" />
                <h3 className="font-sans text-sm font-medium text-evol-dark-grey uppercase tracking-widest">
                  Bespoke
                </h3>
              </div>
              <p className="font-body text-sm text-evol-metallic mb-4">
                {customInquiriesLoading ? (
                  "Loading..."
                ) : customInquiries && customInquiries.length > 0 ? (
                  `You have ${customInquiries.length} customisation request${customInquiries.length === 1 ? "" : "s"}`
                ) : (
                  "No bespoke requests yet"
                )}
              </p>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  if (customInquiries && customInquiries.length > 0) {
                    document.getElementById("bespoke-inquiries")?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    router.push("/customise");
                  }
                }}
              >
                {customInquiries && customInquiries.length > 0 ? "View Requests" : "Start a Request"}
              </Button>
            </div>
          </div>

          {/* Edit Profile Section */}
          {showEditProfile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 bg-evol-off-white p-6 border border-evol-grey"
            >
              <h2 className="font-serif text-2xl text-evol-dark-grey mb-6">Edit Profile</h2>

              {profileSuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 p-4">
                  <p className="font-sans text-sm text-green-800">
                    Profile updated successfully!
                  </p>
                </div>
              )}

              <div className="space-y-6 max-w-md">
                <div>
                  <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                    Name *
                  </label>
                  <Input
                    type="text"
                    value={profileName}
                    onChange={(e) => {
                      setProfileName(e.target.value);
                      setProfileErrors((prev) => ({ ...prev, name: undefined }));
                      setProfileSuccess(false);
                    }}
                    placeholder="Your full name"
                    error={profileErrors.name}
                  />
                  {profileErrors.name && (
                    <p className="font-body text-xs text-evol-red mt-1">
                      {profileErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                    Email
                  </label>
                  <p className="font-body text-sm text-evol-metallic py-2">
                    {session.user?.email}
                  </p>
                  <p className="font-body text-xs text-evol-metallic italic mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                    Phone (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-body text-sm text-evol-dark-grey">+91</span>
                    <Input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setProfilePhone(value);
                        setProfileErrors((prev) => ({ ...prev, phone: undefined }));
                        setProfileSuccess(false);
                      }}
                      placeholder="9876543210"
                      error={profileErrors.phone}
                      maxLength={10}
                    />
                  </div>
                  {profileErrors.phone && (
                    <p className="font-body text-xs text-evol-red mt-1">
                      {profileErrors.phone}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="primary"
                    onClick={handleSaveProfile}
                    loading={updateProfileMutation.isPending}
                    disabled={updateProfileMutation.isPending}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCancelProfileEdit}
                    disabled={updateProfileMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Manage Addresses Section */}
          {showManageAddresses && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 bg-evol-off-white p-6 border border-evol-grey"
            >
              <h2 className="font-serif text-2xl text-evol-dark-grey mb-6">
                Manage Addresses
              </h2>

              {addressSuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 p-4">
                  <p className="font-sans text-sm text-green-800">
                    Address updated successfully!
                  </p>
                </div>
              )}

              {!isEditingAddress && userProfile?.savedAddress ? (
                <div className="space-y-4 max-w-md">
                  <div>
                    <h3 className="font-sans text-sm font-medium text-evol-dark-grey mb-2">
                      Saved Address
                    </h3>
                    <div className="bg-white p-4 border border-evol-grey">
                      <p className="font-body text-sm text-evol-dark-grey">
                        {userProfile.savedAddress.line1}
                      </p>
                      {userProfile.savedAddress.line2 && (
                        <p className="font-body text-sm text-evol-dark-grey">
                          {userProfile.savedAddress.line2}
                        </p>
                      )}
                      <p className="font-body text-sm text-evol-dark-grey">
                        {userProfile.savedAddress.city}, {userProfile.savedAddress.state}{" "}
                        {userProfile.savedAddress.pinCode}
                      </p>
                      <p className="font-body text-sm text-evol-dark-grey">
                        {userProfile.savedAddress.country}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditingAddress(true)}
                  >
                    Edit Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 max-w-md">
                  <div>
                    <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                      Address Line 1 *
                    </label>
                    <Input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => {
                        setAddressLine1(e.target.value);
                        setAddressErrors((prev) => ({ ...prev, line1: undefined }));
                        setAddressSuccess(false);
                      }}
                      placeholder="Street address, P.O. box"
                      error={addressErrors.line1}
                    />
                    {addressErrors.line1 && (
                      <p className="font-body text-xs text-evol-red mt-1">
                        {addressErrors.line1}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                      Address Line 2 (Optional)
                    </label>
                    <Input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => {
                        setAddressLine2(e.target.value);
                        setAddressSuccess(false);
                      }}
                      placeholder="Apartment, suite, unit, building, floor, etc."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                        City *
                      </label>
                      <Input
                        type="text"
                        value={addressCity}
                        onChange={(e) => {
                          setAddressCity(e.target.value);
                          setAddressErrors((prev) => ({ ...prev, city: undefined }));
                          setAddressSuccess(false);
                        }}
                        placeholder="City"
                        error={addressErrors.city}
                      />
                      {addressErrors.city && (
                        <p className="font-body text-xs text-evol-red mt-1">
                          {addressErrors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                        State *
                      </label>
                      <Input
                        type="text"
                        value={addressState}
                        onChange={(e) => {
                          setAddressState(e.target.value);
                          setAddressErrors((prev) => ({ ...prev, state: undefined }));
                          setAddressSuccess(false);
                        }}
                        placeholder="State"
                        error={addressErrors.state}
                      />
                      {addressErrors.state && (
                        <p className="font-body text-xs text-evol-red mt-1">
                          {addressErrors.state}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                        PIN Code *
                      </label>
                      <Input
                        type="text"
                        value={addressPinCode}
                        onChange={(e) => {
                          setAddressPinCode(e.target.value);
                          setAddressErrors((prev) => ({ ...prev, pinCode: undefined }));
                          setAddressSuccess(false);
                        }}
                        placeholder="PIN Code"
                        error={addressErrors.pinCode}
                      />
                      {addressErrors.pinCode && (
                        <p className="font-body text-xs text-evol-red mt-1">
                          {addressErrors.pinCode}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="font-sans text-sm text-evol-dark-grey mb-2 block">
                        Country *
                      </label>
                      <Input
                        type="text"
                        value={addressCountry}
                        onChange={(e) => {
                          setAddressCountry(e.target.value);
                          setAddressErrors((prev) => ({ ...prev, country: undefined }));
                          setAddressSuccess(false);
                        }}
                        placeholder="Country"
                        error={addressErrors.country}
                      />
                      {addressErrors.country && (
                        <p className="font-body text-xs text-evol-red mt-1">
                          {addressErrors.country}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="primary"
                      onClick={handleSaveAddress}
                      loading={updateAddressMutation.isPending}
                      disabled={updateAddressMutation.isPending}
                    >
                      Save Address
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleCancelAddressEdit}
                      disabled={updateAddressMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>

                  {!userProfile?.savedAddress && (
                    <p className="font-body text-xs text-evol-metallic italic">
                      This address will be saved to your profile for future orders.
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}

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

          {/* Bespoke Inquiries List */}
          {customInquiries && customInquiries.length > 0 && (
            <div id="bespoke-inquiries" className="mt-12">
              <h2 className="font-serif text-2xl text-evol-dark-grey mb-6">
                Your Bespoke Requests
              </h2>
              <div className="space-y-4">
                {customInquiries.map((inquiry) => {
                  const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
                    new: { label: "Submitted", color: "bg-blue-100 text-blue-800", icon: Clock },
                    reviewed: { label: "Under Review", color: "bg-yellow-100 text-yellow-800", icon: Eye },
                    in_discussion: { label: "In Discussion", color: "bg-purple-100 text-purple-800", icon: MessageSquare },
                    quoted: { label: "Quote Sent", color: "bg-indigo-100 text-indigo-800", icon: FileText },
                    completed: { label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle },
                    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
                  };
                  const status = statusConfig[inquiry.status] || statusConfig.new;
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={inquiry.id}
                      className="bg-evol-light-grey p-6 border border-evol-grey"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Gem className="h-5 w-5 text-evol-red shrink-0" />
                            <p className="font-sans text-sm font-medium text-evol-dark-grey">
                              Request #{inquiry.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                          <p className="font-body text-sm text-evol-metallic line-clamp-2 mb-2">
                            {inquiry.requirement}
                          </p>
                          <p className="font-body text-xs text-evol-metallic">
                            Submitted on{" "}
                            {new Date(inquiry.createdAt).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 text-center">
                <Link
                  href="/customise"
                  className="inline-block font-sans text-sm text-evol-red hover:text-evol-dark-grey transition-colors"
                >
                  Start a New Bespoke Request →
                </Link>
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
