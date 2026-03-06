import React, { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  School,
  Users,
  Heart,
  GripVertical,
  Copy,
  Trash2,
  Plus,
  Minus,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabaseClient";
import { getSiteContent, updateSiteContent } from "@/lib/siteContentApi";

import AdminBar from "@/components/admin/AdminBar";
import InlineText from "@/components/admin/InlineText";
import SectionBackgroundControls from "@/components/admin/SectionBackgroundControls";
import {
  getSectionBackgroundData,
  getSectionBackgroundStyle,
} from "@/components/admin/sectionBackground";

/**
 * PARTNERSHIPS SECTIONS MODEL (stored in Supabase under partnerships.sections):
 * [
 *  { id, type: "header", data: { header_title, header_subtitle } },
 *  { id, type: "partner_cards", data: { section_title, cards:[{id,title,description,icon}] } },
 *  { id, type: "donation", data: { donate_title, donate_button_text, donate_button_link, donate_note } },
 *  { id, type: "text", data: { title, body } },
 *  { id, type: "divider", data: {} },
 *  { id, type: "spacer", data: { height } }
 * ]
 *
 * Background fields per section:
 * - background_type: "none" | "color" | "image"
 * - background_color
 * - background_image
 * - background_overlay
 */

export default function Partnerships() {
  const queryClient = useQueryClient();

  const showAdmin = useMemo(() => {
    return new URLSearchParams(window.location.search).get("admin") === "1";
  }, []);

  const ADMIN_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || "ayabulelaplatana126@gmail.com";

  const { data: pageContent = {} } = useQuery({
    queryKey: ["siteContent", "partnerships"],
    queryFn: async () => await getSiteContent("partnerships"),
  });

  const { data: session } = useQuery({
    queryKey: ["authSession"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: 1000 * 10,
  });

  const isAdmin =
    showAdmin &&
    session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const defaultPartnerTypes = [
    {
      id: "schools",
      icon: "school",
      title: "Schools",
      description:
        "Partner with us to bring psychological resilience training directly to your students.",
    },
    {
      id: "youth_orgs",
      icon: "users",
      title: "Youth Development Organisations",
      description:
        "Join forces with organisations aligned with youth development and mental wellness.",
    },
    {
      id: "supporters",
      icon: "heart",
      title: "Individual Supporters",
      description:
        "Support the mission through donations or volunteer your expertise.",
    },
  ];

  const oldView = {
    header_title: pageContent.header_title ?? "Partner With Epsy",
    header_subtitle:
      pageContent.header_subtitle ??
      "We partner with schools, organisations, and individuals who believe in the goal Epsy is working toward — helping students strengthen their mentality and prepare for life mentally before life challenges them outwardly.",
    section_title: pageContent.section_title ?? "Partnership Opportunities",
    partner_types:
      Array.isArray(pageContent.partner_types) && pageContent.partner_types.length
        ? pageContent.partner_types.map((p, i) => ({
            id: p.key || `card_${i}`,
            icon: ["school", "users", "heart"][i] || "school",
            title: p.title ?? "",
            description: p.description ?? "",
          }))
        : defaultPartnerTypes,
    donate_title: pageContent.donate_title ?? "Support the Mission",
    donate_button_text: pageContent.donate_button_text ?? "Donate Now",
    donate_button_link: pageContent.donate_button_link ?? "#",
    donate_note:
      pageContent.donate_note ??
      "Your donation supports the development of EpsyApp, the creation of structured psychological learning resources, and outreach to more schools.",
  };

  const sections = useMemo(() => {
    const s = pageContent.sections;
    if (Array.isArray(s) && s.length) return s;

    return [
      {
        id: "header",
        type: "header",
        data: {
          header_title: oldView.header_title,
          header_subtitle: oldView.header_subtitle,
          background_type: "color",
          background_color: "var(--epsy-off-white)",
          background_image: "",
          background_overlay: 0.35,
        },
      },
      {
        id: "partner_cards",
        type: "partner_cards",
        data: {
          section_title: oldView.section_title,
          cards: oldView.partner_types,
          background_type: "none",
          background_color: "",
          background_image: "",
          background_overlay: 0.35,
        },
      },
      {
        id: "donation",
        type: "donation",
        data: {
          donate_title: oldView.donate_title,
          donate_button_text: oldView.donate_button_text,
          donate_button_link: oldView.donate_button_link,
          donate_note: oldView.donate_note,
          background_type: "color",
          background_color: "var(--epsy-off-white)",
          background_image: "",
          background_overlay: 0.35,
        },
      },
    ];
  }, [pageContent.sections, oldView]);

  const saveSections = async (nextSections) => {
    const next = { ...pageContent, sections: nextSections };
    await updateSiteContent("partnerships", next);
    queryClient.invalidateQueries({ queryKey: ["siteContent", "partnerships"] });
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

    if (cloned.type === "partner_cards") {
      const cards = Array.isArray(cloned.data?.cards) ? cloned.data.cards : [];
      cloned.data.cards = cards.map((c) => ({
        ...c,
        id: `${c.id || "card"}_${Date.now()}_${Math.random()
          .toString(16)
          .slice(2)}`,
      }));
    }

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

  const makeSection = (type) => {
    const id = `${type}_${Date.now()}`;

    if (type === "header") {
      return {
        id,
        type: "header",
        data: {
          header_title: "Partner With Epsy",
          header_subtitle: "Write a subtitle here…",
          background_type: "color",
          background_color: "var(--epsy-off-white)",
          background_image: "",
          background_overlay: 0.35,
        },
      };
    }

    if (type === "partner_cards") {
      return {
        id,
        type: "partner_cards",
        data: {
          section_title: "Partnership Opportunities",
          cards: [
            {
              id: `card_${Date.now()}_1`,
              icon: "school",
              title: "Schools",
              description: "Describe this partnership type…",
            },
            {
              id: `card_${Date.now()}_2`,
              icon: "users",
              title: "Organisations",
              description: "Describe this partnership type…",
            },
          ],
          background_type: "none",
          background_color: "",
          background_image: "",
          background_overlay: 0.35,
        },
      };
    }

    if (type === "donation") {
      return {
        id,
        type: "donation",
        data: {
          donate_title: "Support the Mission",
          donate_button_text: "Donate Now",
          donate_button_link: "#",
          donate_note: "Write a short note about what donations support…",
          background_type: "color",
          background_color: "var(--epsy-off-white)",
          background_image: "",
          background_overlay: 0.35,
        },
      };
    }

    if (type === "text") {
      return {
        id,
        type: "text",
        data: {
          title: "Section title…",
          body: "Write your text here…",
          background_type: "none",
          background_color: "",
          background_image: "",
          background_overlay: 0.35,
        },
      };
    }

    if (type === "divider") {
      return {
        id,
        type: "divider",
        data: {
          background_type: "none",
          background_color: "",
          background_image: "",
          background_overlay: 0.35,
        },
      };
    }

    if (type === "spacer") {
      return {
        id,
        type: "spacer",
        data: {
          height: 48,
          background_type: "none",
          background_color: "",
          background_image: "",
          background_overlay: 0.35,
        },
      };
    }

    return {
      id,
      type: "text",
      data: {
        title: "Section",
        body: "",
        background_type: "none",
        background_color: "",
        background_image: "",
        background_overlay: 0.35,
      },
    };
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

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const SectionControls = ({ section }) => {
    if (!isAdmin) return null;

    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-6">
        <div className="flex items-center justify-end gap-2">
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
      </div>
    );
  };

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
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl" style={{ color: "var(--epsy-charcoal)" }}>
            <Plus className="h-4 w-4" />
            <span className="text-sm font-semibold">Add section</span>
          </div>

          <Button className="rounded-2xl" variant="outline" onClick={() => addSection("header")}>
            Add Header
          </Button>

          <Button className="rounded-2xl" variant="outline" onClick={() => addSection("partner_cards")}>
            Add Partner Cards
          </Button>

          <Button className="rounded-2xl" variant="outline" onClick={() => addSection("donation")}>
            Add Donation
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

  const iconFromName = (name) => {
    if (name === "users") return Users;
    if (name === "heart") return Heart;
    return School;
  };

  const updatePartnerCard = async (sectionId, cardId, patch) => {
    const nextSections = sections.map((s) => {
      if (s.id !== sectionId) return s;
      const cards = Array.isArray(s.data?.cards) ? s.data.cards : [];
      return {
        ...s,
        data: {
          ...s.data,
          cards: cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c)),
        },
      };
    });
    await saveSections(nextSections);
  };

  const addPartnerCard = async (sectionId) => {
    const nextSections = sections.map((s) => {
      if (s.id !== sectionId) return s;
      const cards = Array.isArray(s.data?.cards) ? s.data.cards : [];
      return {
        ...s,
        data: {
          ...s.data,
          cards: [
            ...cards,
            {
              id: `card_${Date.now()}_${Math.random().toString(16).slice(2)}`,
              icon: "school",
              title: "New card",
              description: "Describe this partnership type…",
            },
          ],
        },
      };
    });
    await saveSections(nextSections);
    toast.success("Card added");
  };

  const deletePartnerCard = async (sectionId, cardId) => {
    const nextSections = sections.map((s) => {
      if (s.id !== sectionId) return s;
      const cards = Array.isArray(s.data?.cards) ? s.data.cards : [];
      return { ...s, data: { ...s.data, cards: cards.filter((c) => c.id !== cardId) } };
    });
    await saveSections(nextSections);
    toast.success("Card deleted");
  };

  const renderSection = (section) => {
    const bgData = getSectionBackgroundData(section);
    const bgStyle = getSectionBackgroundStyle(section);

    if (section.type === "header") {
      const d = section.data || {};
      const title = d.header_title ?? "Partner With Epsy";
      const subtitle = d.header_subtitle ?? "";

      return (
        <div onDragOver={(e) => isAdmin && e.preventDefault()} onDrop={() => isAdmin && onDropOn(section.id)}>
          <SectionControls section={section} />
          <SectionBackgroundControls
            section={section}
            isAdmin={isAdmin}
            onChange={(patch) => updateSectionData(section.id, patch)}
          />

          <section
            className="py-20 lg:py-28 relative overflow-hidden"
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

            <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center relative z-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <InlineText
                  enabled={isAdmin}
                  as="h1"
                  value={title}
                  onSave={(v) => saveSectionField(section.id, "header_title", v)}
                  className="text-4xl lg:text-5xl font-bold mb-6"
                  style={{
                    color:
                      bgData.backgroundType === "image"
                        ? "white"
                        : "var(--epsy-charcoal)",
                  }}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}>
                <InlineText
                  enabled={isAdmin}
                  as="p"
                  multiLine
                  value={subtitle}
                  onSave={(v) => saveSectionField(section.id, "header_subtitle", v)}
                  className="text-lg leading-relaxed"
                  style={{
                    color:
                      bgData.backgroundType === "image"
                        ? "rgba(255,255,255,0.9)"
                        : "var(--epsy-slate-blue)",
                  }}
                />
              </motion.div>
            </div>
          </section>
        </div>
      );
    }

    if (section.type === "partner_cards") {
      const d = section.data || {};
      const sectionTitle = d.section_title ?? "Partnership Opportunities";
      const cards = Array.isArray(d.cards) ? d.cards : [];

      return (
        <div onDragOver={(e) => isAdmin && e.preventDefault()} onDrop={() => isAdmin && onDropOn(section.id)}>
          <SectionControls section={section} />
          <SectionBackgroundControls
            section={section}
            isAdmin={isAdmin}
            onChange={(patch) => updateSectionData(section.id, patch)}
          />

          <section
            className="py-16 lg:py-24 relative overflow-hidden"
            style={
              bgData.backgroundType === "color"
                ? bgStyle
                : bgData.backgroundType === "none"
                ? {}
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

            <div className="max-w-6xl mx-auto px-6 lg:px-12 relative z-10">
              <motion.div {...fadeInUp} className="text-center">
                <InlineText
                  enabled={isAdmin}
                  as="h2"
                  value={sectionTitle}
                  onSave={(v) => saveSectionField(section.id, "section_title", v)}
                  className="text-3xl font-bold mb-12"
                  style={{
                    color:
                      bgData.backgroundType === "image"
                        ? "white"
                        : "var(--epsy-charcoal)",
                  }}
                />
              </motion.div>

              {isAdmin && (
                <div className="flex justify-center pb-6">
                  <Button className="rounded-2xl" variant="outline" onClick={() => addPartnerCard(section.id)}>
                    <Plus className="h-4 w-4 mr-2" /> Add card
                  </Button>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {cards.map((card, index) => {
                  const Icon = iconFromName(card.icon);

                  return (
                    <motion.div
                      key={card.id || index}
                      {...fadeInUp}
                      transition={{ delay: index * 0.08, duration: 0.6 }}
                      className="p-8 rounded-2xl"
                      style={{
                        backgroundColor:
                          bgData.backgroundType === "image"
                            ? "rgba(250,251,249,0.92)"
                            : "var(--epsy-off-white)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                          style={{ backgroundColor: "var(--epsy-sky-blue)" }}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>

                        {isAdmin && (
                          <Button
                            size="icon"
                            variant="destructive"
                            className="rounded-2xl"
                            onClick={() => deletePartnerCard(section.id, card.id)}
                            title="Delete card"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <InlineText
                        enabled={isAdmin}
                        as="h3"
                        value={card.title ?? ""}
                        onSave={(v) => updatePartnerCard(section.id, card.id, { title: v })}
                        className="text-xl font-semibold mb-2"
                        style={{ color: "var(--epsy-charcoal)" }}
                      />

                      <InlineText
                        enabled={isAdmin}
                        as="p"
                        multiLine
                        value={card.description ?? ""}
                        onSave={(v) => updatePartnerCard(section.id, card.id, { description: v })}
                        className="leading-relaxed"
                        style={{ color: "var(--epsy-slate-blue)" }}
                      />

                      {isAdmin && (
                        <div className="pt-4">
                          <div className="text-xs mb-1" style={{ color: "rgba(15,30,36,0.60)" }}>
                            Icon name (school / users / heart)
                          </div>
                          <InlineText
                            enabled={isAdmin}
                            as="div"
                            value={card.icon ?? "school"}
                            onSave={(v) => updatePartnerCard(section.id, card.id, { icon: (v || "school").trim().toLowerCase() })}
                            className="text-sm px-3 py-2 rounded-xl border"
                            style={{ borderColor: "rgba(15,30,36,0.12)", color: "var(--epsy-slate-blue)" }}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      );
    }

    if (section.type === "donation") {
      const d = section.data || {};
      const donateTitle = d.donate_title ?? "Support the Mission";
      const donateText = d.donate_button_text ?? "Donate Now";
      const donateLink = d.donate_button_link ?? "#";
      const donateNote = d.donate_note ?? "";

      return (
        <div onDragOver={(e) => isAdmin && e.preventDefault()} onDrop={() => isAdmin && onDropOn(section.id)}>
          <SectionControls section={section} />
          <SectionBackgroundControls
            section={section}
            isAdmin={isAdmin}
            onChange={(patch) => updateSectionData(section.id, patch)}
          />

          <section
            className="py-16 lg:py-24 relative overflow-hidden"
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

            <div className="max-w-2xl mx-auto px-6 lg:px-12 text-center relative z-10">
              <motion.div {...fadeInUp} className="space-y-8">
                <InlineText
                  enabled={isAdmin}
                  as="h2"
                  value={donateTitle}
                  onSave={(v) => saveSectionField(section.id, "donate_title", v)}
                  className="text-3xl lg:text-4xl font-bold"
                  style={{
                    color:
                      bgData.backgroundType === "image"
                        ? "white"
                        : "var(--epsy-charcoal)",
                  }}
                />

                <div className="flex flex-col items-center gap-3">
                  <Button
                    size="lg"
                    className="text-white font-medium px-12 py-6 rounded-xl transition-all duration-300 hover:shadow-lg text-base"
                    style={{ backgroundColor: "var(--epsy-sky-blue)" }}
                    onClick={() => window.open(donateLink, "_blank")}
                  >
                    {donateText}
                  </Button>

                  {isAdmin && (
                    <div className="w-full max-w-xl mx-auto text-left grid gap-2">
                      <div
                        className="text-sm font-semibold"
                        style={{
                          color:
                            bgData.backgroundType === "image"
                              ? "white"
                              : "var(--epsy-charcoal)",
                        }}
                      >
                        Donation button
                      </div>

                      <InlineText
                        enabled={isAdmin}
                        as="div"
                        value={donateText}
                        onSave={(v) => saveSectionField(section.id, "donate_button_text", v)}
                        className="text-sm px-3 py-2 rounded-xl border"
                        style={{
                          borderColor: "rgba(15,30,36,0.12)",
                          color:
                            bgData.backgroundType === "image"
                              ? "rgba(255,255,255,0.92)"
                              : "var(--epsy-slate-blue)",
                        }}
                      />

                      <InlineText
                        enabled={isAdmin}
                        as="div"
                        value={donateLink}
                        onSave={(v) => saveSectionField(section.id, "donate_button_link", v)}
                        className="text-sm px-3 py-2 rounded-xl border"
                        style={{
                          borderColor: "rgba(15,30,36,0.12)",
                          color:
                            bgData.backgroundType === "image"
                              ? "rgba(255,255,255,0.92)"
                              : "var(--epsy-slate-blue)",
                        }}
                      />
                      <div
                        className="text-xs"
                        style={{
                          color:
                            bgData.backgroundType === "image"
                              ? "rgba(255,255,255,0.8)"
                              : "var(--epsy-slate-blue)",
                        }}
                      >
                        Tip: paste a full link like https://paystack.com/... or https://yourbanklink...
                      </div>
                    </div>
                  )}
                </div>

                <InlineText
                  enabled={isAdmin}
                  as="p"
                  multiLine
                  value={donateNote}
                  onSave={(v) => saveSectionField(section.id, "donate_note", v)}
                  className="text-sm leading-relaxed max-w-xl mx-auto"
                  style={{
                    color:
                      bgData.backgroundType === "image"
                        ? "rgba(255,255,255,0.9)"
                        : "var(--epsy-slate-blue)",
                  }}
                />
              </motion.div>
            </div>
          </section>
        </div>
      );
    }

    if (section.type === "text") {
      const d = section.data || {};
      const title = d.title ?? "Section title…";
      const body = d.body ?? "Write your text here…";

      return (
        <div onDragOver={(e) => isAdmin && e.preventDefault()} onDrop={() => isAdmin && onDropOn(section.id)}>
          <SectionControls section={section} />
          <SectionBackgroundControls
            section={section}
            isAdmin={isAdmin}
            onChange={(patch) => updateSectionData(section.id, patch)}
          />

          <section
            className="py-16 lg:py-24 relative overflow-hidden"
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
              <InlineText
                enabled={isAdmin}
                as="h2"
                value={title}
                onSave={(v) => saveSectionField(section.id, "title", v)}
                className="text-3xl lg:text-4xl font-bold mb-6"
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
                multiLine
                value={body}
                onSave={(v) => saveSectionField(section.id, "body", v)}
                className="text-lg leading-relaxed"
                style={{
                  color:
                    bgData.backgroundType === "image"
                      ? "rgba(255,255,255,0.9)"
                      : "var(--epsy-slate-blue)",
                }}
              />
            </div>
          </section>
        </div>
      );
    }

    if (section.type === "divider") {
      return (
        <div onDragOver={(e) => isAdmin && e.preventDefault()} onDrop={() => isAdmin && onDropOn(section.id)}>
          <SectionControls section={section} />
          <SectionBackgroundControls
            section={section}
            isAdmin={isAdmin}
            onChange={(patch) => updateSectionData(section.id, patch)}
          />

          <div
            className="max-w-7xl mx-auto px-6 lg:px-12 py-6 relative overflow-hidden"
            style={bgData.backgroundType === "color" ? bgStyle : {}}
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
            <div className="relative z-10">
              <div
                className="h-px w-full"
                style={{
                  backgroundColor:
                    bgData.backgroundType === "image"
                      ? "rgba(255,255,255,0.35)"
                      : "rgba(15,30,36,0.10)",
                }}
              />
            </div>
          </div>
        </div>
      );
    }

    if (section.type === "spacer") {
      const h = Number(section.data?.height ?? 48);
      return (
        <div onDragOver={(e) => isAdmin && e.preventDefault()} onDrop={() => isAdmin && onDropOn(section.id)}>
          <SectionControls section={section} />
          <SectionBackgroundControls
            section={section}
            isAdmin={isAdmin}
            onChange={(patch) => updateSectionData(section.id, patch)}
          />

          <div
            className="relative overflow-hidden"
            style={
              bgData.backgroundType === "color"
                ? { ...bgStyle, height: Math.max(12, Math.min(h, 240)) }
                : { height: Math.max(12, Math.min(h, 240)) }
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
          </div>
        </div>
      );
    }

    return (
      <div onDragOver={(e) => isAdmin && e.preventDefault()} onDrop={() => isAdmin && onDropOn(section.id)}>
        <SectionControls section={section} />
        <SectionBackgroundControls
          section={section}
          isAdmin={isAdmin}
          onChange={(patch) => updateSectionData(section.id, patch)}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
          <div className="rounded-3xl border p-6" style={{ borderColor: "rgba(15,30,36,0.12)" }}>
            <div className="font-semibold" style={{ color: "var(--epsy-charcoal)" }}>
              Unknown section type
            </div>
            <div className="text-sm" style={{ color: "var(--epsy-slate-blue)" }}>
              type: {section.type}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <AdminBar
        show={showAdmin}
        redirectPathWithAdmin="/partnerships?admin=1"
        adminEmail={ADMIN_EMAIL}
      />

      <AdminAddBar />

      {sections.map((section) => (
        <div key={section.id}>{renderSection(section)}</div>
      ))}
    </div>
  );
}