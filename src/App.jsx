import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import EpsyApp from "./pages/EpsyApp.jsx";
import Gallery from "./pages/Gallery.jsx";
import Partnerships from "./pages/Partnerships.jsx";
import PageNotFound from "./lib/PageNotFound.jsx";

function Header() {
  const linkBase =
    "text-sm font-medium px-3 py-2 rounded-xl transition-colors";
  const active =
    "bg-white/70 shadow-sm";
  const inactive =
    "hover:bg-white/50";

  const items = [
    { to: "/", label: "Home", end: true },
    { to: "/about", label: "About" },
    { to: "/epsyapp", label: "EpsyApp" },
    { to: "/gallery", label: "Gallery" },
    { to: "/partnerships", label: "Partnerships" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur" style={{ backgroundColor: "rgba(250,251,249,0.85)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--epsy-sky-blue)" }}>
            <span className="font-bold" style={{ color: "var(--epsy-charcoal)" }}>E</span>
          </div>
          <span className="font-semibold tracking-tight" style={{ color: "var(--epsy-charcoal)" }}>Epsy</span>
        </NavLink>

        <nav className="hidden lg:flex items-center gap-1">
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
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: "rgba(15,30,36,0.08)", backgroundColor: "rgba(250,251,249,0.85)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="text-sm" style={{ color: "var(--epsy-slate-blue)" }}>
          © {new Date().getFullYear()} Epsy. All rights reserved.
        </div>
        <div className="text-sm flex gap-4">
          <NavLink to="/privacy" className="hover:underline" style={{ color: "var(--epsy-slate-blue)" }}>Privacy</NavLink>
        </div>
      </div>
    </footer>
  );
}

function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
      <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--epsy-charcoal)" }}>Privacy</h1>
      <p className="leading-relaxed" style={{ color: "var(--epsy-slate-blue)" }}>
        This website does not require you to log in. If you submit a form (e.g., Contact or Partnerships),
        your details are used only to respond to your request.
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
