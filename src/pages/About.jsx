import React, { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Eye,
  BookOpen,
  GripVertical,
  Copy,
  Trash2,
  Plus,
  Minus,
  Type,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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

/**
 * ABOUT SECTIONS MODEL (stored in Supabase under about.sections):
 * [
 *  { id, type: "header", data: {...} },
 *  { id, type: "vision_mission", data: {...} },
 *  { id, type: "story", data: {...} },
 *  { id, type: "motto", data: {...} },
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

  // Defaults
  const oldView = {
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

  // Sections
  const sections = useMemo(() => {
    const s = aboutContent.sections;
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
        id: "vision_mission",
        type: "vision_mission",
        data: {
          vision_title: oldView.vision_title,
          vision_text: oldView.vision_text,
          mission_title: oldView.mission_title,
          mission_text: oldView.mission_text,
          background_type: "none",
          background_color: "",
          background_image: "",
          background_overlay: 0.35,
        },
      },
      {
        id: "story",
        type: "story",
        data: {
          story_title: oldView.story_title,
          story_p1: oldView.story_p1,
          story_p2: oldView.story_p2,
          background_type: "color",
          background_color: "var(--epsy-off-white)",
          background_image: "",
          background_overlay: 0.35,
        },
      },
      {
        id: "motto",
        type: "motto",
        data: {
          motto_title: oldView.motto_title,
          motto_text: oldView.motto_text,
          background_type: "none",
          background_color: "",
          background_image: "",
          background_overlay: 0.35,
        },
      },
    ];
  }, [aboutContent.sections, oldView]);

  // Save helpers
  const saveSections = async (nextSections) => {
    const next = { ...aboutContent, sections: nextSections };
    await updateSiteContent("about", next);
    queryClient.invalidateQueries({ queryKey: ["siteContent", "about"] });
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

  // Drag & drop
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

  // Duplicate / Delete
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

  // Add section
  const makeSection = (type) => {
    const id = `${type}_${Date.now()}`;

    if (type === "header") {
      return {
        id,
        type: "header",
        data: {
          header_title: "Header title…",
          header_subtitle: "Header subtitle…",
          background_type: "color",
          background_color: "var(--epsy-off-white)",
          background_image: "",
          background_overlay: 0.35,
        },
      };
    }

    if (type === "vision_mission") {
      return {
        id,
        type: "vision_mission",
        data: {
          vision_title: "Vision",
          vision_text: "Vision text…",
          mission_title: "Mission",
          mission_text: "Mission text…",
          background_type: "none",
          background_color: "",
          background_image: "",
          background_overlay: 0.35,
        },
      };
    }

    if (type === "story") {
      return {
        id,
        type: "story",
        data: {
          story_title: "Our Story",
          story_p1: "Paragraph 1…",
          story_p2: "Paragraph 2…",
          background_type: "color",
          background_color: "var(--epsy-off-white)",
          background_image: "",
          background_overlay: 0.35,
        },
      };
    }

    if (type === "motto") {
      return {
        id,
        type: "motto",
        data: {
          motto_title: `"It's All About Mentality."`,
          motto_text: "Motto explanation…",
          background_type: "none",
          background_color: "",
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

  // Animation helper
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
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
          <div
            className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl"
            style={{ color: "var(--epsy-charcoal)" }}
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-semibold">Add section</span>
          </div>

          <Button className="rounded-2xl" variant="outline" onClick={() => addSection("header")}>
            Add Header
          </Button>
          <Button className="rounded-2xl" variant="outline" onClick={() => addSection("vision_mission")}>
            Add Vision/Mission
          </Button>
          <Button className="rounded-2xl" variant="outline" onClick={() => addSection("story")}>
            Add Story
          </Button>
          <Button className="rounded-2xl" variant="outline" onClick={() => addSection("motto")}>
            Add Motto
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

  // Render section types
  const renderSection = (section) => {
    const bgData = getSectionBackgroundData(section);
    const bgStyle = getSectionBackgroundStyle(section);

    if (section.type === "header") {
      const d = section.data || {};
      const title = d.header_title ?? "Who We Are";
      const subtitle =
        d.header_subtitle ??
        "Epsy is a non-profit organisation focused on psychological awareness and resilience.";

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

    if (section.type === "vision_mission") {
      const d = section.data || {};
      const visionTitle = d.vision_title ?? "Vision";
      const visionText = d.vision_text ?? "To instill psychological resilience.";
      const missionTitle = d.mission_title ?? "Mission";
      const missionText = d.mission_text ?? "To raise psychological awareness.";

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
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div
                  {...fadeInUp}
                  className="p-10 rounded-2xl"
                  style={{
                    backgroundColor:
                      bgData.backgroundType === "image"
                        ? "rgba(250,251,249,0.92)"
                        : "var(--epsy-off-white)",
                  }}
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
                    value={visionTitle}
                    onSave={(v) => saveSectionField(section.id, "vision_title", v)}
                    className="text-2xl font-bold mb-4"
                    style={{ color: "var(--epsy-charcoal)" }}
                  />

                  <InlineText
                    enabled={isAdmin}
                    as="p"
                    multiLine
                    value={visionText}
                    onSave={(v) => saveSectionField(section.id, "vision_text", v)}
                    className="text-lg leading-relaxed"
                    style={{ color: "var(--epsy-slate-blue)" }}
                  />
                </motion.div>

                <motion.div
                  {...fadeInUp}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="p-10 rounded-2xl"
                  style={{
                    backgroundColor:
                      bgData.backgroundType === "image"
                        ? "rgba(250,251,249,0.92)"
                        : "var(--epsy-off-white)",
                  }}
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
                    value={missionTitle}
                    onSave={(v) => saveSectionField(section.id, "mission_title", v)}
                    className="text-2xl font-bold mb-4"
                    style={{ color: "var(--epsy-charcoal)" }}
                  />

                  <InlineText
                    enabled={isAdmin}
                    as="p"
                    multiLine
                    value={missionText}
                    onSave={(v) => saveSectionField(section.id, "mission_text", v)}
                    className="text-lg leading-relaxed"
                    style={{ color: "var(--epsy-slate-blue)" }}
                  />
                </motion.div>
              </div>
            </div>
          </section>
        </div>
      );
    }

    if (section.type === "story") {
      const d = section.data || {};
      const storyTitle = d.story_title ?? "Our Story";
      const p1 = d.story_p1 ?? "Paragraph 1…";
      const p2 = d.story_p2 ?? "Paragraph 2…";

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

            <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10">
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
                  value={storyTitle}
                  onSave={(v) => saveSectionField(section.id, "story_title", v)}
                  className="text-3xl lg:text-4xl font-bold mb-8 text-center"
                  style={{
                    color:
                      bgData.backgroundType === "image"
                        ? "white"
                        : "var(--epsy-charcoal)",
                  }}
                />

                <div
                  className="space-y-6 text-lg leading-relaxed"
                  style={{
                    color:
                      bgData.backgroundType === "image"
                        ? "rgba(255,255,255,0.9)"
                        : "var(--epsy-slate-blue)",
                  }}
                >
                  <InlineText
                    enabled={isAdmin}
                    as="p"
                    multiLine
                    value={p1}
                    onSave={(v) => saveSectionField(section.id, "story_p1", v)}
                    style={{
                      color:
                        bgData.backgroundType === "image"
                          ? "rgba(255,255,255,0.9)"
                          : "var(--epsy-slate-blue)",
                    }}
                  />

                  <InlineText
                    enabled={isAdmin}
                    as="p"
                    multiLine
                    value={p2}
                    onSave={(v) => saveSectionField(section.id, "story_p2", v)}
                    style={{
                      color:
                        bgData.backgroundType === "image"
                          ? "rgba(255,255,255,0.9)"
                          : "var(--epsy-slate-blue)",
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      );
    }

    if (section.type === "motto") {
      const d = section.data || {};
      const title = d.motto_title ?? `"It's All About Mentality."`;
      const text = d.motto_text ?? "Motto explanation…";

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

            <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10">
              <motion.div {...fadeInUp} className="text-center">
                <InlineText
                  enabled={isAdmin}
                  as="h2"
                  value={title}
                  onSave={(v) => saveSectionField(section.id, "motto_title", v)}
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
                  value={text}
                  onSave={(v) => saveSectionField(section.id, "motto_text", v)}
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
        redirectPathWithAdmin="/about?admin=1"
        adminEmail={ADMIN_EMAIL}
      />

      {isAdmin && (
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
            <Button className="rounded-2xl" variant="outline" onClick={() => addSection("vision_mission")}>
              Add Vision/Mission
            </Button>
            <Button className="rounded-2xl" variant="outline" onClick={() => addSection("story")}>
              Add Story
            </Button>
            <Button className="rounded-2xl" variant="outline" onClick={() => addSection("motto")}>
              Add Motto
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
      )}

      {sections.map((section) => (
        <div key={section.id}>{renderSection(section)}</div>
      ))}
    </div>
  );
}