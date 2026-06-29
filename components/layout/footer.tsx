"use client";

import Link from "next/link";
import { MapPin, Mail, MapPinned, Camera, MessageCircle, Globe, Video, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Become a Guide", href: "/become-guide" },
  ],
  support: [
    { label: "Help Center", href: "#" },
    { label: "Safety", href: "#" },
    { label: "Cancellation Policy", href: "#" },
    { label: "Contact Us", href: "/contact" },
    { label: "Accessibility", href: "#" },
  ],
  legal: [
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Refund Policy", href: "#" },
  ],
  explore: [
    { label: "Kolkata", href: "/explore" },
    { label: "Delhi", href: "/explore" },
    { label: "Mumbai", href: "/explore" },
    { label: "Jaipur", href: "/explore" },
    { label: "Goa", href: "/explore" },
    { label: "Varanasi", href: "/explore" },
  ],
};

const socialLinks = [
  { icon: Camera, href: "#", label: "Instagram" },
  { icon: MessageCircle, href: "#", label: "Twitter" },
  { icon: Globe, href: "#", label: "Facebook" },
  { icon: Video, href: "#", label: "YouTube" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="relative border-t border-border/50 bg-muted/30">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Newsletter */}
        <div className="flex flex-col items-center justify-between gap-6 border-b border-border/50 py-12 md:flex-row">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold tracking-tight">Stay in the loop</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get the latest travel tips, guide spotlights, and exclusive offers.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex h-11 items-center gap-2 rounded-xl bg-brand-blue px-5 text-sm font-medium text-white transition-colors hover:bg-brand-blue-dark"
            >
              {subscribed ? "Subscribed!" : "Subscribe"}
              <Send className="h-3.5 w-3.5" />
            </motion.button>
          </form>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Guide<span className="text-brand-blue">Go</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Connecting travelers with verified local guides for authentic,
              personalized city experiences across India.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-muted-foreground transition-colors hover:bg-brand-blue hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Support</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Explore Cities</h4>
            <ul className="space-y-2.5">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/50 py-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-1.5">
            <MapPinned className="h-3.5 w-3.5 text-brand-blue" />
            <span>Built with ❤️ in India</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span>© {new Date().getFullYear()} GuideGo. All rights reserved.</span>
            <div className="flex gap-4">
              {footerLinks.legal.map((link) => (
                <Link key={link.label} href={link.href} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
