import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function PageNotFound() {
  const location = useLocation();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6" style={{ backgroundColor: "var(--epsy-off-white)" }}>
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-7xl font-light text-slate-300">404</h1>
          <div className="h-0.5 w-16 bg-slate-200 mx-auto"></div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-medium" style={{ color: "var(--epsy-charcoal)" }}>
            Page Not Found
          </h2>
          <p className="leading-relaxed" style={{ color: "var(--epsy-slate-blue)" }}>
            The page <span className="font-mono">{location.pathname}</span> does not exist.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium"
            style={{ backgroundColor: "var(--epsy-sky-blue)", color: "var(--epsy-charcoal)" }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
