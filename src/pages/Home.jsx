import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Users, Smartphone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import { getSiteContent, updateSiteContent } from "@/lib/siteContentApi";

import AdminBar from "@/components/admin/AdminBar";
import InlineText from "@/components/admin/InlineText";
import { supabase } from "@/lib/supabaseClient";

const APK_URL = "/downloads/epsyapp.apk";

const defaultHomeSettings = {
  hero_background_url: "",
  hero_overlay_opacity: 0.3,
  hero_background_color: "#F7F9F8",
  download_section_background_color: "#FFFFFF",
  what_we_do_background_color: "#FFFFFF",
};

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

  const { data: homeSettingsRaw = {} } = useQuery({
    queryKey: ["siteContent", "home_settings"],
    queryFn: async () => await getSiteContent("home_settings"),
  });

  const homeSettings = {
    ...defaultHomeSettings,
    ...(homeSettingsRaw || {}),
  };

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

  const [settingsForm, setSettingsForm] = useState(homeSettings);

  useEffect(() => {
    setSettingsForm(homeSettings);
  }, [homeSettingsRaw]);

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

  const saveSettingsMutation = useMutation({
    mutationFn: async (nextSettings) => {
      await updateSiteContent("home_settings", nextSettings);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteContent", "home_settings"] });
    },
  });

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
        <section className="py-6" style={{ backgroundColor: "white" }}>
          <div className="max-w-5xl mx-auto px-6 lg:px-12">
            <div
              className="rounded-3xl border p-6 lg:p-8 shadow-sm"
              style={{
                backgroundColor: "var(--epsy-off-white)",
                borderColor: "rgba(15,30,36,0.08)",
              }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: "var(--epsy-charcoal)" }}
              >
                Home Page Background Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Hero background image URL</Label>
                  <Input
                    value={settingsForm.hero_background_url}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        hero_background_url: e.target.value,
                      }))
                    }
                    placeholder="Paste image URL"
                  />
                </div>

                <div>
                  <Label>Hero overlay opacity (0 to 1)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settingsForm.hero_overlay_opacity}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        hero_overlay_opacity: e.target.value,
                      }))
                    }
                    placeholder="0.3"
                  />
                </div>

                <div>
                  <Label>Hero fallback background color</Label>
                  <Input
                    value={settingsForm.hero_background_color}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        hero_background_color: e.target.value,
                      }))
                    }
                    placeholder="#F7F9F8"
                  />
                </div>

                <div>
                  <Label>Download section background color</Label>
                  <Input
                    value={settingsForm.download_section_background_color}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        download_section_background_color: e.target.value,
                      }))
                    }
                    placeholder="#FFFFFF"
                  />
                </div>

                <div>
                  <Label>What We Do section background color</Label>
                  <Input
                    value={settingsForm.what_we_do_background_color}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        what_we_do_background_color: e.target.value,
                      }))
                    }
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>

              <div className="pt-6">
                <Button
                  onClick={() =>
                    saveSettingsMutation.mutate({
                      ...settingsForm,
                      hero_overlay_opacity:
                        Number(settingsForm.hero_overlay_opacity) || 0,
                    })
                  }
                  disabled={saveSettingsMutation.isPending}
                  className="rounded-2xl"
                  style={{
                    backgroundColor: "var(--epsy-charcoal)",
                    color: "white",
                  }}
                >
                  {saveSettingsMutation.isPending
                    ? "Saving..."
                    : "Save background settings"}
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden">
        {homeSettings.hero_background_url ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${homeSettings.hero_background_url})` }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "var(--epsy-charcoal)",
                opacity: homeSettings.hero_overlay_opacity ?? 0.3,
              }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: homeSettings.hero_background_color }}
          />
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
                  color: homeSettings.hero_background_url
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
                  color: homeSettings.hero_background_url
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
                    borderColor: "var(--epsy-sky-blue)",
                    color: "var(--epsy-sky-blue)",
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

      <section
        className="py-16"
        style={{ backgroundColor: homeSettings.download_section_background_color }}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl p-8 lg:p-10 border shadow-sm"
            style={{
              backgroundColor: "var(--epsy-off-white)",
              borderColor: "rgba(15,30,36,0.08)",
            }}
          >
            <h2
              className="text-3xl lg:text-4xl font-bold mb-8"
              style={{ color: "var(--epsy-charcoal)" }}
            >
              Download the EpsyApp
            </h2>

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

      <section
        className="py-24 lg:py-32"
        style={{ backgroundColor: homeSettings.what_we_do_background_color }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <InlineText
              enabled={isAdmin}
              as="h2"
              value={view.what_title}
              onSave={(v) => saveField("what_title", v)}
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{ color: "var(--epsy-charcoal)" }}
            />
            <InlineText
              enabled={isAdmin}
              as="p"
              value={view.what_subtitle}
              onSave={(v) => saveField("what_subtitle", v)}
              className="text-lg leading-relaxed"
              style={{ color: "var(--epsy-slate-blue)" }}
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