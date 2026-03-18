import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Users, Smartphone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getSiteContent, updateSiteContent } from "@/lib/siteContentApi";

import AdminBar from "@/components/admin/AdminBar";
import InlineText from "@/components/admin/InlineText";
import SectionBackgroundControls from "@/components/admin/SectionBackgroundControls.jsx";
import {
  getSectionBackgroundData,
  getSectionBackgroundStyle,
} from "@/components/admin/sectionBackground";
import { supabase } from "@/lib/supabaseClient";

const APK_URL = "/downloads/epsyapp.apk";

export default function Home() {
  const queryClient = useQueryClient();

  const showAdmin = useMemo(() => {
    return new URLSearchParams(window.location.search).get("admin") === "1";
  }, []);

  const ADMIN_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || "ayabulelaplatana126@gmail.com";

  const { data: homeContent = {}, isLoading: homeLoading } = useQuery({
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

  if (homeLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--epsy-off-white)",
        }}
      />
    );
  }

  const view = {
    hero_title:
      homeContent.hero_title ?? "Building resilience through everyday psychology.",
    hero_subtitle:
      homeContent.hero_subtitle ??
      "Epsy helps students and communities understand the mind, strengthen coping skills, and grow practical emotional resilience.",
    hero_cta_primary_text: homeContent.hero_cta_primary_text ?? "Learn more",
    hero_cta_secondary_text: homeContent.hero_cta_secondary_text ?? "Contact us",

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

  const saveField = async (field, value) => {
    const next = { ...homeContent, [field]: value };
    await updateSiteContent("home", next);
    queryClient.invalidateQueries({ queryKey: ["siteContent", "home"] });
  };

  const saveCardField = async (index, field, value) => {
    const cards = Array.isArray(view.cards) ? [...view.cards] : [];
    const card = cards[index] || {};
    cards[index] = { ...card, [field]: value };
    const next = { ...homeContent, cards };
    await updateSiteContent("home", next);
    queryClient.invalidateQueries({ queryKey: ["siteContent", "home"] });
  };

  const updateSectionBackground = async (sectionKey, patch) => {
    const next = { ...homeContent };

    Object.entries(patch).forEach(([key, value]) => {
      next[`${sectionKey}_${key}`] = value;
    });

    await updateSiteContent("home", next);
    queryClient.invalidateQueries({ queryKey: ["siteContent", "home"] });
  };

  const heroSection = {
    id: "hero",
    type: "hero",
    data: {
      background_type: homeContent.hero_background_type ?? "none",
      background_color: homeContent.hero_background_color ?? "",
      background_image: homeContent.hero_background_image ?? "",
      background_overlay: homeContent.hero_background_overlay ?? 0.3,
    },
  };

  const downloadSection = {
    id: "download",
    type: "download",
    data: {
      background_type: homeContent.download_background_type ?? "none",
      background_color: homeContent.download_background_color ?? "",
      background_image: homeContent.download_background_image ?? "",
      background_overlay: homeContent.download_background_overlay ?? 0.35,
    },
  };

  const whatWeDoSection = {
    id: "what_we_do",
    type: "what_we_do",
    data: {
      background_type: homeContent.what_we_do_background_type ?? "none",
      background_color: homeContent.what_we_do_background_color ?? "",
      background_image: homeContent.what_we_do_background_image ?? "",
      background_overlay: homeContent.what_we_do_background_overlay ?? 0.35,
    },
  };

  const heroBgData = getSectionBackgroundData(heroSection);
  const heroBgStyle = getSectionBackgroundStyle(heroSection);

  const downloadBgData = getSectionBackgroundData(downloadSection);
  const downloadBgStyle = getSectionBackgroundStyle(downloadSection);

  const whatWeDoBgData = getSectionBackgroundData(whatWeDoSection);
  const whatWeDoBgStyle = getSectionBackgroundStyle(whatWeDoSection);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const iconForIndex = (i) => [Globe, Users, Smartphone][i] || Globe;

  return (
    <div>
      <AdminBar
        show={showAdmin}
        redirectPathWithAdmin="/?admin=1"
        adminEmail={ADMIN_EMAIL}
      />

      {isAdmin && (
        <SectionBackgroundControls
          section={heroSection}
          isAdmin={isAdmin}
          onChange={(patch) => updateSectionBackground("hero", patch)}
        />
      )}

      <section
        className="relative overflow-hidden"
        style={
          heroBgData.backgroundType === "color"
            ? heroBgStyle
            : heroBgData.backgroundType === "none"
            ? { backgroundColor: "var(--epsy-off-white)" }
            : {}
        }
      >
        {heroBgData.backgroundType === "image" && (
          <>
            <div className="absolute inset-0 bg-cover bg-center" style={heroBgStyle} />
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "black",
                opacity: heroBgData.backgroundOverlay,
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
                value={view.hero_title}
                onSave={(v) => saveField("hero_title", v)}
                className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight"
                style={{
                  color:
                    heroBgData.backgroundType === "image"
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
                value={view.hero_subtitle}
                onSave={(v) => saveField("hero_subtitle", v)}
                className="text-lg lg:text-xl mb-10 leading-relaxed"
                style={{
                  color:
                    heroBgData.backgroundType === "image"
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
                    value={view.hero_cta_primary_text}
                    onSave={(v) => saveField("hero_cta_primary_text", v)}
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
                      heroBgData.backgroundType === "image"
                        ? "white"
                        : "var(--epsy-sky-blue)",
                    color:
                      heroBgData.backgroundType === "image"
                        ? "white"
                        : "var(--epsy-charcoal)",
                    backgroundColor:
                      heroBgData.backgroundType === "image"
                        ? "transparent"
                        : "rgba(255,255,255,0.92)",
                  }}
                >
                  <InlineText
                    enabled={isAdmin}
                    as="span"
                    value={view.hero_cta_secondary_text}
                    onSave={(v) => saveField("hero_cta_secondary_text", v)}
                    style={{ display: "inline-block" }}
                  />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {isAdmin && (
        <SectionBackgroundControls
          section={downloadSection}
          isAdmin={isAdmin}
          onChange={(patch) => updateSectionBackground("download", patch)}
        />
      )}

      <section
        className="py-10 lg:py-12 relative overflow-hidden"
        style={
          downloadBgData.backgroundType === "color"
            ? downloadBgStyle
            : downloadBgData.backgroundType === "none"
            ? { backgroundColor: "white" }
            : {}
        }
      >
        {downloadBgData.backgroundType === "image" && (
          <>
            <div className="absolute inset-0 bg-cover bg-center" style={downloadBgStyle} />
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "black",
                opacity: downloadBgData.backgroundOverlay,
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
                downloadBgData.backgroundType === "image"
                  ? "rgba(250,251,249,0.92)"
                  : "var(--epsy-off-white)",
              borderColor: "rgba(15,30,36,0.08)",
            }}
          >
            <h2
              className="text-3xl lg:text-4xl font-bold mb-8"
              style={{ color: "var(--epsy-charcoal)" }}
            >
              Download the EpsyApp
            </h2>

            <div className="flex justify-center">
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
            </div>
          </motion.div>
        </div>
      </section>

      {isAdmin && (
        <SectionBackgroundControls
          section={whatWeDoSection}
          isAdmin={isAdmin}
          onChange={(patch) => updateSectionBackground("what_we_do", patch)}
        />
      )}

      <section
        className="py-16 lg:py-20 relative overflow-hidden"
        style={
          whatWeDoBgData.backgroundType === "color"
            ? whatWeDoBgStyle
            : whatWeDoBgData.backgroundType === "none"
            ? { backgroundColor: "white" }
            : {}
        }
      >
        {whatWeDoBgData.backgroundType === "image" && (
          <>
            <div className="absolute inset-0 bg-cover bg-center" style={whatWeDoBgStyle} />
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "black",
                opacity: whatWeDoBgData.backgroundOverlay,
              }}
            />
          </>
        )}

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <InlineText
              enabled={isAdmin}
              as="h2"
              value={view.what_title}
              onSave={(v) => saveField("what_title", v)}
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{
                color:
                  whatWeDoBgData.backgroundType === "image"
                    ? "white"
                    : "var(--epsy-charcoal)",
              }}
            />
            <InlineText
              enabled={isAdmin}
              as="p"
              value={view.what_subtitle}
              onSave={(v) => saveField("what_subtitle", v)}
              className="text-lg leading-relaxed"
              style={{
                color:
                  whatWeDoBgData.backgroundType === "image"
                    ? "rgba(255,255,255,0.9)"
                    : "var(--epsy-slate-blue)",
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(view.cards || []).map((item, idx) => {
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
                      whatWeDoBgData.backgroundType === "image"
                        ? "rgba(250,251,249,0.92)"
                        : "var(--epsy-off-white)",
                    borderColor: "rgba(15,30,36,0.08)",
                  }}
                >
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: "rgba(12,192,223,0.20)" }}
                  >
                    <Icon className="h-6 w-6" style={{ color: "var(--epsy-sky-blue)" }} />
                  </div>

                  <InlineText
                    enabled={isAdmin}
                    as="h3"
                    value={item.title}
                    onSave={(v) => saveCardField(idx, "title", v)}
                    className="text-xl font-semibold mb-3"
                    style={{ color: "var(--epsy-charcoal)" }}
                  />

                  <InlineText
                    enabled={isAdmin}
                    as="p"
                    value={item.description}
                    onSave={(v) => saveCardField(idx, "description", v)}
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
                  value={view.partner_button_text}
                  onSave={(v) => saveField("partner_button_text", v)}
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
