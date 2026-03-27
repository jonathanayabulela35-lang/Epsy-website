import React from "react";
import { motion } from "framer-motion";
import { Target, Eye, BookOpen } from "lucide-react";

export default function About() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <div>
      {/* HEADER SECTION (BLUE) */}
      <section
        className="py-16 lg:py-20"
        style={{ backgroundColor: "#38B6FF" }}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-bold mb-6"
            style={{ color: "#FFFFFF" }}
          >
            Who We Are
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base sm:text-lg leading-8 sm:leading-9 text-left max-w-3xl mx-auto"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            Epsy is a non-profit organisation focused on psychological awareness and resilience.
          </motion.p>
        </div>
      </section>

      {/* FIRST SECTION → WHITE */}
      <section className="py-16 lg:py-20" style={{ backgroundColor: "white" }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              {...fadeInUp}
              className="p-8 lg:p-10 rounded-2xl"
              style={{ backgroundColor: "var(--epsy-off-white)" }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: "var(--epsy-sky-blue)" }}
              >
                <Eye className="w-7 h-7 text-white" />
              </div>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "var(--epsy-charcoal)" }}
              >
                Vision
              </h2>

              <p
                className="text-base sm:text-lg leading-8 text-left"
                style={{ color: "var(--epsy-slate-blue)" }}
              >
                To instill psychological resilience.
              </p>
            </motion.div>

            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="p-8 lg:p-10 rounded-2xl"
              style={{ backgroundColor: "var(--epsy-off-white)" }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: "var(--epsy-sky-blue)" }}
              >
                <Target className="w-7 h-7 text-white" />
              </div>

              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "var(--epsy-charcoal)" }}
              >
                Mission
              </h2>

              <p
                className="text-base sm:text-lg leading-8 text-left"
                style={{ color: "var(--epsy-slate-blue)" }}
              >
                To raise psychological awareness.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECOND SECTION → BLUE (CARDS BACKGROUND COLOR REMAINS SAME) */}
      <section
        className="py-16 lg:py-20"
        style={{ backgroundColor: "#38B6FF" }}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeInUp}>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 mx-auto"
              style={{ backgroundColor: "var(--epsy-sky-blue)" }}
            >
              <BookOpen className="w-7 h-7 text-white" />
            </div>

            <h2
              className="text-3xl lg:text-4xl font-bold mb-8 text-center"
              style={{ color: "#FFFFFF" }}
            >
              Our Story
            </h2>

            <div
              className="max-w-3xl mx-auto space-y-6 text-base sm:text-lg leading-8 sm:leading-9 text-left"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              <p>
                Epsy was founded to help students develop a true and realistic understanding of life at its different stages. Many people are first defeated in their minds before they are defeated outwardly. Epsy exists to challenge that pattern.
              </p>

              <p>
                We guide students to mentally prepare for the realities of growth, responsibility, pressure, success, and failure — so they are strengthened inwardly before life tests them outwardly.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* THIRD SECTION → WHITE */}
      <section className="py-16 lg:py-20" style={{ backgroundColor: "white" }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div {...fadeInUp}>
            <h2
              className="text-3xl lg:text-4xl font-bold mb-6"
              style={{ color: "var(--epsy-charcoal)" }}
            >
              "It's All About Mentality."
            </h2>

            <div className="max-w-3xl mx-auto">
              <p
                className="text-base sm:text-lg leading-8 sm:leading-9 text-left"
                style={{ color: "var(--epsy-slate-blue)" }}
              >
                Your thinking shapes your decisions. Your decisions shape your actions. Your actions shape your outcomes. When you strengthen your mentality, you strengthen your foundation for everything that follows. This is why mentality matters — it's where everything begins.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOURTH SECTION → BLUE */}
      <section
        className="py-16 lg:py-20"
        style={{ backgroundColor: "#38B6FF" }}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div {...fadeInUp}>
            <h2
              className="text-3xl lg:text-4xl font-bold mb-6"
              style={{ color: "#FFFFFF" }}
            >
              Next Steps
            </h2>

            <div className="max-w-3xl mx-auto">
              <p
                className="text-base sm:text-lg leading-8 sm:leading-9 text-left"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                Join us on our journey to foster psychological resilience and awareness in communities across the globe. Together, we can make a lasting impact.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
