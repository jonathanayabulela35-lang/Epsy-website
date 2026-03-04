import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Target, Eye, BookOpen } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabaseClient";
import { getSiteContent, updateSiteContent } from "@/lib/siteContentApi";

import AdminBar from "@/components/admin/AdminBar";
import InlineText from "@/components/admin/InlineText";

export default function About() {
  const queryClient = useQueryClient();

  // admin mode only with ?admin=1
  const showAdmin = useMemo(() => {
    return new URLSearchParams(window.location.search).get("admin") === "1";
  }, []);

  const ADMIN_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || "ayabulelaplatana126@gmail.com";

  // Load about content from Supabase
  const { data: aboutContent = {} } = useQuery({
    queryKey: ["siteContent", "about"],
    queryFn: async () => await getSiteContent("about"),
  });

  // session for enabling inline editing
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

  // Defaults (fallbacks)
  const view = {
    header_title: aboutContent.header_title ?? "Who We Are",
    header_subtitle:
      aboutContent.header_subtitle ??
      "Epsy is a non-profit organisation focused on psychological awareness and resilience.",

    vision_title: aboutContent.vision_title ?? "Vision",
    vision_text: aboutContent.vision_text ?? "To instill psychological resilience.",

    mission_title: aboutContent.mission_title ?? "Mission",
    mission_text: aboutContent.mission_text ?? "To raise psychological awareness.",

    story_title: aboutContent.story_title ?? "Our Story",
    story_p1:
      aboutContent.story_p1 ??
      "Epsy was founded to help students develop a true and realistic understanding of life at its different stages. Many people are first defeated in their minds before they are defeated outwardly. Epsy exists to challenge that pattern.",
    story_p2:
      aboutContent.story_p2 ??
      "We guide students to mentally prepare for the realities of growth, responsibility, pressure, success, and failure — so they are strengthened inwardly before life tests them outwardly.",

    motto_title: aboutContent.motto_title ?? `"It's All About Mentality."`,
    motto_text:
      aboutContent.motto_text ??
      "Your thinking shapes your decisions. Your decisions shape your actions. Your actions shape your outcomes. When you strengthen your mentality, you strengthen your foundation for everything that follows. This is why mentality matters — it's where everything begins.",
  };

  const saveField = async (field, value) => {
    const next = { ...aboutContent, [field]: value };
    await updateSiteContent("about", next);
    queryClient.invalidateQueries({ queryKey: ["siteContent", "about"] });
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <div>
      {/* Admin login bar (only when ?admin=1) */}
      <AdminBar
        show={showAdmin}
        redirectPathWithAdmin="/about?admin=1"
        adminEmail={ADMIN_EMAIL}
      />

      {/* Header */}
      <section
        className="py-20 lg:py-28"
        style={{ backgroundColor: "var(--epsy-off-white)" }}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <InlineText
              enabled={isAdmin}
              as="h1"
              value={view.header_title}
              onSave={(v) => saveField("header_title", v)}
              className="text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: "var(--epsy-charcoal)" }}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}>
            <InlineText
              enabled={isAdmin}
              as="p"
              value={view.header_subtitle}
              onSave={(v) => saveField("header_subtitle", v)}
              className="text-lg leading-relaxed"
              style={{ color: "var(--epsy-slate-blue)" }}
            />
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Vision */}
            <motion.div
              {...fadeInUp}
              className="p-10 rounded-2xl"
              style={{ backgroundColor: "var(--epsy-off-white)" }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: "var(--epsy-sky-blue)" }}
              >
                <Eye className="w-7 h-7 text-white" />
              </div>

              <InlineText
                enabled={isAdmin}
                as="h2"
                value={view.vision_title}
                onSave={(v) => saveField("vision_title", v)}
                className="text-2xl font-bold mb-4"
                style={{ color: "var(--epsy-charcoal)" }}
              />

              <InlineText
                enabled={isAdmin}
                as="p"
                value={view.vision_text}
                onSave={(v) => saveField("vision_text", v)}
                className="text-lg leading-relaxed"
                style={{ color: "var(--epsy-slate-blue)" }}
              />
            </motion.div>

            {/* Mission */}
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="p-10 rounded-2xl"
              style={{ backgroundColor: "var(--epsy-off-white)" }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: "var(--epsy-sky-blue)" }}
              >
                <Target className="w-7 h-7 text-white" />
              </div>

              <InlineText
                enabled={isAdmin}
                as="h2"
                value={view.mission_title}
                onSave={(v) => saveField("mission_title", v)}
                className="text-2xl font-bold mb-4"
                style={{ color: "var(--epsy-charcoal)" }}
              />

              <InlineText
                enabled={isAdmin}
                as="p"
                value={view.mission_text}
                onSave={(v) => saveField("mission_text", v)}
                className="text-lg leading-relaxed"
                style={{ color: "var(--epsy-slate-blue)" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section
        className="py-16 lg:py-24"
        style={{ backgroundColor: "var(--epsy-off-white)" }}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeInUp}>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 mx-auto"
              style={{ backgroundColor: "var(--epsy-sky-blue)" }}
            >
              <BookOpen className="w-7 h-7 text-white" />
            </div>

            <InlineText
              enabled={isAdmin}
              as="h2"
              value={view.story_title}
              onSave={(v) => saveField("story_title", v)}
              className="text-3xl lg:text-4xl font-bold mb-8 text-center"
              style={{ color: "var(--epsy-charcoal)" }}
            />

            <div
              className="space-y-6 text-lg leading-relaxed"
              style={{ color: "var(--epsy-slate-blue)" }}
            >
              <InlineText
                enabled={isAdmin}
                as="p"
                value={view.story_p1}
                onSave={(v) => saveField("story_p1", v)}
                style={{ color: "var(--epsy-slate-blue)" }}
              />

              <InlineText
                enabled={isAdmin}
                as="p"
                value={view.story_p2}
                onSave={(v) => saveField("story_p2", v)}
                style={{ color: "var(--epsy-slate-blue)" }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Motto Explanation */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeInUp} className="text-center">
            <InlineText
              enabled={isAdmin}
              as="h2"
              value={view.motto_title}
              onSave={(v) => saveField("motto_title", v)}
              className="text-3xl lg:text-4xl font-bold mb-6"
              style={{ color: "var(--epsy-charcoal)" }}
            />

            <InlineText
              enabled={isAdmin}
              as="p"
              value={view.motto_text}
              onSave={(v) => saveField("motto_text", v)}
              className="text-lg leading-relaxed"
              style={{ color: "var(--epsy-slate-blue)" }}
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
}