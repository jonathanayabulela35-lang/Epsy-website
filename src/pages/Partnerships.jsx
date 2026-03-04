import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { School, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabaseClient";
import { getSiteContent, updateSiteContent } from "@/lib/siteContentApi";

import AdminBar from "@/components/admin/AdminBar";
import InlineText from "@/components/admin/InlineText";

export default function Partnerships() {
  const queryClient = useQueryClient();

  // admin mode only with ?admin=1
  const showAdmin = useMemo(() => {
    return new URLSearchParams(window.location.search).get("admin") === "1";
  }, []);

  const ADMIN_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || "ayabulelaplatana126@gmail.com";

  // Load content
  const { data: pageContent = {} } = useQuery({
    queryKey: ["siteContent", "partnerships"],
    queryFn: async () => await getSiteContent("partnerships"),
  });

  // Session (so we know if it's you)
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
      key: "schools",
      title: "Schools",
      description:
        "Partner with us to bring psychological resilience training directly to your students.",
    },
    {
      key: "youth_orgs",
      title: "Youth Development Organisations",
      description:
        "Join forces with organisations aligned with youth development and mental wellness.",
    },
    {
      key: "supporters",
      title: "Individual Supporters",
      description:
        "Support the mission through donations or volunteer your expertise.",
    },
  ];

  const view = {
    header_title: pageContent.header_title ?? "Partner With Epsy",
    header_subtitle:
      pageContent.header_subtitle ??
      "We partner with schools, organisations, and individuals who believe in the goal Epsy is working toward — helping students strengthen their mentality and prepare for life mentally before life challenges them outwardly.",
    section_title: pageContent.section_title ?? "Partnership Opportunities",
    partner_types:
      Array.isArray(pageContent.partner_types) && pageContent.partner_types.length
        ? pageContent.partner_types
        : defaultPartnerTypes,
    donate_title: pageContent.donate_title ?? "Support the Mission",
    donate_button_text: pageContent.donate_button_text ?? "Donate Now",
    donate_button_link: pageContent.donate_button_link ?? "#",
    donate_note:
      pageContent.donate_note ??
      "Your donation supports the development of EpsyApp, the creation of structured psychological learning resources, and outreach to more schools.",
  };

  const saveField = async (field, value) => {
    const next = { ...pageContent, [field]: value };
    await updateSiteContent("partnerships", next);
    queryClient.invalidateQueries({ queryKey: ["siteContent", "partnerships"] });
  };

  const updatePartner = async (index, patch) => {
    const nextPartnerTypes = [...view.partner_types];
    nextPartnerTypes[index] = { ...nextPartnerTypes[index], ...patch };
    await saveField("partner_types", nextPartnerTypes);
    toast.success("Saved");
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const icons = [School, Users, Heart];

  return (
    <div>
      {/* Admin login bar */}
      <AdminBar
        show={showAdmin}
        redirectPathWithAdmin="/partnerships?admin=1"
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

      {/* Partnership Types */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeInUp} className="text-center">
            <InlineText
              enabled={isAdmin}
              as="h2"
              value={view.section_title}
              onSave={(v) => saveField("section_title", v)}
              className="text-3xl font-bold mb-12"
              style={{ color: "var(--epsy-charcoal)" }}
            />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {view.partner_types.map((partner, index) => {
              const Icon = icons[index] || School;

              return (
                <motion.div
                  key={partner.key || index}
                  {...fadeInUp}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="p-8 rounded-2xl"
                  style={{ backgroundColor: "var(--epsy-off-white)" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: "var(--epsy-sky-blue)" }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <InlineText
                    enabled={isAdmin}
                    as="h3"
                    value={partner.title ?? ""}
                    onSave={(v) => updatePartner(index, { title: v })}
                    className="text-xl font-semibold mb-2"
                    style={{ color: "var(--epsy-charcoal)" }}
                  />

                  <InlineText
                    enabled={isAdmin}
                    as="p"
                    value={partner.description ?? ""}
                    onSave={(v) => updatePartner(index, { description: v })}
                    className="leading-relaxed"
                    style={{ color: "var(--epsy-slate-blue)" }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section
        className="py-16 lg:py-24"
        style={{ backgroundColor: "var(--epsy-off-white)" }}
      >
        <div className="max-w-2xl mx-auto px-6 lg:px-12 text-center">
          <motion.div {...fadeInUp} className="space-y-8">
            <InlineText
              enabled={isAdmin}
              as="h2"
              value={view.donate_title}
              onSave={(v) => saveField("donate_title", v)}
              className="text-3xl lg:text-4xl font-bold"
              style={{ color: "var(--epsy-charcoal)" }}
            />

            <div className="flex flex-col items-center gap-3">
              <Button
                size="lg"
                className="text-white font-medium px-12 py-6 rounded-xl transition-all duration-300 hover:shadow-lg text-base"
                style={{ backgroundColor: "var(--epsy-sky-blue)" }}
                onClick={() => window.open(view.donate_button_link, "_blank")}
              >
                {view.donate_button_text}
              </Button>

              {/* Inline edit button text + link (admin only) */}
              {isAdmin && (
                <div className="w-full max-w-xl mx-auto text-left grid gap-2">
                  <div className="text-sm font-semibold" style={{ color: "var(--epsy-charcoal)" }}>
                    Donation button
                  </div>

                  <InlineText
                    enabled={isAdmin}
                    as="div"
                    value={view.donate_button_text}
                    onSave={(v) => saveField("donate_button_text", v)}
                    className="text-sm px-3 py-2 rounded-xl border"
                    style={{ borderColor: "rgba(15,30,36,0.12)", color: "var(--epsy-slate-blue)" }}
                  />

                  <InlineText
                    enabled={isAdmin}
                    as="div"
                    value={view.donate_button_link}
                    onSave={(v) => saveField("donate_button_link", v)}
                    className="text-sm px-3 py-2 rounded-xl border"
                    style={{ borderColor: "rgba(15,30,36,0.12)", color: "var(--epsy-slate-blue)" }}
                  />
                  <div className="text-xs" style={{ color: "var(--epsy-slate-blue)" }}>
                    Tip: paste a full link like https://paystack.com/... or https://yourbanklink...
                  </div>
                </div>
              )}
            </div>

            <InlineText
              enabled={isAdmin}
              as="p"
              value={view.donate_note}
              onSave={(v) => saveField("donate_note", v)}
              className="text-sm leading-relaxed max-w-xl mx-auto"
              style={{ color: "var(--epsy-slate-blue)" }}
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
}