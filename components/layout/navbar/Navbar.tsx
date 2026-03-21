"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserRound,
  Heart,
  ShoppingBag,
  Menu,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavbarProvider, useNavbar } from "./NavbarContext";
import ShopMegaMenu from "./ShopMegaMenu";
import SolitaireMegaMenu from "./SolitaireMegaMenu";
import DiamondsMegaMenu from "./DiamondsMegaMenu";
import SearchOverlay from "./SearchOverlay";
import MobileMenu from "./MobileMenu";
import { useSession } from "@/hooks/useSession";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useCartStore } from "@/lib/stores/cart";
import { useWishlistStore } from "@/lib/stores/wishlist";
import { useFlyToCart } from "@/components/animations/FlyToCartProvider";

type NavItem = {
  label: string;
  href: string;
  dropdown?: "shop" | "solitaire" | "diamonds";
};

const navItems: NavItem[] = [
  { label: "Shop", href: "/shop", dropdown: "shop" },
  { label: "Solitaire", href: "/shop?filter=solitaire", dropdown: "solitaire" },
  { label: "Ready To Ship", href: "/shop?filter=ready-to-ship" },
  { label: "Customise", href: "/customise" },
  { label: "Gift", href: "/gift" },
  { label: "Try At Home", href: "/try-at-home" },
  { label: "Gold Beans", href: "/gold-beans" },
  { label: "Know Your Diamonds", href: "/journal", dropdown: "diamonds" },
  { label: "Our Story", href: "/our-story" },
];

function NavbarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { isAdmin } = useIsAdmin();
  const {
    activeMenu,
    setActiveMenu,
    scheduleClose,
    setMobileMenuOpen,
    setSearchOpen,
  } = useNavbar();

  const { itemCount, openDrawer } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { cartBounce } = useFlyToCart();

  const cartItemCount = itemCount();
  const wishlistCount = wishlistItems.length;

  const accountLink = session ? (isAdmin ? "/admin" : "/account") : "/sign-in";

  const isActive = (href: string) => {
    // Parse the href to extract path and query params
    const [hrefPath, hrefQuery] = href.split("?");
    const currentFilter = searchParams.get("filter");

    // For links with query params (like Solitaire and Ready To Ship)
    if (hrefQuery) {
      const hrefParams = new URLSearchParams(hrefQuery);
      const hrefFilter = hrefParams.get("filter");

      // Check if both path and filter match
      if (pathname === hrefPath && currentFilter === hrefFilter) {
        return true;
      }
      return false;
    }

    // For plain /shop link - only active when on /shop without a filter query param
    if (href === "/shop") {
      return pathname === "/shop" && !currentFilter;
    }

    // For other links without query params
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Zone 2 - Logo Bar */}
      <div className="bg-white border-b border-evol-grey">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex items-center justify-between h-[60px] md:h-[72px]">
            {/* Left - Search (desktop) / Hamburger (mobile) */}
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 hover:text-evol-red transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:block p-2 hover:text-evol-red transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Center - Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="relative h-10 md:h-12 w-[80px] md:w-[100px]">
                <Image
                  src="/logos/Evol Jewels Logo - Black.png"
                  alt="Evol Jewels"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Right - Icons */}
            <div className="flex items-center gap-3 md:gap-5">
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden p-2 hover:text-evol-red transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link
                href={accountLink}
                className="p-2 hover:text-evol-red transition-colors"
                aria-label="Account"
              >
                <UserRound className="w-5 h-5" />
              </Link>
              <Link
                href="/wishlist"
                className="relative p-2 hover:text-evol-red transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-evol-red text-white text-[10px] flex items-center justify-center font-sans">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <motion.button
                id="cart-icon"
                data-cart-icon
                onClick={openDrawer}
                className="relative p-2 hover:text-evol-red transition-colors"
                aria-label="Cart"
                animate={{
                  scale: cartBounce ? [1, 1.18, 1] : 1,
                }}
                transition={{
                  duration: 0.6,
                  times: [0, 0.4, 1],
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-evol-red text-white text-[10px] flex items-center justify-center font-sans"
                    animate={{
                      scale: cartBounce ? [1, 1.3, 1] : 1,
                    }}
                    transition={{
                      duration: 0.4,
                      times: [0, 0.5, 1],
                    }}
                  >
                    {cartItemCount}
                  </motion.span>
                )}

                {/* Gold Ripple Ring Animation */}
                {cartBounce && (
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      border: "2px solid #DAA520",
                    }}
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Zone 3 - Navigation Menu Bar (Desktop only) */}
      <div className="hidden md:block bg-white relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex items-center justify-center h-[44px]">
            <nav className="flex items-center gap-6 lg:gap-8">
              {navItems.map((item) => (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() =>
                    item.dropdown && setActiveMenu(item.dropdown)
                  }
                  onMouseLeave={() => item.dropdown && scheduleClose()}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "font-sans text-[13px] tracking-[0.04em] transition-colors flex items-center gap-1",
                      isActive(item.href)
                        ? "text-evol-dark-grey"
                        : "text-evol-dark-grey/70 hover:text-evol-dark-grey",
                    )}
                  >
                    {item.label}
                    {item.dropdown && (
                      <motion.span
                        animate={{
                          rotateX: activeMenu === item.dropdown ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </motion.span>
                    )}
                  </Link>
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-[13px] left-0 right-0 h-0.5 bg-evol-red"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Mega Menus */}
        <AnimatePresence mode="wait">
          {activeMenu === "shop" && <ShopMegaMenu />}
          {activeMenu === "solitaire" && <SolitaireMegaMenu />}
          {activeMenu === "diamonds" && <DiamondsMegaMenu />}
        </AnimatePresence>
      </div>

      {/* Search Overlay */}
      <SearchOverlay />

      {/* Mobile Menu */}
      <MobileMenu />
    </>
  );
}

export default function Navbar() {
  return (
    <NavbarProvider>
      <header className="sticky top-0 z-50">
        <NavbarContent />
      </header>
    </NavbarProvider>
  );
}
