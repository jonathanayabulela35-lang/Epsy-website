import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  School,
  Users,
  Heart,
} from "lucide-react";

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

  return (
    <div>
      {sections.map((section, index) => {
        const isBlue = index === 1; // first section AFTER header

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
                <p className="mt-4">
                  {section.data.header_subtitle}
                </p>
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

                <div className="grid md:grid-cols-2 gap-6">
                  {section.data.cards.map((card) => {
                    const Icon = iconFromName(card.icon);

                    return (
                      <div key={card.id} className="p-6 rounded-xl bg-white">
                        <Icon className="mb-4" />
                        <h3 className="font-bold">
                          {card.title}
                        </h3>
                        <p
                          style={{
                            color: isBlue
                              ? "rgba(255,255,255,0.9)"
                              : undefined,
                          }}
                        >
                          {card.description}
                        </p>
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
