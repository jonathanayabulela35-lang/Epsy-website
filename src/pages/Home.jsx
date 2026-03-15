import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Users, Smartphone, Download } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabaseClient";
import { getSiteContent, updateSiteContent } from "@/lib/siteContentApi";

import AdminBar from "@/components/admin/AdminBar";
import InlineText from "@/components/admin/InlineText";
import SectionBackgroundControls from "@/components/admin/SectionBackgroundControls.jsx";
import {
  getSectionBackgroundData,
  getSectionBackgroundStyle,
} from "@/components/admin/sectionBackground";
import { Button } from "@/components/ui/button";

const APK_URL = "/downloads/epsyapp.apk";

export default function Home() {
  const queryClient = useQueryClient();

  const showAdmin = useMemo(() => {
    return new URLSearchParams(window.location.search).get("admin") === "1";
  }, []);

  const ADMIN_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || "ayabulelaplatana126@gmail.com";

  const { data: homeContent = {} } = useQuery({
    queryKey: ["siteContent", "home"],
    queryFn: async () => await getSiteContent("home"),
  });

  const { data: sessionData } = useQuery({
    queryKey: ["authSession"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: 1000 * 10,
  });

  const isAdmin =
    showAdmin &&
    sessionData?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const oldView = {
    hero_title:
      homeContent.hero_title ?? "Building resilience through everyday psychology.",
    hero_subtitle:
      homeContent.hero_subtitle ??
      "Epsy helps students and communities understand the mind, strengthen coping skills, and grow practical emotional resilience.",
    hero_cta_primary_text: homeContent.hero_cta_primary_text ?? "Learn more",
    hero_cta_secondary_text: homeContent.hero_cta_secondary_text ?? "Contact us",

    download_title: homeContent.download_title ?? "Download the EpsyApp",

    what_title: homeContent.what_title ?? "What we do",
    what_subtitle:
      homeContent.what_subtitle ??
      "We combine accessible psychology education with practical tools designed for real life.",

    cards: homeContent.cards ?? [
      {
        key: "online",
        title: "Psychological Awareness Online",
        description:
          "Structured lessons and content shared digitally to help students understand the psychology behind everyday challenges.",
      },
      {
        key: "schools",
        title: "School Engagements",
        description:
          "Speaking engagements and student-focused sessions that bring psychological awareness directly into the classroom.",
      },
      {
        key: "epsyapp",
        title: "EpsyApp",
        description:
          "Our structured student cognitive literacy and resilience platform designed to build mental strength day by day.",
      },
    ],

    partner_button_text: homeContent.partner_button_text ?? "Partner with us",
  };

  const sections = useMemo(() => {
    const s = homeContent.sections;
    if (Array.isArray(s) && s.length) return s;

    return [
      {
        id: "hero",
        type: "hero",
        data: {
          hero_title: oldView.hero_title,
          hero_subtitle: oldView.hero_subtitle,
          hero_cta_primary_text: oldView.hero_cta_primary_text,
          hero_cta_secondary_text: oldView.hero_cta_secondary_text,
          background_type: "color",
          background_color: "var(--epsy-off-white)",
          background_image: "",
          background_overlay: 0.3,
        },
      },
      {
        id: "download",
        type: "download",
        data: {
          download_title: oldView.download_title,
          background_type: "none",
          background_color: "",
          background_image: "",
          background_overlay: 0.35,
        },
      },
      {
        id: "what_we_do",
        type: "what_we_do",
        data: {
          what_title: oldView.what_title,
          what_subtitle: oldView.what_subtitle,
          cards: oldView.cards,
          partner_button_text: oldView.partner_button_text,
          background_type: "none",
          background_color: "",
          background_image: "",
          background_overlay: 0.35,
        },
      },
    ];
  }, [homeContent.sections, oldView]);

  const saveSections = async (nextSections) => {
    const next = { ...homeContent, sections: nextSections };
    await updateSiteContent("home", next);
    queryClient.invalidateQueries({ queryKey: ["siteContent", "home"] });
  };

  const saveSectionField = async (sectionId, field, value) => {
    const nextSections = sections.map((s) =>
      s.id === sectionId ? { ...s, data: { ...s.data, [field]: value } } : s
    );
    await saveSections(nextSections);
  };

  const updateSectionData = async (sectionId, patch) => {
    const nextSections = sections.map((s) =>
      s.id === sectionId ? { ...s, data: { ...s.data, ...patch } } : s
    );
    await saveSections(nextSections);
  };

  const saveCardField = async (sectionId, index, field, value) => {
    const nextSections = sections.map((s) => {
      if (s.id !== sectionId) return s;
      const cards = Array.isArray(s.data?.cards) ? [...s.data.cards] : [];
      const card = cards[index] || {};
      cards[index] = { ...card, [field]: value };
      return {
        ...s,
        data: {
          ...s.data,
          cards,
        },
      };
    });

    await saveSections(nextSections);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const iconForIndex = (i) => [Globe, Users, Smartphone][i] || Globe;

  const renderSection = (section) => {
    const bgData = getSectionBackgroundData(section);
    const bgStyle = getSectionBackgroundStyle(section);

    if (section.type === "hero") {
      const d = section.data || {};
      const heroTitle = d.hero_title ?? "Building resilience through everyday psychology.";
      const heroSubtitle =
        d.hero_subtitle ??
        "Epsy helps students and communities understand the mind, strengthen coping skills, and grow practical emotional resilience.";
      const primaryText = d.hero_cta_primary_text ?? "Learn more";
      const secondaryText = d.hero_cta_secondary_text ?? "Contact us";

      return (
        <div key={section.id}>
          <SectionBackgroundControls
            section={section}
            isAdmin={isAdmin}
            onChange={(patch) => updateSectionData(section.id, patch)}
          />

          <section
            className="relative overflow-hidden"
            style={
              bgData.backgroundType === "color"
                ? bgStyle
                : bgData.backgroundType === "none"
                ? { backgroundColor: "var(--epsy-off-white)" }
                : {}
            }
          >
            {bgData.backgroundType === "image" && (
              <>
                <div className="absolute inset-0" style={bgStyle} />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: "black",
                    opacity: bgData.backgroundOverlay,
                  }}
                />
              </>
            )}

            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <motion.div {...fadeInUp}>
                  <InlineText
                    enabled={isAdmin}
                    as="h1"
                    value={heroTitle}
                    onSave={(v) => saveSectionField(section.id, "hero_title", v)}
                    className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight"
                    style={{
                      color:
                        bgData.backgroundType === "image"
                          ? "white"
                          : "var(--epsy-charcoal)",
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <InlineText
                    enabled={isAdmin}
                    as="p"
                    value={heroSubtitle}
                    onSave={(v) => saveSectionField(section.id, "hero_subtitle", v)}
                    className="text-lg lg:text-xl mb-10 leading-relaxed"
                    style={{
                      color:
                        bgData.backgroundType === "image"
                          ? "rgba(255,255,255,0.9)"
                          : "var(--epsy-slate-blue)",
                    }}
                  />
                </motion.div>

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
                      <InlineText
                        enabled={isAdmin}
                        as="span"
                        value={primaryText}
                        onSave={(v) =>
                          saveSectionField(section.id, "hero_cta_primary_text", v)
                        }
                        style={{ display: "inline-block" }}
                      />
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <Link to="/contact">
                    <Button
                      variant="outline"
                      className="px-8 py-6 text-base rounded-2xl font-semibold"
                      style={{
                        borderColor:
                          bgData.backgroundType === "image"
                            ? "white"
                            : "var(--epsy-sky-blue)",
                        color:
                          bgData.backgroundType === "image"
                            ? "white"
                            : "var(--epsy-sky-blue)",
                      }}
                    >
                      <InlineText
                        enabled={isAdmin}
                        as="span"
                        value={secondaryText}
                        onSave={(v) =>
                          saveSectionField(section.id, "hero_cta_secondary_text", v)
                        }
                        style={{ display: "inline-block" }}
                      />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </section>
        </div>
      );
    }

    if (section.type === "download") {
      const d = section.data || {};
      const title = d.download_title ?? "Download the EpsyApp";

      return (
        <div key={section.id}>
          <SectionBackgroundControls
            section={section}
            isAdmin={isAdmin}
            onChange={(patch) => updateSectionData(section.id, patch)}
          />

          <section
            className="py-16 relative overflow-hidden"
            style={
              bgData.backgroundType === "color"
                ? bgStyle
                : bgData.backgroundType === "none"
                ? { backgroundColor: "white" }
                : {}
            }
          >
            {bgData.backgroundType === "image" && (
              <>
                <div className="absolute inset-0" style={bgStyle} />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: "black",
                    opacity: bgData.backgroundOverlay,
                  }}
                />
              </>
            )}

            <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-3xl p-8 lg:p-10 border shadow-sm"
                style={{
                  backgroundColor:
                    bgData.backgroundType === "image"
                      ? "rgba(250,251,249,0.92)"
                      : "var(--epsy-off-white)",
                  borderColor: "rgba(15,30,36,0.08)",
                }}
              >
                <InlineText
                  enabled={isAdmin}
                  as="h2"
                  value={title}
                  onSave={(v) => saveSectionField(section.id, "download_title", v)}
                  className="text-3xl lg:text-4xl font-bold mb-8"
                  style={{ color: "var(--epsy-charcoal)" }}
                />

                <a href={APK_URL}>
                  <Button
                    className="px-8 py-6 text-base rounded-2xl font-semibold"
                    style={{
                      backgroundColor: "var(--epsy-charcoal)",
                      color: "white",
                    }}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download EpsyApp APK
                  </Button>
                </a>
              </motion.div>
            </div>
          </section>
        </div>
      );
    }

    if (section.type === "what_we_do") {
      const d = section.data || {};
      const whatTitle = d.what_title ?? "What we do";
      const whatSubtitle =
        d.what_subtitle ??
        "We combine accessible psychology education with practical tools designed for real life.";
      const cards = Array.isArray(d.cards) ? d.cards : [];
      const partnerButtonText = d.partner_button_text ?? "Partner with us";

      return (
        <div key={section.id}>
          <SectionBackgroundControls
            section={section}
            isAdmin={isAdmin}
            onChange={(patch) => updateSectionData(section.id, patch)}
          />

          <section
            className="py-24 lg:py-32 relative overflow-hidden"
            style={
              bgData.backgroundType === "color"
                ? bgStyle
                : bgData.backgroundType === "none"
                ? { backgroundColor: "white" }
                : {}
            }
          >
            {bgData.backgroundType === "image" && (
              <>
                <div className="absolute inset-0" style={bgStyle} />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: "black",
                    opacity: bgData.backgroundOverlay,
                  }}
                />
              </>
            )}

            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <InlineText
                  enabled={isAdmin}
                  as="h2"
                  value={whatTitle}
                  onSave={(v) => saveSectionField(section.id, "what_title", v)}
                  className="text-3xl lg:text-4xl font-bold mb-4"
                  style={{
                    color:
                      bgData.backgroundType === "image"
                        ? "white"
                        : "var(--epsy-charcoal)",
                  }}
                />
                <InlineText
                  enabled={isAdmin}
                  as="p"
                  value={whatSubtitle}
                  onSave={(v) => saveSectionField(section.id, "what_subtitle", v)}
                  className="text-lg leading-relaxed"
                  style={{
                    color:
                      bgData.backgroundType === "image"
                        ? "rgba(255,255,255,0.9)"
                        : "var(--epsy-slate-blue)",
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {cards.map((item, idx) => {
                  const Icon = iconForIndex(idx);

                  return (
                    <motion.div
                      key={item.key || idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="p-8 rounded-3xl border shadow-sm"
                      style={{
                        backgroundColor:
                          bgData.backgroundType === "image"
                            ? "rgba(250,251,249,0.92)"
                            : "var(--epsy-off-white)",
                        borderColor: "rgba(15,30,36,0.08)",
                      }}
                    >
                      <div
                        className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5"
                        style={{ backgroundColor: "rgba(12,192,223,0.20)" }}
                      >
                        <Icon
                          className="h-6 w-6"
                          style={{ color: "var(--epsy-sky-blue)" }}
                        />
                      </div>

                      <InlineText
                        enabled={isAdmin}
                        as="h3"
                        value={item.title}
                        onSave={(v) => saveCardField(section.id, idx, "title", v)}
                        className="text-xl font-semibold mb-3"
                        style={{ color: "var(--epsy-charcoal)" }}
                      />

                      <InlineText
                        enabled={isAdmin}
                        as="p"
                        value={item.description}
                        onSave={(v) =>
                          saveCardField(section.id, idx, "description", v)
                        }
                        className="leading-relaxed"
                        style={{ color: "var(--epsy-slate-blue)" }}
                      />

                      {idx === 2 && (
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
                    <InlineText
                      enabled={isAdmin}
                      as="span"
                      value={partnerButtonText}
                      onSave={(v) =>
                        saveSectionField(section.id, "partner_button_text", v)
                      }
                      style={{ display: "inline-block" }}
                    />
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <AdminBar
        show={showAdmin}
        redirectPathWithAdmin="/?admin=1"
        adminEmail={ADMIN_EMAIL}
      />

      {sections.map((section) => renderSection(section))}
    </div>
  );
}