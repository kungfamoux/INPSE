import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useBranding } from "../hooks/useBranding";
import { useNavMenus } from "../hooks/useNavMenus";

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { branding } = useBranding();
  const { headerItems } = useNavMenus();

  const navPages = ["Home", "About", "Gallery", "News", "Contact", "Results", "Tour"];

  return (
    <header className="fixed top-0 w-full bg-white border-b border-gray-100 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to={createPageUrl("Home")} className="flex-shrink-0">
            {branding?.primaryLogoUrl ? (
              <img
                src={branding.primaryLogoUrl}
                alt="International Nursery and Primary School Enugu (INPSE)"
                className="h-12 lg:h-14 w-auto"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500" />
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {headerItems.length > 0 ? (
              headerItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.link || createPageUrl(item.page || "Home")}
                  className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                >
                  {item.label}
                </Link>
              ))
            ) : (
              navPages.map((page) => (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                >
                  {page}
                </Link>
              ))
            )}
          </nav>

          {/* Portal Login & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("PortalLogin")}>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-orange-500 text-orange-600 hover:bg-orange-50 text-sm"
              >
                Portal Login
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-700 hover:text-orange-600"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-gray-100 py-4 space-y-3">
            {headerItems.length > 0 ? (
              headerItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.link || createPageUrl(item.page || "Home")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors py-2"
                >
                  {item.label}
                </Link>
              ))
            ) : (
              navPages.map((page) => (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors py-2"
                >
                  {page}
                </Link>
              ))
            )}
          </nav>
        )}
      </div>
    </header>
  );
}