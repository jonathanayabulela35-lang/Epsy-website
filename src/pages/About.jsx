import { motion } from "framer-motion";
import { Eye, Target, BookOpen } from "lucide-react";
import InlineText from "../components/InlineText";
import AdminBar from "../components/AdminBar";

export default function AboutPage({ sections, isLoading, bgData }) {
  const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } };

  const renderSection = (section, index) => {
    // Determine alternating section colors
    const isBlueSection = index % 2 === 0;
    const sectionBgColor = section.type !== "header" && section.type !== "footer"
      ? isBlueSection
        ? "#38B6FF"
        : "white"
      : undefined;

    // Text colors for readability
    const headingColor = isBlueSection ? "white" : "var(--epsy-charcoal)";
    const textColor = isBlueSection ? "rgba(255,255,255,0.9)" : "var(--epsy-slate-blue)";

    if (section.type === "header") {
      const { title = "Header Title", subtitle = "Subtitle here…" } = section.data || {};
      return (
        <div key={section.id}>
          <section className="py-16 lg:py-20 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 lg:px-12 relative z-10">
              <motion.div {...fadeInUp}>
                <InlineText
                  as="h1"
                  value={title}
                  className="text-4xl lg:text-5xl font-bold mb-6"
                  style={{ color: bgData.backgroundType === "image" ? "white" : "var(--epsy-charcoal)" }}
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}>
                <div className="max-w-3xl mx-auto">
                  <InlineText
                    as="p"
                    multiLine
                    value={subtitle}
                    className="text-base sm:text-lg leading-8 sm:leading-9 text-left"
                    style={{ color: bgData.backgroundType === "image" ? "rgba(255,255,255,0.9)" : "var(--epsy-slate-blue)" }}
                  />
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      );
    }

    if (section.type === "vision_mission") {
      const d = section.data || {};
      const visionTitle = d.vision_title ?? "Vision";
      const visionText = d.vision_text ?? "To instill psychological resilience.";
      const missionTitle = d.mission_title ?? "Mission";
      const missionText = d.mission_text ?? "To raise psychological awareness.";

      return (
        <section
          key={section.id}
          className="py-16 lg:py-20 relative overflow-hidden"
          style={{ backgroundColor: sectionBgColor }}
        >
          <div className="max-w-6xl mx-auto px-6 lg:px-12 relative z-10">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div {...fadeInUp} className="p-8 lg:p-10 rounded-2xl" style={{ backgroundColor: "rgba(250,251,249,0.92)" }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: "var(--epsy-sky-blue)" }}>
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <InlineText as="h2" value={visionTitle} className="text-2xl font-bold mb-4" style={{ color: headingColor }} />
                <InlineText as="p" multiLine value={visionText} className="text-base sm:text-lg leading-8 text-left" style={{ color: textColor }} />
              </motion.div>
              <motion.div {...fadeInUp} transition={{ delay: 0.1, duration: 0.6 }} className="p-8 lg:p-10 rounded-2xl" style={{ backgroundColor: "rgba(250,251,249,0.92)" }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: "var(--epsy-sky-blue)" }}>
                  <Target className="w-7 h-7 text-white" />
                </div>
                <InlineText as="h2" value={missionTitle} className="text-2xl font-bold mb-4" style={{ color: headingColor }} />
                <InlineText as="p" multiLine value={missionText} className="text-base sm:text-lg leading-8 text-left" style={{ color: textColor }} />
              </motion.div>
            </div>
          </div>
        </section>
      );
    }

    if (section.type === "story") {
      const d = section.data || {};
      const storyTitle = d.story_title ?? "Our Story";
      const p1 = d.story_p1 ?? "Paragraph 1…";
      const p2 = d.story_p2 ?? "Paragraph 2…";

      return (
        <section key={section.id} className="py-16 lg:py-20 relative overflow-hidden" style={{ backgroundColor: sectionBgColor }}>
          <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10">
            <motion.div {...fadeInUp}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 mx-auto" style={{ backgroundColor: "var(--epsy-sky-blue)" }}>
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <InlineText as="h2" value={storyTitle} className="text-3xl lg:text-4xl font-bold mb-8 text-center" style={{ color: headingColor }} />
              <div className="max-w-3xl mx-auto space-y-6 text-base sm:text-lg leading-8 sm:leading-9 text-left">
                <InlineText as="p" multiLine value={p1} style={{ color: textColor }} />
                <InlineText as="p" multiLine value={p2} style={{ color: textColor }} />
              </div>
            </motion.div>
          </div>
        </section>
      );
    }

    if (section.type === "motto") {
      const d = section.data || {};
      const title = d.motto_title ?? `"It's All About Mentality."`;
      const text = d.motto_text ?? "Motto explanation…";

      return (
        <section key={section.id} className="py-16 lg:py-20 relative overflow-hidden" style={{ backgroundColor: sectionBgColor }}>
          <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10">
            <motion.div {...fadeInUp} className="text-center">
              <InlineText as="h2" value={title} className="text-3xl lg:text-4xl font-bold mb-6" style={{ color: headingColor }} />
              <div className="max-w-3xl mx-auto">
                <InlineText as="p" multiLine value={text} className="text-base sm:text-lg leading-8 sm:leading-9 text-left" style={{ color: textColor }} />
              </div>
            </motion.div>
          </div>
        </section>
      );
    }

    if (section.type === "text") {
      const d = section.data || {};
      const title = d.title ?? "Section title…";
      const body = d.body ?? "Write your text here…";

      return (
        <section key={section.id} className="py-16 lg:py-20 relative overflow-hidden" style={{ backgroundColor: sectionBgColor }}>
          <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center relative z-10">
            <InlineText as="h2" value={title} className="text-3xl lg:text-4xl font-bold mb-6" style={{ color: headingColor }} />
            <div className="max-w-3xl mx-auto">
              <InlineText as="p" multiLine value={body} className="text-base sm:text-lg leading-8 sm:leading-9 text-left" style={{ color: textColor }} />
            </div>
          </div>
        </section>
      );
    }

    if (section.type === "divider") {
      return (
        <div key={section.id} className="max-w-7xl mx-auto px-6 lg:px-12 py-6 relative overflow-hidden" style={{ backgroundColor: sectionBgColor }}>
          <div className="relative z-10">
            <div className="h-px w-full" style={{ backgroundColor: "rgba(15,30,36,0.10)" }} />
          </div>
        </div>
      );
    }

    if (section.type === "spacer") {
      const h = Number(section.data?.height ?? 48);
      return (
        <div key={section.id} className="relative overflow-hidden" style={{ backgroundColor: sectionBgColor, height: Math.max(12, Math.min(h, 240)) }} />
      );
    }

    return (
      <div key={section.id} className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        <div className="rounded-3xl border p-6" style={{ borderColor: "rgba(15,30,36,0.12)" }}>
          <div className="font-semibold" style={{ color: "var(--epsy-charcoal)" }}>Unknown section type</div>
          <div className="text-sm" style={{ color: "var(--epsy-slate-blue)" }}>type: {section.type}</div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <AdminBar show={false} redirectPathWithAdmin="/about?admin=1" adminEmail={null} />

      {isLoading ? (
        <div style={{ minHeight: "60vh", backgroundColor: "var(--epsy-off-white)" }} />
      ) : (
        sections.map((section, idx) => renderSection(section, idx))
      )}
    </div>
  );
}
