import React, { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Globe,
  Users,
  Smartphone,
  GripVertical,
  Copy,
  Trash2,
  Plus,
  Minus,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { siteSettings } from "@/lib/siteSettings";
import { getSiteContent, updateSiteContent } from "@/lib/siteContentApi";

import AdminBar from "@/components/admin/AdminBar";
import InlineText from "@/components/admin/InlineText";
import { supabase } from "@/lib/supabaseClient";

/**
 * HOME SECTIONS MODEL (stored in Supabase under home.sections):
 * [
 *  { id, type: "hero", data: {...} },
 *  { id, type: "what", data: {...} },
 *  { id, type: "text", data: { title, body } },
 *  { id, type: "divider", data: {} },
 *  { id, type: "spacer", data: { height } }
 * ]
 *
 * Backwards compatible:
 * - If "home.sections" doesn't exist yet, we build sections from old fields.
 */

export default function Home() {
  const settings = siteSettings;
  const queryClient = useQueryClient();

  // admin mode only with ?admin=1
  const showAdmin = useMemo(() => {
    return new URLSearchParams(window.location.search).get("admin") === "1";
  }, []);

  const ADMIN_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || "ayabulelaplatana126@gmail.com";

  // Load home content from Supabase
  const { data: homeContent = {} } = useQuery({
    queryKey: ["siteContent", "home"],
    queryFn: async () => await getSiteContent("home"),
  });

  // Determine if current session is admin (for enabling inline edits)
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

  // ---------- Defaults (old field model) ----------
  const oldView = {
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

  // ---------- Sections (new model, fallback to old model) ----------
  const sections = useMemo(() => {
    const s = homeContent.sections;
    if (Array.isArray(s) && s.length) return s;

    // Build default sections from old model
    return [
      {
        id: "hero",
        type: "hero",
        data: {
          hero_title: oldView.hero_title,
          hero_subtitle: oldView.hero_subtitle,
          hero_cta_primary_text: oldView.hero_cta_primary_text,
          hero_cta_secondary_text: oldView.hero_cta_secondary_text,
        },
      },
      {
        id: "what",
        type: "what",
        data: {
          what_title: oldView.what_title,
          what_subtitle: oldView.what_subtitle,
          cards: oldView.cards,
          partner_button_text: oldView.partner_button_text,
        },
      },
    ];
  }, [homeContent.sections, oldView]);

  // ---------- Save helpers ----------
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

  const saveCardField = async (sectionId, cardIndex, field, value) => {
    const nextSections = sections.map((s) => {
      if (s.id !== sectionId) return s;
      const cards = Array.isArray(s.data?.cards) ? [...s.data.cards] : [];
      const card = cards[cardIndex] || {};
      cards[cardIndex] = { ...card, [field]: value };
      return { ...s, data: { ...s.data, cards } };
    });

    await saveSections(nextSections);
  };

  // ---------- Drag & drop (HTML5) ----------
  const dragIdRef = useRef(null);

  const onDragStart = (id) => {
    dragIdRef.current = id;
  };

  const onDropOn = async (targetId) => {
    const draggedId = dragIdRef.current;
    dragIdRef.current = null;

    if (!draggedId || draggedId === targetId) return;

    const current = [...sections];
    const fromIndex = current.findIndex((s) => s.id === draggedId);
    const toIndex = current.findIndex((s) => s.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);

    try {
      await saveSections(current);
      toast.success("Section moved");
    } catch (e) {
      console.error(e);
      toast.error("Move failed");
    }
  };

  // ---------- Duplicate / Delete ----------
  const duplicateSection = async (id) => {
    const current = [...sections];
    const idx = current.findIndex((s) => s.id === id);
    if (idx === -1) return;

    const src = current[idx];
    const cloned = {
      ...src,
      id: `${src.type}_${Date.now()}`,
      data: JSON.parse(JSON.stringify(src.data || {})),
    };

    current.splice(idx + 1, 0, cloned);

    try {
      await saveSections(current);
      toast.success("Section duplicated");
    } catch (e) {
      console.error(e);
      toast.error("Duplicate failed");
    }
  };

  const deleteSection = async (id) => {
    if (sections.length <= 1) {
      toast.error("You must keep at least one section.");
      return;
    }

    const current = sections.filter((s) => s.id !== id);

    try {
      await saveSections(current);
      toast.success("Section deleted");
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
  };

  // ---------- Add Section (admin only) ----------
  const makeSection = (type) => {
    const id = `${type}_${Date.now()}`;

    if (type === "hero") {
      return {
        id,
        type: "hero",
        data: {
          hero_title: "New hero title…",
          hero_subtitle: "New hero subtitle…",
          hero_cta_primary_text: "Learn more",
          hero_cta_secondary_text: "Contact us",
        },
      };
    }

    if (type === "what") {
      return {
        id,
        type: "what",
        data: {
          what_title: "What we do",
          what_subtitle: "Describe what you do here…",
          cards: [
            { key: "card1", title: "Card 1", description: "Description…" },
            { key: "card2", title: "Card 2", description: "Description…" },
            { key: "card3", title: "Card 3", description: "Description…" },
          ],
          partner_button_text: "Partner with us",
        },
      };
    }

    if (type === "text") {
      return {
        id,
        type: "text",
        data: {
          title: "Section title…",
          body: "Write your paragraph here…",
        },
      };
    }

    if (type === "divider") {
      return { id, type: "divider", data: {} };
    }

    if (type === "spacer") {
      return { id, type: "spacer", data: { height: 48 } };
    }

    return { id, type: "text", data: { title: "Section", body: "" } };
  };

  const addSection = async (type) => {
    const current = [...sections, makeSection(type)];
    try {
      await saveSections(current);
      toast.success("Section added");
    } catch (e) {
      console.error(e);
      toast.error("Add section failed");
    }
  };

  // ---------- UI helpers ----------
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const iconForIndex = (i) => [Globe, Users, Smartphone][i] || Globe;

  const AdminAddBar = () => {
    if (!isAdmin) return null;

    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-6">
        <div
          className="rounded-3xl border p-4 flex flex-wrap gap-2 items-center"
          style={{
            borderColor: "rgba(15,30,36,0.12)",
            backgroundColor: "rgba(250,251,249,0.85)",
          }}
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl"
            style={{ color: "var(--epsy-charcoal)" }}
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-semibold">Add section</span>
          </div>

          <Button className="rounded-2xl" variant="outline" onClick={() => addSection("hero")}>
            Add Hero
          </Button>

          <Button className="rounded-2xl" variant="outline" onClick={() => addSection("what")}>
            Add What We Do
          </Button>

          <Button className="rounded-2xl" variant="outline" onClick={() => addSection("text")}>
            <Type className="h-4 w-4 mr-2" />
            Add Text
          </Button>

          <Button className="rounded-2xl" variant="outline" onClick={() => addSection("divider")}>
            <Minus className="h-4 w-4 mr-2" />
            Add Divider
          </Button>

          <Button className="rounded-2xl" variant="outline" onClick={() => addSection("spacer")}>
            Add Spacer
          </Button>
        </div>
      </div>
    );
  };

  const SectionControls = ({ section }) => {
    if (!isAdmin) return null;

    return (
      <div className="flex items-center justify-end gap-2 mb-3">
        {/* Drag handle */}
        <div
          className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border cursor-grab active:cursor-grabbing"
          draggable
          onDragStart={() => onDragStart(section.id)}
          style={{
            borderColor: "rgba(15,30,36,0.12)",
            backgroundColor: "rgba(250,251,249,0.85)",
            color: "var(--epsy-charcoal)",
          }}
          title="Drag to move section"
        >
          <GripVertical className="h-4 w-4" />
          <span className="text-xs font-medium">Drag</span>
        </div>

        <Button
          variant="outline"
          className="rounded-2xl"
          onClick={() => duplicateSection(section.id)}
          title="Duplicate section"
        >
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </Button>

        <Button
          variant="destructive"
          className="rounded-2xl"
          onClick={() => deleteSection(section.id)}
          title="Delete section"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    );
  };

  // ---------- Section render ----------
  const renderSection = (section) => {
    if (section.type === "hero") {
      const d = section.data || {};
      const heroTitle =
        d.hero_title ?? "Building resilience through everyday psychology.";
      const heroSubtitle =
        d.hero_subtitle ??
        "Epsy helps students and communities understand the mind, strengthen coping skills, and grow practical emotional resilience.";
      const primaryText = d.hero_cta_primary_text ?? "Learn more";
      const secondaryText = d.hero_cta_secondary_text ?? "Contact us";

      return (
        <div
          onDragOver={(e) => isAdmin && e.preventDefault()}
          onDrop={() => isAdmin && onDropOn(section.id)}
        >
          <SectionControls section={section} />

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
                <motion.div {...fadeInUp}>
                  <InlineText
                    enabled={isAdmin}
                    as="h1"
                    value={heroTitle}
                    onSave={(v) => saveSectionField(section.id, "hero_title", v)}
                    className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight"
                    style={{
                      color: settings?.hero_background_url
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
                      color: settings?.hero_background_url
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
                        borderColor: "var(--epsy-sky-blue)",
                        color: "var(--epsy-sky-blue)",
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

    if (section.type === "what") {
      const d = section.data || {};
      const whatTitle = d.what_title ?? "What we do";
      const whatSubtitle =
        d.what_subtitle ??
        "We combine accessible psychology education with practical tools designed for real life.";
      const cards = Array.isArray(d.cards) ? d.cards : [];
      const partnerText = d.partner_button_text ?? "Partner with us";

      return (
        <div
          onDragOver={(e) => isAdmin && e.preventDefault()}
          onDrop={() => isAdmin && onDropOn(section.id)}
        >
          <SectionControls section={section} />

          <section className="py-24 lg:py-32" style={{ backgroundColor: "white" }}>
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <InlineText
                  enabled={isAdmin}
                  as="h2"
                  value={whatTitle}
                  onSave={(v) => saveSectionField(section.id, "what_title", v)}
                  className="text-3xl lg:text-4xl font-bold mb-4"
                  style={{ color: "var(--epsy-charcoal)" }}
                />
                <InlineText
                  enabled={isAdmin}
                  as="p"
                  value={whatSubtitle}
                  onSave={(v) => saveSectionField(section.id, "what_subtitle", v)}
                  className="text-lg leading-relaxed"
                  style={{ color: "var(--epsy-slate-blue)" }}
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
                        onSave={(v) => saveCardField(section.id, idx, "title", v)}
                        className="text-xl font-semibold mb-3"
                        style={{ color: "var(--epsy-charcoal)" }}
                      />

                      <InlineText
                        enabled={isAdmin}
                        as="p"
                        value={item.description}
                        onSave={(v) => saveCardField(section.id, idx, "description", v)}
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
                    style={{ backgroundColor: "var(--epsy-charcoal)", color: "white" }}
                  >
                    <InlineText
                      enabled={isAdmin}
                      as="span"
                      value={partnerText}
                      onSave={(v) => saveSectionField(section.id, "partner_button_text", v)}
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

    if (section.type === "text") {
      const d = section.data || {};
      const title = d.title ?? "Section title…";
      const body = d.body ?? "Write your paragraph here…";

      return (
        <div
          onDragOver={(e) => isAdmin && e.preventDefault()}
          onDrop={() => isAdmin && onDropOn(section.id)}
        >
          <SectionControls section={section} />

          <section className="py-16 lg:py-24" style={{ backgroundColor: "white" }}>
            <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
              <InlineText
                enabled={isAdmin}
                as="h2"
                value={title}
                onSave={(v) => saveSectionField(section.id, "title", v)}
                className="text-3xl lg:text-4xl font-bold mb-6"
                style={{ color: "var(--epsy-charcoal)" }}
              />
              <InlineText
                enabled={isAdmin}
                as="p"
                value={body}
                onSave={(v) => saveSectionField(section.id, "body", v)}
                className="text-lg leading-relaxed"
                style={{ color: "var(--epsy-slate-blue)" }}
              />
            </div>
          </section>
        </div>
      );
    }

    if (section.type === "divider") {
      return (
        <div
          onDragOver={(e) => isAdmin && e.preventDefault()}
          onDrop={() => isAdmin && onDropOn(section.id)}
        >
          <SectionControls section={section} />
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
            <div
              className="h-px w-full"
              style={{ backgroundColor: "rgba(15,30,36,0.10)" }}
            />
          </div>
        </div>
      );
    }

    if (section.type === "spacer") {
      const h = Number(section.data?.height ?? 48);
      return (
        <div
          onDragOver={(e) => isAdmin && e.preventDefault()}
          onDrop={() => isAdmin && onDropOn(section.id)}
        >
          <SectionControls section={section} />
          <div style={{ height: Math.max(12, Math.min(h, 240)) }} />
        </div>
      );
    }

    // Unknown fallback
    return (
      <div
        onDragOver={(e) => isAdmin && e.preventDefault()}
        onDrop={() => isAdmin && onDropOn(section.id)}
        className="max-w-7xl mx-auto px-6 lg:px-12 py-10"
      >
        <SectionControls section={section} />
        <div
          className="rounded-3xl border p-6"
          style={{ borderColor: "rgba(15,30,36,0.12)" }}
        >
          <div className="font-semibold" style={{ color: "var(--epsy-charcoal)" }}>
            Unknown section type
          </div>
          <div className="text-sm" style={{ color: "var(--epsy-slate-blue)" }}>
            type: {section.type}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Admin login bar (only when ?admin=1) */}
      <AdminBar
        show={showAdmin}
        redirectPathWithAdmin="/?admin=1"
        adminEmail={ADMIN_EMAIL}
      />

      {/* Always-visible admin add bar */}
      <AdminAddBar />

      {/* Render sections in stored order */}
      {sections.map((section) => (
        <div key={section.id}>{renderSection(section)}</div>
      ))}
    </div>
  );
}