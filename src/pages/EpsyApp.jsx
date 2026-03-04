import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Library, Search, MessageSquare, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabaseClient";
import { getSiteContent, updateSiteContent } from "@/lib/siteContentApi";

import AdminBar from "@/components/admin/AdminBar";
import InlineText from "@/components/admin/InlineText";

export default function EpsyApp() {
  const queryClient = useQueryClient();

  // admin mode only with ?admin=1
  const showAdmin = useMemo(() => {
    return new URLSearchParams(window.location.search).get("admin") === "1";
  }, []);

  const ADMIN_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || "ayabulelaplatana126@gmail.com";

  // Load content
  const { data: pageContent = {} } = useQuery({
    queryKey: ["siteContent", "epsyapp"],
    queryFn: async () => await getSiteContent("epsyapp"),
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

  const view = {
    header_title: pageContent.header_title ?? "EpsyApp",
    header_subtitle:
      pageContent.header_subtitle ??
      "EpsyApp is a structured student cognitive literacy and psychological resilience platform. It is not a chatbot. It is not therapy. It is a structured thinking and learning system.",
    features:
      Array.isArray(pageContent.features) && pageContent.features.length
        ? pageContent.features
        : defaultFeatures,
  };

  const saveNext = async (next) => {
    await updateSiteContent("epsyapp", next);
    queryClient.invalidateQueries({ queryKey: ["siteContent", "epsyapp"] });
  };

  const saveField = async (field, value) => {
    const next = { ...pageContent, [field]: value };
    await saveNext(next);
  };

  const updateFeature = async (index, patch) => {
    const nextFeatures = [...view.features];
    nextFeatures[index] = { ...nextFeatures[index], ...patch };
    await saveField("features", nextFeatures);
    toast.success("Saved");
  };

  const updateBullet = async (featureIndex, bulletIndex, value) => {
    const nextFeatures = [...view.features];
    const f = nextFeatures[featureIndex] ?? {};
    const details = Array.isArray(f.details) ? [...f.details] : [];
    details[bulletIndex] = value;
    nextFeatures[featureIndex] = { ...f, details };
    await saveField("features", nextFeatures);
    toast.success("Saved");
  };

  const addBullet = async (featureIndex) => {
    const nextFeatures = [...view.features];
    const f = nextFeatures[featureIndex] ?? {};
    const details = Array.isArray(f.details) ? [...f.details] : [];
    details.push("New bullet");
    nextFeatures[featureIndex] = { ...f, details };
    await saveField("features", nextFeatures);
    toast.success("Bullet added");
  };

  const removeBullet = async (featureIndex, bulletIndex) => {
    const nextFeatures = [...view.features];
    const f = nextFeatures[featureIndex] ?? {};
    const details = Array.isArray(f.details) ? [...f.details] : [];
    details.splice(bulletIndex, 1);
    nextFeatures[featureIndex] = { ...f, details };
    await saveField("features", nextFeatures);
    toast.success("Bullet removed");
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const featureIcons = [Library, Search, MessageSquare];

  return (
    <div>
      {/* Admin login bar */}
      <AdminBar
        show={showAdmin}
        redirectPathWithAdmin="/epsyapp?admin=1"
        adminEmail={ADMIN_EMAIL}
      />

      {/* Header */}
      <section
        className="py-20 lg:py-28"
        style={{ backgroundColor: "var(--epsy-off-white)" }}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <InlineText
              enabled={isAdmin}
              as="h1"
              value={view.header_title}
              onSave={(v) => saveField("header_title", v)}
              className="text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: "var(--epsy-charcoal)" }}
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
              value={view.header_subtitle}
              onSave={(v) => saveField("header_subtitle", v)}
              className="text-lg leading-relaxed"
              style={{ color: "var(--epsy-slate-blue)" }}
            />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="space-y-8">
            {view.features.map((feature, index) => {
              const Icon = featureIcons[index] || Library;
              const details = Array.isArray(feature.details) ? feature.details : [];

              return (
                <motion.div
                  key={feature.key || index}
                  {...fadeInUp}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="p-8 lg:p-10 rounded-2xl"
                  style={{ backgroundColor: "var(--epsy-off-white)" }}
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
                        onSave={(v) => updateFeature(index, { title: v })}
                        className="text-2xl font-bold mb-3"
                        style={{ color: "var(--epsy-charcoal)" }}
                      />

                      <InlineText
                        enabled={isAdmin}
                        as="p"
                        value={feature.description ?? ""}
                        onSave={(v) => updateFeature(index, { description: v })}
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
                                onSave={(v) => updateBullet(index, idx, v)}
                                className="text-sm leading-relaxed"
                                style={{ color: "var(--epsy-slate-blue)", display: "inline-block" }}
                              />
                            </div>

                            {isAdmin && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-xl"
                                onClick={() => removeBullet(index, idx)}
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
                            onClick={() => addBullet(index)}
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