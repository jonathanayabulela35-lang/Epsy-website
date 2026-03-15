import React, { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Library,
  Search,
  MessageSquare,
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
import SectionBackgroundControls from "@/components/admin/SectionBackgroundControls.jsx";
import {
  getSectionBackgroundData,
  getSectionBackgroundStyle,
} from "@/components/admin/sectionBackground";

/**
 * EPSYAPP SECTIONS MODEL (stored in Supabase under epsyapp.sections):
 * [
 *  { id, type: "header", data: { header_title, header_subtitle } },
 *  { id, type: "features", data: { items:[{id, icon, title, description, details:[]}] } },
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

const APK_URL = "/downloads/epsyapp.apk";

export default function EpsyApp() {
  const queryClient = useQueryClient();

  const showAdmin = useMemo(() => {
    return new URLSearchParams(window.location.search).get("admin") === "1";
  }, []);

  const ADMIN_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || "ayabulelaplatana126@gmail.com";

  const { data: pageContent = {} } = useQuery({
    queryKey: ["siteContent", "epsyapp"],
    queryFn: async () => await getSiteContent("epsyapp"),
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

  const defaultFeatures = [
    {
      id: "library",
      icon: "library",
      title: "Psychological Insight Library",
      description:
        "Content curated and uploaded by Epsy covering real challenges students face.",
      details: [
        "Topics: Bullying, imposter syndrome, exam anxiety, friend groups, gifts and talents, procrastination, fear of failure",
        "Each topic includes: Why this happens, How to reframe, If you ignore, If you act, Practical steps",
        "Daily Execution shows visible day-by-day growth, with detailed depth inside each specific day",
      ],
    },
    {
      id: "decoder",
      icon: "search",
      title: "Question Decoder",
      description:
        "Content uploaded by Epsy to help students understand how exam questions are built.",
      details: [
        "Includes past paper examples",
        "Explains how exam questions are framed",
        "Embedded sections: How to Respond, How to Remember the Response",
      ],
    },
    {
      id: "builder",
      icon: "message",
      title: "Question Builder",
      description:
        "Structured guidance created by Epsy to help students ask clearer academic questions.",
      details: [
        "Step-by-step framework for building better questions",
        "Learn to identify what you actually need to know",
        "Develop critical thinking through question formation",
      ],
    },
  ];

  const oldView = {
    header_title: pageContent.header_title ?? "EpsyApp",
    header_subtitle:
      pageContent.header_subtitle ??
      "EpsyApp is a structured student cognitive literacy and psychological resilience platform. It is not a chatbot. It is not therapy. It is a structured thinking and learning system.",
    features:
      Array.isArray(pageContent.features) && pageContent.features.length
        ? pageContent.features.map((f, i) => ({
            id: f.key || `feature_${i}`,
            icon: ["library", "search", "message"][i] || "library",
            title: f.title ?? "",
            description: f.description ?? "",
            details: Array.isArray(f.details) ? f.details : [],
          }))
        : defaultFeatures,
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
        id: "features",
        type: "features",
        data: {
          items: oldView.features,
          background_type: "none",
          background_color: "",
          background_image: "",
          background_overlay: 0.35,
        },
      },
    ];
  }, [pageContent.sections, oldView]);

  const saveSections = async (nextSections) => {
    const next = { ...pageContent, sections: nextSections };
    await updateSiteContent("epsyapp", next);
    queryClient.invalidateQueries({ queryKey: ["siteContent", "epsyapp"] });
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

    if (cloned.type === "features") {
      const items = Array.isArray(cloned.data?.items) ? cloned.data.items : [];
      cloned.data.items = items.map((it) => ({
        ...it,
        id: `${it.id || "feature"}_${Date.now()}_${Math.random()
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
          header_title: "EpsyApp",
          header_subtitle: "Write a subtitle here…",
          background_type: "color",
          background_color: "var(--epsy-off-white)",
          background_image: "",
          background_overlay: 0.35,
        },
      };
    }

    if (type === "features") {
      return {
        id,
        type: "features",
        data: {
          items: [
            {
              id: `feature_${Date.now()}_1`,
              icon: "library",
              title: "New feature",
              description: "Describe the feature…",
              details: ["Bullet 1", "Bullet 2"],
            },
          ],
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

          <Button className="rounded-2xl" variant="outline" onClick={() => addSection("features")}>
            Add Features
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
    if (name === "search") return Search;
    if (name === "message") return MessageSquare;
    return Library;
  };

  const updateFeatureItem = async (sectionId, itemId, patch) => {
    const nextSections = sections.map((s) => {
      if (s.id !== sectionId) return s;
      const items = Array.isArray(s.data?.items) ? s.data.items : [];
      return {
        ...s,
        data: {
          ...s.data,
          items: items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
        },
      };
    });
    await saveSections(nextSections);
  };

  const addFeatureItem = async (sectionId) => {
    const nextSections = sections.map((s) => {
      if (s.id !== sectionId) return s;
      const items = Array.isArray(s.data?.items) ? s.data.items : [];
      return {
        ...s,
        data: {
          ...s.data,
          items: [
            ...items,
            {
              id: `feature_${Date.now()}_${Math.random().toString(16).slice(2)}`,
              icon: "library",
              title: "New feature",
              description: "Describe the feature…",
              details: ["Bullet 1"],
            },
          ],
        },
      };
    });
    await saveSections(nextSections);
    toast.success("Feature added");
  };

  const deleteFeatureItem = async (sectionId, itemId) => {
    const nextSections = sections.map((s) => {
      if (s.id !== sectionId) return s;
      const items = Array.isArray(s.data?.items) ? s.data.items : [];
      return { ...s, data: { ...s.data, items: items.filter((it) => it.id !== itemId) } };
    });
    await saveSections(nextSections);
    toast.success("Feature deleted");
  };

  const addBullet = async (sectionId, itemId) => {
    const nextSections = sections.map((s) => {
      if (s.id !== sectionId) return s;
      const items = Array.isArray(s.data?.items) ? s.data.items : [];
      return {
        ...s,
        data: {
          ...s.data,
          items: items.map((it) => {
            if (it.id !== itemId) return it;
            const details = Array.isArray(it.details) ? [...it.details] : [];
            details.push("New bullet");
            return { ...it, details };
          }),
        },
      };
    });
    await saveSections(nextSections);
    toast.success("Bullet added");
  };

  const updateBullet = async (sectionId, itemId, bulletIndex, value) => {
    const nextSections = sections.map((s) => {
      if (s.id !== sectionId) return s;
      const items = Array.isArray(s.data?.items) ? s.data.items : [];
      return {
        ...s,
        data: {
          ...s.data,
          items: items.map((it) => {
            if (it.id !== itemId) return it;
            const details = Array.isArray(it.details) ? [...it.details] : [];
            details[bulletIndex] = value;
            return { ...it, details };
          }),
        },
      };
    });
    await saveSections(nextSections);
  };

  const removeBullet = async (sectionId, itemId, bulletIndex) => {
    const nextSections = sections.map((s) => {
      if (s.id !== sectionId) return s;
      const items = Array.isArray(s.data?.items) ? s.data.items : [];
      return {
        ...s,
        data: {
          ...s.data,
          items: items.map((it) => {
            if (it.id !== itemId) return it;
            const details = Array.isArray(it.details) ? [...it.details] : [];
            details.splice(bulletIndex, 1);
            return { ...it, details };
          }),
        },
      };
    });
    await saveSections(nextSections);
    toast.success("Bullet removed");
  };

  const renderSection = (section) => {
    const bgData = getSectionBackgroundData(section);
    const bgStyle = getSectionBackgroundStyle(section);

    if (section.type === "header") {
      const d = section.data || {};
      const title = d.header_title ?? "EpsyApp";
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

    if (section.type === "features") {
      const d = section.data || {};
      const items = Array.isArray(d.items) ? d.items : [];

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
              {isAdmin && (
                <div className="flex justify-center pb-6">
                  <Button className="rounded-2xl" variant="outline" onClick={() => addFeatureItem(section.id)}>
                    <Plus className="h-4 w-4 mr-2" /> Add feature
                  </Button>
                </div>
              )}

              <div className="space-y-8">
                {items.map((feature, index) => {
                  const Icon = iconFromName(feature.icon);
                  const details = Array.isArray(feature.details) ? feature.details : [];

                  return (
                    <motion.div
                      key={feature.id || index}
                      {...fadeInUp}
                      transition={{ delay: index * 0.08, duration: 0.6 }}
                      className="p-8 lg:p-10 rounded-2xl"
                      style={{
                        backgroundColor:
                          bgData.backgroundType === "image"
                            ? "rgba(250,251,249,0.92)"
                            : "var(--epsy-off-white)",
                      }}
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "var(--epsy-sky-blue)" }}
                        >
                          <Icon className="w-7 h-7 text-white" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <InlineText
                              enabled={isAdmin}
                              as="h3"
                              value={feature.title ?? ""}
                              onSave={(v) => updateFeatureItem(section.id, feature.id, { title: v })}
                              className="text-2xl font-bold mb-3"
                              style={{ color: "var(--epsy-charcoal)" }}
                            />

                            {isAdmin && (
                              <Button
                                size="icon"
                                variant="destructive"
                                className="rounded-2xl"
                                onClick={() => deleteFeatureItem(section.id, feature.id)}
                                title="Delete feature"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <InlineText
                            enabled={isAdmin}
                            as="p"
                            multiLine
                            value={feature.description ?? ""}
                            onSave={(v) => updateFeatureItem(section.id, feature.id, { description: v })}
                            className="text-base mb-4 leading-relaxed"
                            style={{ color: "var(--epsy-slate-blue)" }}
                          />

                          <ul className="space-y-2">
                            {details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <div
                                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                                  style={{ backgroundColor: "var(--epsy-sky-blue)" }}
                                />

                                <div className="flex-1">
                                  <InlineText
                                    enabled={isAdmin}
                                    as="span"
                                    value={detail}
                                    onSave={(v) => updateBullet(section.id, feature.id, idx, v)}
                                    className="text-sm leading-relaxed"
                                    style={{
                                      color: "var(--epsy-slate-blue)",
                                      display: "inline-block",
                                    }}
                                  />
                                </div>

                                {isAdmin && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="rounded-xl"
                                    onClick={() => removeBullet(section.id, feature.id, idx)}
                                    title="Remove bullet"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </li>
                            ))}
                          </ul>

                          {isAdmin && (
                            <div className="pt-4 flex flex-col gap-3">
                              <Button
                                variant="outline"
                                className="rounded-2xl w-fit"
                                onClick={() => addBullet(section.id, feature.id)}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add bullet
                              </Button>

                              <div className="w-full max-w-xl">
                                <div className="text-xs mb-1" style={{ color: "rgba(15,30,36,0.60)" }}>
                                  Icon name (library / search / message)
                                </div>
                                <InlineText
                                  enabled={isAdmin}
                                  as="div"
                                  value={feature.icon ?? "library"}
                                  onSave={(v) =>
                                    updateFeatureItem(section.id, feature.id, {
                                      icon: (v || "library").trim().toLowerCase(),
                                    })
                                  }
                                  className="text-sm px-3 py-2 rounded-xl border"
                                  style={{
                                    borderColor: "rgba(15,30,36,0.12)",
                                    color: "var(--epsy-slate-blue)",
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
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
        redirectPathWithAdmin="/epsyapp?admin=1"
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

            <Button className="rounded-2xl" variant="outline" onClick={() => addSection("features")}>
              Add Features
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