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
            className="max-w-3xl mx-auto space-y-6 text-base sm:text-lg leading-8 sm:leading-9 text-left"
            style={{ color: "var(--epsy-charcoal)" }}
          >
            <p>
              Everyday Psychology NPO "Epsy" is a South African non-profit organisation focused on developing psychological awareness and resilience among young people and students. We exist to help young people understand how their thinking shapes their behaviour, decisions, and overall life outcomes. 
            </p>

            <p>
              Epsy aims to equip young people students with the ability to view both life and academics through a psychological perspective that encourages intentional thinking, self-awareness, and disciplined responses to everyday challenges. Rather than only addressing problems after they arise, Epsy focuses on preparing young people mentally before they encounter pressure, setbacks, or critical life decisions.
            </p>
            
            <p>
              Our work is primarily for students in high school and tertiary institutions, a stage where identity, habits, and mental patterns are being formed. Through structured psychological content published through our social media channels, and official application “EpsyApp” Epsy aims to help them navigate challenges such as academic pressure, self-doubt, fear of rejection, fear of failure, social dynamics, personal growth and more.
            </p>

            <p>
              The approach priorities practical application than theoretical. It breaks down psychological principles into clear, usable frameworks that students can apply daily. By doing so, Everyday Psychology NPO aims to contribute in building a generation that is not only academically capable, but mostly mentally prepared, self-aware, and resilient in the face of real-life demands.
            </p>
          </motion.p>
        </div>
      </section>

      {/* VISION & MISSION (BLUE) */}
      <section
        className="py-16 lg:py-20"
        style={{ backgroundColor: "#38B6FF" }}
      >
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

      {/* STORY (WHITE) */}
      <section
        className="py-16 lg:py-20"
        style={{ backgroundColor: "white" }}
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
              style={{ color: "var(--epsy-charcoal)" }}
            >
              The Psychological Perspective
            </h2>

            <div
              className="max-w-3xl mx-auto space-y-6 text-base sm:text-lg leading-8 sm:leading-9 text-left"
              style={{ color: "rgba(0,0,0,0.8)" }}
            >
              <p>
                The Psychological Perspective is at the core of Epsy’s mission. It is the lens through which we encourage young people to observe and interpret life, enabling them to respond with greater clarity, intention, and understanding. Rather than reacting impulsively, this perspective promotes thoughtful and reasonable responses to everyday situations.
              </p>

              <p>
                It serves both as a filter and a framework that helps young people process their experiences while guiding how they respond to them. In the face of challenges, pressure, and uncertainty, The Psychological Perspective encourages responses that are not only rational, but ultimately beneficial to one’s growth and long-term outcomes.
              </p>
          
              <p>
                This perspective can be applied across every sphere of a young person’s life, from academics and personal development to relationships and future careers. By adopting it, young people can gain an advantage: the ability to approach life with awareness, discipline, and a mindset that supports better decisions and stronger results.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MOTTO (BLUE) */}
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
              "It's All About Mentality."
            </h2>

            <div className="max-w-3xl mx-auto">
              <p
                className="text-base sm:text-lg leading-8 sm:leading-9 text-left"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                Your thinking shapes your decisions. Your decisions shape your actions. Your actions shape your outcomes. When you strengthen your mentality, you strengthen your foundation for everything that follows. This is why mentality matters, it's where everything begins.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
