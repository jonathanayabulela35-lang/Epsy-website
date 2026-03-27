import React, { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Eye,
  BookOpen,
  GripVertical,
  Copy,
  Trash2,
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

export default function About() {
  const queryClient = useQueryClient();
  const dragIdRef = useRef(null);

  const showAdmin = useMemo(
    () => new URLSearchParams(window.location.search).get("admin") === "1",
    []
  );

  const ADMIN_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || "ayabulelaplatana126@gmail.com";

  const { data: aboutContent = {} } = useQuery({
    queryKey: ["siteContent", "about"],
    queryFn: async () => await getSiteContent("about"),
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

  // --- Section Save / Update ---
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

  // --- Drag & Drop ---
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

  // --- Section Actions ---
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

  const makeSection = (type) => {
    const id = `${type}_${Date.now()}`;
    const base = {
      id,
      type,
      data: { background_type: "none", background_color: "", background_image: "", background_overlay: 0.35 },
    };

    if (type === "header")
      base.data = { ...base.data, header_title: "Header title…", header_subtitle: "Header subtitle…", background_type: "color", background_color: "var(--epsy-off-white)" };
    if (type === "vision_mission")
      base.data = { ...base.data, vision_title: "Vision", vision_text: "Vision text…", mission_title: "Mission", mission_text: "Mission text…"};
    if (type === "story")
      base.data = { ...base.data, story_title: "Our Story", story_p1: "Paragraph 1…", story_p2: "Paragraph 2…", background_type: "color", background_color: "var(--epsy-off-white)" };
    if (type === "motto")
      base.data = { ...base.data, motto_title: `"It's All About Mentality."`, motto_text: "Motto explanation…" };
    if (type === "text") base.data = { ...base.data, title: "Section title…", body: "Write your text here…" };
    if (type === "divider") base.data = {};
    if (type === "spacer") base.data = { ...base.data, height: 48 };

    return base;
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

  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  // --- Admin Section Controls ---
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

        <Button variant="outline" className="rounded-2xl" onClick={() => duplicateSection(section.id)} title="Duplicate section">
          <Copy className="h-4 w-4 mr-2" /> Duplicate
        </Button>

        <Button variant="destructive" className="rounded-2xl" onClick={() => deleteSection(section.id)} title="Delete section">
          <Trash2 className="h-4 w-4 mr-2" /> Delete
        </Button>
      </div>
    );
  };

  // --- Section Renderer ---
  const renderSection = (section) => {
    const bgData = getSectionBackgroundData(section);
    const bgStyle = getSectionBackgroundStyle(section);

    const renderBackground = () =>
      bgData.backgroundType === "image" ? (
        <>
          <div className="absolute inset-0" style={bgStyle} />
          <div className="absolute inset-0" style={{ backgroundColor: "black", opacity: bgData.backgroundOverlay }} />
        </>
      ) : null;

    const commonSectionProps = {
      onDragOver: (e) => isAdmin && e.preventDefault(),
      onDrop: () => isAdmin && onDropOn(section.id),
    };

    // Renderers by type
    switch (section.type) {
      case "header": {
        const { header_title, header_subtitle } = section.data;
        return (
          <div {...commonSectionProps}>
            <SectionControls section={section} />
            <SectionBackgroundControls section={section} isAdmin={isAdmin} onChange={(patch) => updateSectionData(section.id, patch)} />
            <section className="py-16 lg:py-20 relative overflow-hidden" style={bgData.backgroundType === "color" ? bgStyle : bgData.backgroundType === "none" ? { backgroundColor: "var(--epsy-off-white)" } : {}}>
              {renderBackground()}
              <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <InlineText enabled={isAdmin} as="h1" value={header_title} onSave={(v) => saveSectionField(section.id, "header_title", v)} className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: bgData.backgroundType === "image" ? "white" : "var(--epsy-charcoal)" }} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}>
                  <div className="max-w-3xl mx-auto">
                    <InlineText enabled={isAdmin} as="p" multiLine value={header_subtitle} onSave={(v) => saveSectionField(section.id, "header_subtitle", v)} className="text-base sm:text-lg leading-8 sm:leading-9 text-left" style={{ color: bgData.backgroundType === "image" ? "rgba(255,255,255,0.9)" : "var(--epsy-slate-blue)" }} />
                  </div>
                </motion.div>
              </div>
            </section>
          </div>
        );
      }
      // Other section types (vision_mission, story, motto, text, divider, spacer) would follow the same approach...
      default:
        return null;
    }
  };

  return (
    <div>
      {isAdmin && <AdminBar />}
      {sections.map((s) => (
        <React.Fragment key={s.id}>{renderSection(s)}</React.Fragment>
      ))}
    </div>
  );
}
