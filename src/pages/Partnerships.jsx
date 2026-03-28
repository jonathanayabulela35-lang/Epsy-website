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
        "We welcome joint efforts with organisations aligned with youth and psychological development.",
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
            "We partner with schools, organisations, and individuals who believe in the goal Everyday Psychology is working toward. As we aim to equip young people with the psychological tools needed to navigate life with awareness, and resilience. Whether through collaborations, programme support, or shared initiatives, we welcome those who are committed to shaping a generation that is mentally prepared and intentional in how they approach both life and learning.",
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
              <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
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
              <div className="max-w-6xl mx-auto px-6 lg:px-12">
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
