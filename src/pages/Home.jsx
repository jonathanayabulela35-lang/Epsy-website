import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Users, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { siteSettings } from "@/lib/siteSettings";
import { supabase } from "@/lib/supabaseClient";
import { getSiteContent, updateSiteContent } from "@/lib/siteContentApi";

export default function Home() {
  const settings = siteSettings;
  const queryClient = useQueryClient();

  // Only show admin UI if URL contains ?admin=1
  const showAdmin = useMemo(() => {
    return new URLSearchParams(window.location.search).get("admin") === "1";
  }, []);

  const ADMIN_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || "ayabulelaplatana126@gmail.com";

  const [session, setSession] = useState(null);
  const [email, setEmail] = useState(ADMIN_EMAIL);

  // Local editor fields (admin only)
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [ctaPrimaryText, setCtaPrimaryText] = useState("");
  const [ctaSecondaryText, setCtaSecondaryText] = useState("");

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + "/?admin=1",
      },
    });

    if (error) toast.error(error.message);
    else toast.success("Magic link sent. Check your email.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out.");
  };

  // Load "home" content JSON from Supabase
  const { data: homeContent = {}, isLoading } = useQuery({
    queryKey: ["siteContent", "home"],
    queryFn: async () => {
      return await getSiteContent("home");
    },
  });

  // Defaults (if Supabase row missing fields)
  const viewHeroTitle =
    homeContent.hero_title ?? "Building resilience through everyday psychology.";
  const viewHeroSubtitle =
    homeContent.hero_subtitle ??
    "Epsy helps students and communities understand the mind, strengthen coping skills, and grow practical emotional resilience.";

  const viewPrimaryText = homeContent.hero_cta_primary_text ?? "Learn more";
  const viewSecondaryText = homeContent.hero_cta_secondary_text ?? "Contact us";

  // Keep editor fields in sync when content loads
  useEffect(() => {
    if (!homeContent) return;
    setHeroTitle(homeContent.hero_title ?? "");
    setHeroSubtitle(homeContent.hero_subtitle ?? "");
    setCtaPrimaryText(homeContent.hero_cta_primary_text ?? "Learn more");
    setCtaSecondaryText(homeContent.hero_cta_secondary_text ?? "Contact us");
  }, [homeContent]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const next = {
        ...homeContent,
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_cta_primary_text: ctaPrimaryText,
        hero_cta_secondary_text: ctaSecondaryText,
      };
      await updateSiteContent("home", next);
      return true;
    },
    onSuccess: () => {
      toast.success("Home updated.");
      queryClient.invalidateQueries({ queryKey: ["siteContent", "home"] });
    },
    onError: (err) => {
      console.error(err);
      toast.error("Save failed.");
    },
  });

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const whatWeDo = [
    {
      icon: Globe,
      title: "Psychological Awareness Online",
      description:
        "Structured lessons and content shared digitally to help students understand the psychology behind everyday challenges.",
    },
    {
      icon: Users,
      title: "School Engagements",
      description:
        "Speaking engagements and student-focused sessions that bring psychological awareness directly into the classroom.",
    },
    {
      icon: Smartphone,
      title: "EpsyApp",
      description:
        "Our structured student cognitive literacy and resilience platform designed to build mental strength day by day.",
    },
  ];

  return (
    <div>
      {/* Admin panel (ONLY visible if ?admin=1) */}
      {showAdmin && (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-6">
          {!session ? (
            <div
              className="rounded-3xl border p-5 max-w-lg"
              style={{ borderColor: "rgba(15,30,36,0.12)" }}
            >
              <div className="font-semibold mb-3" style={{ color: "var(--epsy-charcoal)" }}>
                Admin login
              </div>
              <Label className="mb-2 block">Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button className="mt-3 rounded-2xl" onClick={signIn}>
                Send magic link
              </Button>
            </div>
          ) : isAdmin ? (
            <div
              className="rounded-3xl border p-5"
              style={{ borderColor: "rgba(15,30,36,0.12)" }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold" style={{ color: "var(--epsy-charcoal)" }}>
                    Home editor
                  </div>
                  <div className="text-sm" style={{ color: "var(--epsy-slate-blue)" }}>
                    Signed in as: {session.user.email}
                  </div>
                </div>
                <Button variant="outline" className="rounded-2xl" onClick={signOut}>
                  Sign out
                </Button>
              </div>

              <div className="grid gap-4 mt-5 max-w-2xl">
                <div>
                  <Label>Hero title</Label>
                  <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
                </div>

                <div>
                  <Label>Hero subtitle</Label>
                  <Input value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Primary button text</Label>
                    <Input value={ctaPrimaryText} onChange={(e) => setCtaPrimaryText(e.target.value)} />
                  </div>
                  <div>
                    <Label>Secondary button text</Label>
                    <Input value={ctaSecondaryText} onChange={(e) => setCtaSecondaryText(e.target.value)} />
                  </div>
                </div>

                <Button
                  className="rounded-2xl"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  style={{ backgroundColor: "var(--epsy-charcoal)", color: "white" }}
                >
                  {saveMutation.isPending ? "Saving..." : "Save changes"}
                </Button>

                {isLoading && (
                  <div className="text-sm" style={{ color: "var(--epsy-slate-blue)" }}>
                    Loading content…
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="rounded-3xl border p-5 max-w-lg"
              style={{ borderColor: "rgba(15,30,36,0.12)" }}
            >
              <div className="font-semibold mb-2" style={{ color: "var(--epsy-charcoal)" }}>
                Logged in, but not admin
              </div>
              <div className="text-sm" style={{ color: "var(--epsy-slate-blue)" }}>
                Signed in as: {session.user.email}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {settings?.hero_background_url ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${settings.hero_background_url})` }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "var(--epsy-charcoal)",
                opacity: settings?.hero_overlay_opacity ?? 0.3,
              }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "var(--epsy-off-white)" }}
          />
        )}

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              {...fadeInUp}
              className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight"
              style={{
                color: settings?.hero_background_url
                  ? "white"
                  : "var(--epsy-charcoal)",
              }}
            >
              {viewHeroTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg lg:text-xl mb-10 leading-relaxed"
              style={{
                color: settings?.hero_background_url
                  ? "rgba(255,255,255,0.9)"
                  : "var(--epsy-slate-blue)",
              }}
            >
              {viewHeroSubtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/about">
                <Button
                  className="px-8 py-6 text-base rounded-2xl font-semibold"
                  style={{
                    backgroundColor: "var(--epsy-sky-blue)",
                    color: "var(--epsy-charcoal)",
                  }}
                >
                  {viewPrimaryText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link to="/contact">
                <Button
                  variant="outline"
                  className="px-8 py-6 text-base rounded-2xl font-semibold"
                  style={{
                    borderColor: "var(--epsy-sky-blue)",
                    color: "var(--epsy-sky-blue)",
                  }}
                >
                  {viewSecondaryText}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: "white" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{ color: "var(--epsy-charcoal)" }}
            >
              What we do
            </h2>
            <p
              className="text-lg leading-relaxed"
              style={{ color: "var(--epsy-slate-blue)" }}
            >
              We combine accessible psychology education with practical tools
              designed for real life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whatWeDo.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="p-8 rounded-3xl border shadow-sm"
                  style={{
                    backgroundColor: "var(--epsy-off-white)",
                    borderColor: "rgba(15,30,36,0.08)",
                  }}
                >
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: "rgba(12,192,223,0.20)" }}
                  >
                    <Icon className="h-6 w-6" style={{ color: "var(--epsy-sky-blue)" }} />
                  </div>

                  <h3
                    className="text-xl font-semibold mb-3"
                    style={{ color: "var(--epsy-charcoal)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="leading-relaxed"
                    style={{ color: "var(--epsy-slate-blue)" }}
                  >
                    {item.description}
                  </p>

                  {item.title === "EpsyApp" && (
                    <div className="pt-5">
                      <Link
                        to="/epsyapp"
                        className="inline-flex items-center text-sm font-semibold"
                        style={{ color: "var(--epsy-sky-blue)" }}
                      >
                        Explore EpsyApp <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="text-center pt-14">
            <Link to={createPageUrl("Partnerships")}>
              <Button
                className="px-8 py-6 text-base rounded-2xl font-semibold"
                style={{
                  backgroundColor: "var(--epsy-charcoal)",
                  color: "white",
                }}
              >
                Partner with us <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}