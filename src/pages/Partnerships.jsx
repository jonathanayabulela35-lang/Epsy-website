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

export default function Partnerships() {
  const queryClient = useQueryClient();

  const showAdmin = useMemo(() => {
    return new URLSearchParams(window.location.search).get("admin") === "1";
  }, []);

  const ADMIN_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || "ayabulelaplatana126@gmail.com";

  const { data: pageContent = {}, isLoading } = useQuery({
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

  const sections = useMemo(() => {
    if (isLoading) return [];

    const s = pageContent.sections;
    if (Array.isArray(s) && s.length) return s;

    return [
      {
        id: "header",
        type: "header",
        data: {
          header_title: "Partner With Epsy",
          header_subtitle:
            "We partner with schools, organisations, and individuals who believe in the goal Epsy is working toward.",
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
          section_title: "Partnership Opportunities",
          cards: defaultPartnerTypes,
          background_type: "none",
          background_color: "",
          background_image: "",
          background_overlay: 0.35,
        },
      },
    ];
  }, [pageContent, isLoading]);

  const saveSections = async (nextSections) => {
    const next = { ...pageContent, sections: nextSections };
    await updateSiteContent("partnerships", next);
    queryClient.invalidateQueries({ queryKey: ["siteContent", "partnerships"] });
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

    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);

    await saveSections(current);
    toast.success("Section moved");
  };

  const iconFromName = (name) => {
    if (name === "users") return Users;
    if (name === "heart") return Heart;
    return School;
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--epsy-off-white)" }} />
    );
  }

  return (
    <div>
      <AdminBar
        show={showAdmin}
        redirectPathWithAdmin="/partnerships?admin=1"
        adminEmail={ADMIN_EMAIL}
      />

      {sections.map((section) => {
        const bgData = getSectionBackgroundData(section);
        const bgStyle = getSectionBackgroundStyle(section);

        if (section.type === "header") {
          return (
            <section
              key={section.id}
              className="py-16 relative"
              style={bgStyle}
            >
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold">
                  {section.data.header_title}
                </h1>
                <p className="mt-4">
                  {section.data.header_subtitle}
                </p>
              </div>
            </section>
          );
        }

        if (section.type === "partner_cards") {
          return (
            <section key={section.id} className="py-16">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl text-center font-bold mb-10">
                  {section.data.section_title}
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {section.data.cards.map((card) => {
                    const Icon = iconFromName(card.icon);

                    return (
                      <div key={card.id} className="p-6 rounded-xl bg-white">
                        <Icon className="mb-4" />
                        <h3 className="font-bold">{card.title}</h3>
                        <p>{card.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}
