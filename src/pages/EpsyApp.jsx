import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Library, Search, MessageSquare, Plus, Trash2, Download } from "lucide-react";
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
import { Button } from "@/components/ui/button";

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
      key: "library",
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
      key: "decoder",
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
      key: "builder",
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
    download_title: pageContent.download_title ?? "Download the EpsyApp",
    features:
      Array.isArray(pageContent.features) && pageContent.features.length
        ? pageContent.features
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
        id: "features",
        type: "features",
        data: {
          features: oldView.features,
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

  const updateFeature = async (sectionId, index, patch) => {
    const nextSections = sections.map((s) => {
      if (s.id !== sectionId) return s;
      const features = Array.isArray(s.data?.features) ? [...s.data.features] : [];
      features[index] = { ...features[index], ...patch };
      return {
        ...s,
        data: {
          ...s.data,
          features,
        },
      };
    });

    await saveSections(nextSections);
    toast.success("Saved");
  };

  const updateBullet = async (sectionId, featureIndex, bulletIndex, value) => {
    const nextSections = sections.map((s) => {
      if (s.id !== sectionId) return s;
      const features = Array.isArray(s.data?.features) ? [...s.data.features] : [];
      const f = features[featureIndex] ?? {};
      const details = Array.isArray(f.details) ? [...f.details] : [];
      details[bulletIndex] = value;
      features[featureIndex] = { ...f, details };
      return {
        ...s,
        data: {
          ...s.data,
          features,
        },
      };
    });

    await saveSections(nextSections);
    toast.success("Saved");
  };

  const addBullet = async (sectionId, featureIndex) => {
    const nextSections = sections.map((s) => {
      if (s.id !== sectionId) return s;
      const features = Array.isArray(s.data?.features) ? [...s.data.features] : [];
      const f = features[featureIndex] ?? {};
      const details = Array.isArray(f.details) ? [...f.details] : [];
      details.push("New bullet");
      features[featureIndex] = { ...f, details };
      return {
        ...s,
        data: {
          ...s.data,
          features,
        },
      };
    });

    await saveSections(nextSections);
    toast.success("Bullet added");
  };

  const removeBullet = async (sectionId, featureIndex, bulletIndex) => {
    const nextSections = sections.map((s) => {
      if (s.id !== sectionId) return s;
      const features = Array.isArray(s.data?.features) ? [...s.data.features] : [];
      const f = features[featureIndex] ?? {};
      const details = Array.isArray(f.details) ? [...f.details] : [];
      details.splice(bulletIndex, 1);
      features[featureIndex] = { ...f, details };
      return {
        ...s,
        data: {
          ...s.data,
          features,
        },
      };
    });

    await saveSections(nextSections);
    toast.success("Bullet removed");
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const featureIcons = [Library, Search, MessageSquare];

  const renderSection = (section) => {
    const bgData = getSectionBackgroundData(section);
    const bgStyle = getSectionBackgroundStyle(section);

    if (section.type === "header") {
      const d = section.data || {};
      const headerTitle = d.header_title ?? "EpsyApp";
      const headerSubtitle =
        d.header_subtitle ??
        "EpsyApp is a structured student cognitive literacy and psychological resilience platform. It is not a chatbot. It is not therapy. It is a structured thinking and learning system.";

      return (
        <div key={section.id}>
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <InlineText
                  enabled={isAdmin}
                  as="h1"
                  value={headerTitle}
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <InlineText
                  enabled={isAdmin}
                  as="p"
                  value={headerSubtitle}
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
            className="py-10 relative overflow-hidden"
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
                animate={{ opacity: 1, y: 0 }}
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

    if (section.type === "features") {
      const d = section.data || {};
      const features = Array.isArray(d.features) ? d.features : [];

      return (
        <div key={section.id}>
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

            <div className="max-w-6xl mx-auto px-6 lg:px-12 relative z-10">
              <div className="space-y-8">
                {features.map((feature, index) => {
                  const Icon = featureIcons[index] || Library;
                  const details = Array.isArray(feature.details) ? feature.details : [];

                  return (
                    <motion.div
                      key={feature.key || index}
                      {...fadeInUp}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
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
                          <InlineText
                            enabled={isAdmin}
                            as="h3"
                            value={feature.title ?? ""}
                            onSave={(v) =>
                              updateFeature(section.id, index, { title: v })
                            }
                            className="text-2xl font-bold mb-3"
                            style={{ color: "var(--epsy-charcoal)" }}
                          />

                          <InlineText
                            enabled={isAdmin}
                            as="p"
                            value={feature.description ?? ""}
                            onSave={(v) =>
                              updateFeature(section.id, index, { description: v })
                            }
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
                                    onSave={(v) =>
                                      updateBullet(section.id, index, idx, v)
                                    }
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
                                    onClick={() =>
                                      removeBullet(section.id, index, idx)
                                    }
                                    title="Remove bullet"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </li>
                            ))}
                          </ul>

                          {isAdmin && (
                            <div className="pt-4">
                              <Button
                                variant="outline"
                                className="rounded-2xl"
                                onClick={() => addBullet(section.id, index)}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add bullet
                              </Button>
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

    return null;
  };

  return (
    <div>
      <AdminBar
        show={showAdmin}
        redirectPathWithAdmin="/epsyapp?admin=1"
        adminEmail={ADMIN_EMAIL}
      />

      {sections.map((section) => renderSection(section))}
    </div>
  );
}