import React from "react";
import { motion } from "framer-motion";
import { Library, Search, MessageSquare, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const APK_URL = "/downloads/epsyapp.apk";

export default function EpsyApp() {
  const defaultFeatures = [
    {
      key: "library",
      title: "Psychological Insight Library",
      description:
        "Content curated and uploaded by Epsy covering real challenges students face.",
      details: [
        "Topics: Bullying, imposter syndrome, exam anxiety, friend groups, gifts and talents, procrastination, fear of failure",
        "Each topic includes: Why this happens, How to reframe, If you ignore, If you act, Practical steps",
        "Daily Execution shows visible day-by-day growth, with detailed depth inside each specific day",
      ],
    },
    {
      key: "decoder",
      title: "Question Decoder",
      description:
        "Content uploaded by Epsy to help students understand how exam questions are built.",
      details: [
        "Includes past paper examples",
        "Explains how exam questions are framed",
        "Embedded sections: How to Respond, How to Remember the Response",
      ],
    },
    {
      key: "builder",
      title: "Question Builder",
      description:
        "Structured guidance created by Epsy to help students ask clearer academic questions.",
      details: [
        "Step-by-step framework for building better questions",
        "Learn to identify what you actually need to know",
        "Develop critical thinking through question formation",
      ],
    },
  ];

  const view = {
    header_title: "EpsyApp",
    header_subtitle:
      "EpsyApp is a structured student cognitive literacy and psychological resilience platform. It is not a chatbot. It is not therapy. It is a structured thinking and learning system.",
    features: defaultFeatures,
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const featureIcons = [Library, Search, MessageSquare];

  return (
    <div>
      {/* HEADER (UNCHANGED STRUCTURE) */}
      <section
        className="py-16 lg:py-20 relative overflow-hidden"
        style={{ backgroundColor: "var(--epsy-off-white)" }}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: "var(--epsy-charcoal)" }}
            >
              {view.header_title}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <div className="max-w-3xl mx-auto">
              <p
                className="text-base sm:text-lg leading-8 sm:leading-9 text-left md:text-center"
                style={{ color: "var(--epsy-slate-blue)" }}
              >
                {view.header_subtitle}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DOWNLOAD SECTION → BLUE */}
      <section
        className="py-10 lg:py-12 relative overflow-hidden"
        style={{ backgroundColor: "#38B6FF" }}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl p-8 lg:p-10 border shadow-sm"
            style={{
              backgroundColor: "rgba(250,251,249,0.92)",
              borderColor: "rgba(15,30,36,0.08)",
            }}
          >
            <h2
              className="text-3xl lg:text-4xl font-bold mb-8"
              style={{ color: "var(--epsy-charcoal)" }} // updated for visibility on blue
            >
              Download the EpsyApp
            </h2>

            <div className="flex justify-center">
              <a href={APK_URL}>
                <Button
                  className="px-8 py-6 text-base rounded-2xl font-semibold"
                  style={{
                    backgroundColor: "var(--epsy-charcoal)",
                    color: "white",
                  }}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download EpsyApp APK
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION → BLUE */}
      <section
        className="py-16 lg:py-20 relative overflow-hidden"
        style={{ backgroundColor: "#38B6FF" }} // changed from white → blue
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="space-y-8">
            {view.features.map((feature, index) => {
              const Icon = featureIcons[index] || Library;

              return (
                <motion.div
                  key={feature.key || index}
                  {...fadeInUp}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="p-8 lg:p-10 rounded-2xl"
                  style={{ backgroundColor: "var(--epsy-off-white)" }} // cards untouched
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "var(--epsy-sky-blue)" }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <div className="flex-1">
                      <h3
                        className="text-2xl font-bold mb-3"
                        style={{ color: "var(--epsy-charcoal)" }}
                      >
                        {feature.title}
                      </h3>

                      <div className="max-w-3xl">
                        <p
                          className="text-base leading-8 text-left"
                          style={{ color: "var(--epsy-slate-blue)" }}
                        >
                          {feature.description}
                        </p>
                      </div>

                      <ul className="space-y-3 pt-2">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div
                              className="w-1.5 h-1.5 rounded-full mt-3 flex-shrink-0"
                              style={{
                                backgroundColor: "var(--epsy-sky-blue)",
                              }}
                            />
                            <span
                              className="text-sm sm:text-base leading-7 text-left"
                              style={{ color: "var(--epsy-slate-blue)" }}
                            >
                              {detail}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
