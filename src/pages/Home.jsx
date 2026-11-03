import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Users, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const view = {
    hero_title: "Its All about Mentality.",
    hero_subtitle: "",
    hero_cta_primary_text: "Learn more",
    hero_cta_secondary_text: "Contact us",

    what_title: "What we do",
    what_subtitle:
      "We combine accessible psychology education with practical tools designed for real life.",

    cards: [
      {
        key: "online",
        title: "Psychological Awareness Online",
        description:
          "Structured lessons and content shared digitally to help students understand the psychology behind everyday challenges.",
      },
      {
        key: "schools",
        title: "School Engagements",
        description:
          "Speaking engagements and student-focused sessions that bring psychological awareness directly into the classroom.",
      },
      {
        key: "community",
        title: "Community Development",
        description:
          "Practical support and awareness initiatives that help young people think clearly, respond wisely, and grow with resilience.",
      },
    ],

    partner_button_text: "Partner with us",
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const iconForIndex = (i) => [Globe, Users, HeartHandshake][i] || Globe;

  return (
    <div>
      <section className="relative overflow-hidden min-h-[70vh] lg:min-h-[calc(100vh-96px)] flex items-center">
        <div
          className="home-hero-background absolute inset-0 w-full h-full"
          style={{
            backgroundImage: "url('/assets/hero-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "black",
            opacity: 0.6,
          }}
        />

        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div {...fadeInUp}>
              <h1
                className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight"
                style={{ color: "white" }}
              >
                {view.hero_title}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p
                className="text-lg lg:text-xl mb-10 leading-relaxed"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                {view.hero_subtitle}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/about">
                <Button
                  className="px-8 py-6 text-base rounded-2xl font-semibold shadow-lg shadow-black/10"
                  style={{
                    backgroundColor: "var(--epsy-sky-blue)",
                    color: "var(--epsy-charcoal)",
                  }}
                >
                  {view.hero_cta_primary_text}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link to="/contact">
                <Button
                  variant="outline"
                  className="px-8 py-6 text-base rounded-2xl font-semibold"
                  style={{
                    borderColor: "white",
                    color: "white",
                    backgroundColor: "transparent",
                  }}
                >
                  {view.hero_cta_secondary_text}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white" aria-labelledby="what-title">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mb-10 text-left">
            <h2
              id="what-title"
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{ color: "var(--epsy-charcoal)" }}
            >
              {view.what_title}
            </h2>
            <p
              className="text-base sm:text-lg leading-8 text-left"
              style={{ color: "var(--epsy-slate-blue)" }}
            >
              {view.what_subtitle}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[2rem] border overflow-hidden grid grid-cols-1 md:grid-cols-3 md:divide-x divide-y md:divide-y-0"
            style={{
              backgroundColor: "var(--epsy-off-white)",
              borderColor: "rgba(15,30,36,0.08)",
              boxShadow: "0 18px 50px rgba(15,30,36,0.06)",
            }}
          >
            {(view.cards || []).map((item, idx) => {
              const Icon = iconForIndex(idx);

              return (
                <div
                  key={item.key || idx}
                  className="p-8 lg:p-10"
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
                    {item.title}
                  </h3>

                  <p
                    className="leading-relaxed text-left"
                    style={{ color: "var(--epsy-slate-blue)" }}
                  >
                    {item.description}
                  </p>
                </div>
              );
            })}
          </motion.div>

          <div className="pt-10">
            <Link to={createPageUrl("Partnerships")}>
              <Button
                className="px-8 py-6 text-base rounded-2xl font-semibold"
                style={{
                  backgroundColor: "var(--epsy-sky-blue)",
                  color: "var(--epsy-charcoal)",
                }}
              >
                {view.partner_button_text}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
