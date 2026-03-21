"use client";

import { createContext, useContext, useRef, useState, useCallback, ReactNode } from "react";

type MenuType = "shop" | "solitaire" | "diamonds" | null;

interface NavbarContextType {
  activeMenu: MenuType;
  setActiveMenu: (menu: MenuType) => void;
  scheduleClose: () => void;
  cancelClose: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const NavbarContext = createContext<NavbarContextType | null>(null);

export function NavbarProvider({ children }: { children: ReactNode }) {
  const [activeMenu, setActiveMenuState] = useState<MenuType>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const setActiveMenu = useCallback((menu: MenuType) => {
    cancelClose();
    setActiveMenuState(menu);
  }, [cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenuState(null);
    }, 100);
  }, [cancelClose]);

  return (
    <NavbarContext.Provider
      value={{
        activeMenu,
        setActiveMenu,
        scheduleClose,
        cancelClose,
        mobileMenuOpen,
        setMobileMenuOpen,
        searchOpen,
        setSearchOpen,
      }}
    >
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbar() {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error("useNavbar must be used within NavbarProvider");
  }
  return context;
}
