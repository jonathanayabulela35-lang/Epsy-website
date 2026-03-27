import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { School, Users, Heart } from "lucide-react";

export default function Partnerships() {
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
    return [
      {
        id: "header",
        type: "header",
        data: {
          header_title: "Partner With Epsy",
          header_subtitle:
            "We partner with schools, organisations, and individuals who believe in the goal Epsy is working toward.",
        },
      },
      {
        id: "partner_cards",
        type: "partner_cards",
        data: {
          section_title: "Partnership Opportunities",
          cards: defaultPartnerTypes,
        },
      },
    ];
  }, []);

  const iconFromName = (name) => {
    if (name === "users") return Users;
    if (name === "heart") return Heart;
    return School;
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <div>
      {sections.map((section, index) => {
        const isBlue = index === 1;

        if (section.type === "header") {
          return (
            <section
              key={section.id}
              className="py-16 relative"
              style={{ backgroundColor: "var(--epsy-off-white)" }}
            >
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold">
                  {section.data.header_title}
                </h1>
                <p className="mt-4">{section.data.header_subtitle}</p>
              </div>
            </section>
          );
        }

        if (section.type === "partner_cards") {
          return (
            <section
              key={section.id}
              className="py-16"
              style={{
                backgroundColor: isBlue ? "#38B6FF" : "white",
              }}
            >
              <div className="max-w-6xl mx-auto">
                <h2
                  className="text-3xl text-center font-bold mb-10"
                  style={{
                    color: isBlue ? "#FFFFFF" : undefined,
                  }}
                >
                  {section.data.section_title}
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  {section.data.cards.map((card, idx) => {
                    const Icon = iconFromName(card.icon);

                    return (
                      <motion.div
                        key={card.id}
                        {...fadeInUp}
                        transition={{ delay: idx * 0.1, duration: 0.6 }}
                        className="p-8 rounded-3xl border shadow-sm"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.95)",
                          borderColor: "rgba(15,30,36,0.08)",
                        }}
                      >
                        <div
                          className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5"
                          style={{ backgroundColor: "rgba(12,192,223,0.20)" }}
                        >
                          <Icon className="h-6 w-6" style={{ color: "var(--epsy-sky-blue)" }} />
                        </div>

                        <h3
                          className="text-xl font-semibold mb-3"
                          style={{ color: "var(--epsy-charcoal)" }}
                        >
                          {card.title}
                        </h3>

                        <p style={{ color: "var(--epsy-slate-blue)" }}>
                          {card.description}
                        </p>
                      </motion.div>
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
