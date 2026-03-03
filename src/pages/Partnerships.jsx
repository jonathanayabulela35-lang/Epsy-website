import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { School, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabaseClient";
import { getSiteContent, updateSiteContent } from "@/lib/siteContentApi";

export default function Partnerships() {
  const queryClient = useQueryClient();

  // Admin UI only with ?admin=1
  const showAdmin = useMemo(() => {
    return new URLSearchParams(window.location.search).get("admin") === "1";
  }, []);

  const ADMIN_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || "ayabulelaplatana126@gmail.com";

  const [session, setSession] = useState(null);
  const [emailLogin, setEmailLogin] = useState(ADMIN_EMAIL);

  const isAdmin =
    session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) =>
      setSession(newSession)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email: emailLogin,
      options: {
        emailRedirectTo: window.location.origin + "/partnerships?admin=1",
      },
    });
    if (error) toast.error(error.message);
    else toast.success("Magic link sent. Check your email.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out.");
  };

  // Load "partnerships" content JSON
  const { data: pageContent = {}, isLoading } = useQuery({
    queryKey: ["siteContent", "partnerships"],
    queryFn: async () => await getSiteContent("partnerships"),
  });

  // View fallbacks
  const viewHeaderTitle = pageContent.header_title ?? "Partner With Epsy";
  const viewHeaderSubtitle =
    pageContent.header_subtitle ??
    "We partner with schools, organisations, and individuals who believe in the goal Epsy is working toward — helping students strengthen their mentality and prepare for life mentally before life challenges them outwardly.";

  const viewSectionTitle = pageContent.section_title ?? "Partnership Opportunities";

  const viewPartnerTypes =
    pageContent.partner_types ?? [
      {
        key: "schools",
        title: "Schools",
        description:
          "Partner with us to bring psychological resilience training directly to your students.",
      },
      {
        key: "youth_orgs",
        title: "Youth Development Organisations",
        description:
          "Join forces with organisations aligned with youth development and mental wellness.",
      },
      {
        key: "supporters",
        title: "Individual Supporters",
        description:
          "Support the mission through donations or volunteer your expertise.",
      },
    ];

  const viewDonateTitle = pageContent.donate_title ?? "Support the Mission";
  const viewDonateButtonText = pageContent.donate_button_text ?? "Donate Now";
  const viewDonateButtonLink = pageContent.donate_button_link ?? "#";
  const viewDonateNote =
    pageContent.donate_note ??
    "Your donation supports the development of EpsyApp, the creation of structured psychological learning resources, and outreach to more schools.";

  // Editor fields
  const [headerTitle, setHeaderTitle] = useState("");
  const [headerSubtitle, setHeaderSubtitle] = useState("");
  const [sectionTitle, setSectionTitle] = useState("");

  const [p1Title, setP1Title] = useState("");
  const [p1Desc, setP1Desc] = useState("");

  const [p2Title, setP2Title] = useState("");
  const [p2Desc, setP2Desc] = useState("");

  const [p3Title, setP3Title] = useState("");
  const [p3Desc, setP3Desc] = useState("");

  const [donateTitle, setDonateTitle] = useState("");
  const [donateButtonText, setDonateButtonText] = useState("");
  const [donateButtonLink, setDonateButtonLink] = useState("");
  const [donateNote, setDonateNote] = useState("");

  // Sync editor fields when content loads
  useEffect(() => {
    setHeaderTitle(pageContent.header_title ?? viewHeaderTitle);
    setHeaderSubtitle(pageContent.header_subtitle ?? viewHeaderSubtitle);
    setSectionTitle(pageContent.section_title ?? viewSectionTitle);

    const list = Array.isArray(pageContent.partner_types) && pageContent.partner_types.length
      ? pageContent.partner_types
      : viewPartnerTypes;

    setP1Title(list?.[0]?.title ?? "Schools");
    setP1Desc(list?.[0]?.description ?? "");
    setP2Title(list?.[1]?.title ?? "Youth Development Organisations");
    setP2Desc(list?.[1]?.description ?? "");
    setP3Title(list?.[2]?.title ?? "Individual Supporters");
    setP3Desc(list?.[2]?.description ?? "");

    setDonateTitle(pageContent.donate_title ?? viewDonateTitle);
    setDonateButtonText(pageContent.donate_button_text ?? viewDonateButtonText);
    setDonateButtonLink(pageContent.donate_button_link ?? viewDonateButtonLink);
    setDonateNote(pageContent.donate_note ?? viewDonateNote);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageContent]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const next = {
        ...pageContent,
        header_title: headerTitle,
        header_subtitle: headerSubtitle,
        section_title: sectionTitle,
        partner_types: [
          { key: "schools", title: p1Title, description: p1Desc },
          { key: "youth_orgs", title: p2Title, description: p2Desc },
          { key: "supporters", title: p3Title, description: p3Desc },
        ],
        donate_title: donateTitle,
        donate_button_text: donateButtonText,
        donate_button_link: donateButtonLink,
        donate_note: donateNote,
      };
      await updateSiteContent("partnerships", next);
      return true;
    },
    onSuccess: () => {
      toast.success("Partnerships updated.");
      queryClient.invalidateQueries({ queryKey: ["siteContent", "partnerships"] });
    },
    onError: (err) => {
      console.error(err);
      toast.error("Save failed.");
    },
  });

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const partnerTypes = [
    { icon: School, title: viewPartnerTypes?.[0]?.title, description: viewPartnerTypes?.[0]?.description },
    { icon: Users, title: viewPartnerTypes?.[1]?.title, description: viewPartnerTypes?.[1]?.description },
    { icon: Heart, title: viewPartnerTypes?.[2]?.title, description: viewPartnerTypes?.[2]?.description },
  ];

  return (
    <div>
      {/* Admin panel (ONLY if ?admin=1) */}
      {showAdmin && (
        <div className="max-w-6xl mx-auto px-6 lg:px-12 pt-6">
          {!session ? (
            <div className="rounded-3xl border p-5 max-w-lg" style={{ borderColor: "rgba(15,30,36,0.12)" }}>
              <div className="font-semibold mb-3" style={{ color: "var(--epsy-charcoal)" }}>
                Admin login
              </div>
              <Label className="mb-2 block">Email</Label>
              <Input value={emailLogin} onChange={(e) => setEmailLogin(e.target.value)} />
              <Button className="mt-3 rounded-2xl" onClick={signIn}>
                Send magic link
              </Button>
            </div>
          ) : isAdmin ? (
            <div className="rounded-3xl border p-5" style={{ borderColor: "rgba(15,30,36,0.12)" }}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold" style={{ color: "var(--epsy-charcoal)" }}>
                    Partnerships editor
                  </div>
                  <div className="text-sm" style={{ color: "var(--epsy-slate-blue)" }}>
                    Signed in as: {session.user.email}
                  </div>
                </div>
                <Button variant="outline" className="rounded-2xl" onClick={signOut}>
                  Sign out
                </Button>
              </div>

              <div className="grid gap-4 mt-5">
                <div className="grid gap-2">
                  <Label>Header title</Label>
                  <Input value={headerTitle} onChange={(e) => setHeaderTitle(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Header subtitle</Label>
                  <Input value={headerSubtitle} onChange={(e) => setHeaderSubtitle(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Section title</Label>
                  <Input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Card 1 title</Label>
                    <Input value={p1Title} onChange={(e) => setP1Title(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Card 1 description</Label>
                    <Input value={p1Desc} onChange={(e) => setP1Desc(e.target.value)} />
                  </div>

                  <div className="grid gap-2">
                    <Label>Card 2 title</Label>
                    <Input value={p2Title} onChange={(e) => setP2Title(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Card 2 description</Label>
                    <Input value={p2Desc} onChange={(e) => setP2Desc(e.target.value)} />
                  </div>

                  <div className="grid gap-2">
                    <Label>Card 3 title</Label>
                    <Input value={p3Title} onChange={(e) => setP3Title(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Card 3 description</Label>
                    <Input value={p3Desc} onChange={(e) => setP3Desc(e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Donation section title</Label>
                  <Input value={donateTitle} onChange={(e) => setDonateTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Donate button text</Label>
                    <Input value={donateButtonText} onChange={(e) => setDonateButtonText(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Donate button link</Label>
                    <Input value={donateButtonLink} onChange={(e) => setDonateButtonLink(e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Donation note</Label>
                  <Input value={donateNote} onChange={(e) => setDonateNote(e.target.value)} />
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
            <div className="rounded-3xl border p-5 max-w-lg" style={{ borderColor: "rgba(15,30,36,0.12)" }}>
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

      {/* Header */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--epsy-off-white)" }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold mb-6"
            style={{ color: "var(--epsy-charcoal)" }}
          >
            {viewHeaderTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-lg leading-relaxed"
            style={{ color: "var(--epsy-slate-blue)" }}
          >
            {viewHeaderSubtitle}
          </motion.p>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.h2
            {...fadeInUp}
            className="text-3xl font-bold mb-12 text-center"
            style={{ color: "var(--epsy-charcoal)" }}
          >
            {viewSectionTitle}
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            {partnerTypes.map((partner, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="p-8 rounded-2xl"
                style={{ backgroundColor: "var(--epsy-off-white)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "var(--epsy-sky-blue)" }}
                >
                  <partner.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--epsy-charcoal)" }}>
                  {partner.title}
                </h3>
                <p className="leading-relaxed" style={{ color: "var(--epsy-slate-blue)" }}>
                  {partner.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: "var(--epsy-off-white)" }}>
        <div className="max-w-2xl mx-auto px-6 lg:px-12 text-center">
          <motion.div {...fadeInUp} className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: "var(--epsy-charcoal)" }}>
              {viewDonateTitle}
            </h2>

            <Button
              size="lg"
              className="text-white font-medium px-12 py-6 rounded-xl transition-all duration-300 hover:shadow-lg text-base"
              style={{ backgroundColor: "var(--epsy-sky-blue)" }}
              onClick={() => window.open(viewDonateButtonLink, "_blank")}
            >
              {viewDonateButtonText}
            </Button>

            <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: "var(--epsy-slate-blue)" }}>
              {viewDonateNote}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}