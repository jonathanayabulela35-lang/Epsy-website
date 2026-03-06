import React, { useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import {
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  Music2,
  Menu,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import EpsyApp from "./pages/EpsyApp.jsx";
import Gallery from "./pages/Gallery.jsx";
import Partnerships from "./pages/Partnerships.jsx";
import PageNotFound from "./lib/PageNotFound.jsx";

import { getSiteContent } from "@/lib/siteContentApi";

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkBase =
    "text-sm font-medium px-3 py-2 rounded-xl transition-colors";
  const active = "bg-white/70 shadow-sm";
  const inactive = "hover:bg-white/50";

  const items = [
    { to: "/", label: "Home", end: true },
    { to: "/about", label: "About" },
    { to: "/epsyapp", label: "EpsyApp" },
    { to: "/gallery", label: "Gallery" },
    { to: "/partnerships", label: "Partnerships" },
    { to: "/contact", label: "Get In Touch" },
  ];

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md shadow-sm"
      style={{ backgroundColor: "rgba(250,251,249,0.82)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-[92px] flex items-center justify-between">
        {/* Brand */}
        <NavLink
          to="/"
          className="flex items-center gap-3 min-w-0"
          onClick={() => setMobileOpen(false)}
        >
          <img
            src="/assets/logo.jpg"
            alt="Everyday Psychology NPO logo"
            className="h-12 w-12 rounded-2xl object-contain bg-white/80 p-1"
          />
          <span
            className="font-semibold tracking-tight text-sm sm:text-base lg:text-lg leading-tight"
            style={{ color: "var(--epsy-charcoal)" }}
          >
            Everyday Psychology NPO
          </span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-2">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : inactive}`
              }
              style={{ color: "var(--epsy-charcoal)" }}
            >
              {it.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-2xl border"
          style={{
            borderColor: "rgba(15,30,36,0.12)",
            color: "var(--epsy-charcoal)",
            backgroundColor: "rgba(255,255,255,0.72)",
          }}
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <div
          className="lg:hidden border-t"
          style={{
            borderColor: "rgba(15,30,36,0.08)",
            backgroundColor: "rgba(250,251,249,0.96)",
          }}
        >
          <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-2">
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                    isActive ? "bg-white shadow-sm" : "hover:bg-white/70"
                  }`
                }
                style={{ color: "var(--epsy-charcoal)" }}
              >
                {it.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const { data: footerContent = {} } = useQuery({
    queryKey: ["siteContent", "footer"],
    queryFn: async () => await getSiteContent("footer"),
  });

  const socials = [
    {
      key: "youtube",
      label: "YouTube",
      href: footerContent.youtube_link ?? "https://youtube.com",
      icon: Youtube,
    },
    {
      key: "facebook",
      label: "Facebook",
      href: footerContent.facebook_link ?? "https://facebook.com",
      icon: Facebook,
    },
    {
      key: "instagram",
      label: "Instagram",
      href: footerContent.instagram_link ?? "https://instagram.com",
      icon: Instagram,
    },
    {
      key: "twitter",
      label: "Twitter",
      href: footerContent.twitter_link ?? "https://x.com",
      icon: Twitter,
    },
    {
      key: "tiktok",
      label: "TikTok",
      href: footerContent.tiktok_link ?? "https://tiktok.com",
      icon: Music2,
    },
  ];

  const contactEmail = footerContent.contact_email ?? "hello@epsy.org.za";
  const contactPhone = footerContent.contact_phone ?? "+27 00 000 0000";

  return (
    <footer
      style={{ backgroundColor: "var(--epsy-charcoal)" }}
      className="mt-0"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h3 className="text-xl font-bold mb-5" style={{ color: "white" }}>
            Site Map
          </h3>
          <div className="space-y-3 text-sm">
            <NavLink
              to="/"
              style={{ color: "rgba(255,255,255,0.88)" }}
              className="block hover:underline"
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              style={{ color: "rgba(255,255,255,0.88)" }}
              className="block hover:underline"
            >
              About
            </NavLink>
            <NavLink
              to="/epsyapp"
              style={{ color: "rgba(255,255,255,0.88)" }}
              className="block hover:underline"
            >
              EpsyApp
            </NavLink>
            <NavLink
              to="/gallery"
              style={{ color: "rgba(255,255,255,0.88)" }}
              className="block hover:underline"
            >
              Gallery
            </NavLink>
            <NavLink
              to="/partnerships"
              style={{ color: "rgba(255,255,255,0.88)" }}
              className="block hover:underline"
            >
              Partnerships
            </NavLink>
            <NavLink
              to="/contact"
              style={{ color: "rgba(255,255,255,0.88)" }}
              className="block hover:underline"
            >
              Contact
            </NavLink>
            <NavLink
              to="/privacy"
              style={{ color: "rgba(255,255,255,0.88)" }}
              className="block hover:underline"
            >
              Privacy
            </NavLink>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-5" style={{ color: "white" }}>
            Follow Us
          </h3>
          <div className="space-y-3 text-sm">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 hover:underline"
                  style={{ color: "rgba(255,255,255,0.88)" }}
                >
                  <span
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl"
                    style={{ backgroundColor: "rgba(12,192,223,0.18)" }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: "var(--epsy-sky-blue)" }}
                    />
                  </span>
                  <span>{social.label}</span>
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-5" style={{ color: "white" }}>
            Contact
          </h3>
          <div
            className="space-y-3 text-sm"
            style={{ color: "rgba(255,255,255,0.88)" }}
          >
            <div>Email: {contactEmail}</div>
            <div>Phone: {contactPhone}</div>
          </div>
        </div>
      </div>

      <div
        className="max-w-7xl mx-auto px-6 lg:px-12 py-5 border-t text-sm"
        style={{
          borderColor: "rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.68)",
        }}
      >
        © {new Date().getFullYear()} Everyday Psychology NPO. All rights reserved.
      </div>
    </footer>
  );
}

function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
      <h1
        className="text-3xl font-bold mb-4"
        style={{ color: "var(--epsy-charcoal)" }}
      >
        Privacy
      </h1>
      <p
        className="leading-relaxed"
        style={{ color: "var(--epsy-slate-blue)" }}
      >
        This website does not require you to log in. If you submit a form (e.g.,
        Contact or Partnerships), your details are used only to respond to your
        request.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/epsyapp" element={<EpsyApp />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/partnerships" element={<Partnerships />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}