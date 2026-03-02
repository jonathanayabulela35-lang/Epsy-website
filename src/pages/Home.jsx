import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Users, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteSettings } from "@/lib/siteSettings";

export default function Home() {
  const settings = siteSettings;

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const whatWeDo = [
    {
      icon: Globe,
      title: "Psychological Awareness Online",
      description:
        "Structured lessons and content shared digitally to help students understand the psychology behind everyday challenges.",
    },
    {
      icon: Users,
      title: "School Engagements",
      description:
        "Speaking engagements and student-focused sessions that bring psychological awareness directly into the classroom.",
    },
    {
      icon: Smartphone,
      title: "EpsyApp",
      description:
        "Our structured student cognitive literacy and resilience platform designed to build mental strength day by day.",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {settings?.hero_background_url ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${settings.hero_background_url})` }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "var(--epsy-charcoal)",
                opacity: settings?.hero_overlay_opacity ?? 0.3,
              }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "var(--epsy-off-white)" }}
          />
        )}

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              {...fadeInUp}
              className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight"
              style={{
                color: settings?.hero_background_url
                  ? "white"
                  : "var(--epsy-charcoal)",
              }}
            >
              Building resilience through everyday psychology.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg lg:text-xl mb-10 leading-relaxed"
              style={{
                color: settings?.hero_background_url
                  ? "rgba(255,255,255,0.9)"
                  : "var(--epsy-slate-blue)",
              }}
            >
              Epsy helps students and communities understand the mind, strengthen
              coping skills, and grow practical emotional resilience.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/about">
                <Button
                  className="px-8 py-6 text-base rounded-2xl font-semibold"
                  style={{
                    backgroundColor: "var(--epsy-sky-blue)",
                    color: "var(--epsy-charcoal)",
                  }}
                >
                  Learn more
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link to="/contact">
                <Button
                  variant="outline"
                  className="px-8 py-6 text-base rounded-2xl font-semibold"
                  style={{
                    borderColor: "var(--epsy-sky-blue)",
                    color: "var(--epsy-sky-blue)",
                  }}
                >
                  Contact us
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: "white" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{ color: "var(--epsy-charcoal)" }}
            >
              What we do
            </h2>
            <p
              className="text-lg leading-relaxed"
              style={{ color: "var(--epsy-slate-blue)" }}
            >
              We combine accessible psychology education with practical tools
              designed for real life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whatWeDo.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="p-8 rounded-3xl border shadow-sm"
                  style={{
                    backgroundColor: "var(--epsy-off-white)",
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
                    {item.title}
                  </h3>
                  <p
                    className="leading-relaxed"
                    style={{ color: "var(--epsy-slate-blue)" }}
                  >
                    {item.description}
                  </p>

                  {item.title === "EpsyApp" && (
                    <div className="pt-5">
                      <Link to="/epsyapp" className="inline-flex items-center text-sm font-semibold" style={{ color: "var(--epsy-sky-blue)" }}>
                        Explore EpsyApp <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="text-center pt-14">
            <Link to={createPageUrl("Partnerships")}>
              <Button
                className="px-8 py-6 text-base rounded-2xl font-semibold"
                style={{
                  backgroundColor: "var(--epsy-charcoal)",
                  color: "white",
                }}
              >
                Partner with us <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
