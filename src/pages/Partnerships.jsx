import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { School, Users, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const partnerTypes = [
  {
    id: "schools",
    icon: School,
    title: "Schools",
    description:
      "Partner with us to bring psychological resilience training directly to your students.",
  },
  {
    id: "youth_orgs",
    icon: Users,
    title: "Youth Development Organisations",
    description:
      "We welcome joint efforts with organisations aligned with youth and psychological development.",
  },
  {
    id: "supporters",
    icon: Heart,
    title: "Individual Supporters",
    description:
      "Support the mission through donations or volunteer your expertise.",
  },
];

export default function Partnerships() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <div>
      {/* Header (gradient). Extra bottom padding lets the card panel overlap it. */}
      <section className="epsy-page-gradient pt-16 pb-32 lg:pt-24 lg:pb-40">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-left">
          <h1
            className="text-4xl lg:text-5xl font-bold text-center"
            style={{ color: "#FFFFFF" }}
          >
            Partner With Everyday Psychology NPO
          </h1>
          <p
            className="mt-4 text-base sm:text-lg leading-8 text-left"
            style={{ color: "rgba(255,255,255,0.92)" }}
          >
            We partner with schools, organisations, and individuals who believe in the goal Everyday Psychology NPO (Epsy NPO) is working toward. As we aim to equip young people with the psychological tools needed to navigate life with awareness, and resilience. Whether through collaborations, programme support, or shared initiatives, we welcome those who are committed to shaping a generation that is mentally prepared and intentional in how they approach both life and learning.
          </p>
        </div>
      </section>

      {/* Opportunities: one connected panel, overlapping the header */}
      <section
        className="epsy-tint-section relative pb-16 lg:pb-24"
        aria-labelledby="opportunities-title"
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-12 -mt-20 lg:-mt-24">
          <motion.div
            {...fadeInUp}
            className="rounded-[2rem] bg-white border overflow-hidden"
            style={{
              borderColor: "rgba(15,30,36,0.08)",
              boxShadow: "0 28px 80px rgba(15,30,36,0.14)",
            }}
          >
            <div
              className="px-8 lg:px-12 pt-8 lg:pt-10 pb-6 border-b"
              style={{ borderColor: "rgba(15,30,36,0.08)" }}
            >
              <h2
                id="opportunities-title"
                className="text-2xl lg:text-3xl font-bold text-left"
                style={{ color: "var(--epsy-charcoal)" }}
              >
                Partnership Opportunities
              </h2>
            </div>

            <div
              className="grid md:grid-cols-3 md:divide-x divide-y md:divide-y-0"
              style={{ borderColor: "rgba(15,30,36,0.08)" }}
            >
              {partnerTypes.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    className="p-8 lg:p-10 flex flex-col"
                    style={{ borderColor: "rgba(15,30,36,0.08)" }}
                  >
                    <div
                      className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6"
                      style={{ backgroundColor: "var(--epsy-sky-blue)" }}
                    >
                      <Icon
                        className="h-7 w-7"
                        style={{ color: "var(--epsy-charcoal)" }}
                      />
                    </div>

                    <h3
                      className="text-xl font-semibold mb-3 text-left"
                      style={{ color: "var(--epsy-charcoal)" }}
                    >
                      {card.title}
                    </h3>

                    <p
                      className="leading-relaxed text-left"
                      style={{ color: "var(--epsy-slate-blue)" }}
                    >
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Closing call to action (same tint as the section above; footer below is charcoal) */}
      <section
        className="epsy-tint-section py-14 lg:py-20 border-t"
        style={{ borderColor: "rgba(15,30,36,0.08)" }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <h2
              className="text-2xl lg:text-3xl font-bold mb-3 text-left"
              style={{ color: "var(--epsy-charcoal)" }}
            >
              Ready to partner with us?
            </h2>
            <p
              className="text-base sm:text-lg leading-8 text-left"
              style={{ color: "var(--epsy-slate-blue)" }}
            >
              Tell us how you would like to be involved with Epsy NPO and we will get back to you.
            </p>
          </div>

          <Link to="/contact" className="shrink-0">
            <Button
              className="px-8 py-6 text-base rounded-2xl font-semibold"
              style={{
                backgroundColor: "var(--epsy-sky-blue)",
                color: "var(--epsy-charcoal)",
              }}
            >
              Get in touch
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
