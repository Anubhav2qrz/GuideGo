"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  MapPin,
  User,
  LogIn,
  LogOut,
  LayoutDashboard,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { navItems } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "glass-strong shadow-sm"
            : "bg-transparent"
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white transition-transform group-hover:scale-105">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Guide<span className="text-brand-blue">Go</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
                {pathname === item.href && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
            <Link href="/ai-planner">
              <span className="relative inline-flex overflow-hidden rounded-full p-[1px] ml-2">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950/90 hover:bg-slate-900/90 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-3xl transition-colors">
                  <Bot className="mr-2 h-4 w-4 text-brand-emerald" />
                  AI Planner
                </span>
              </span>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <div className="hidden items-center gap-2 sm:flex">
              {user ? (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-1.5 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={handleLogout}>
                    <LogOut className="mr-1.5 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">
                      <LogIn className="mr-1.5 h-4 w-4" />
                      Login
                    </Link>
                  </Button>
                  <Button size="sm" className="bg-brand-blue hover:bg-brand-blue-dark text-white" asChild>
                    <Link href="/signup">
                      <User className="mr-1.5 h-4 w-4" />
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent lg:hidden"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[300px] bg-background shadow-2xl lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b px-4">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue text-white">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-lg font-bold">
                    Guide<span className="text-brand-blue">Go</span>
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col gap-1 p-4">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.05 }}
                  className="mt-2"
                >
                  <Link
                    href="/ai-planner"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center rounded-xl bg-gradient-to-r from-brand-blue/10 to-brand-emerald/10 border border-brand-blue/20 px-3 py-3 text-sm font-bold text-foreground transition-colors hover:bg-gradient-to-r hover:from-brand-blue/20 hover:to-brand-emerald/20"
                  >
                    <Bot className="mr-3 h-5 w-5 text-brand-blue" />
                    AI Trip Planner
                    <span className="ml-auto rounded bg-brand-emerald/20 px-2 py-0.5 text-[10px] uppercase text-brand-emerald">New</span>
                  </Link>
                </motion.div>
              </div>

              <div className="mt-auto border-t p-4">
                <div className="flex flex-col gap-2">
                  {user ? (
                    <>
                      <Button variant="outline" className="w-full justify-center" asChild>
                        <Link href="/dashboard" onClick={() => setIsMobileOpen(false)}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </Button>
                      <Button variant="destructive" className="w-full justify-center" onClick={() => { handleLogout(); setIsMobileOpen(false); }}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full justify-center" asChild>
                        <Link href="/login" onClick={() => setIsMobileOpen(false)}>
                          <LogIn className="mr-2 h-4 w-4" />
                          Login
                        </Link>
                      </Button>
                      <Button className="w-full justify-center bg-brand-blue hover:bg-brand-blue-dark text-white" asChild>
                        <Link href="/signup" onClick={() => setIsMobileOpen(false)}>
                          <User className="mr-2 h-4 w-4" />
                          Sign Up
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
