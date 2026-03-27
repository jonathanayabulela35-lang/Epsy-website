import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import { fetchGalleryImages } from "@/lib/galleryApi";

export default function Gallery() {
  const view = {
    header_title: "Gallery",
    header_subtitle: "A look into our moments and work.",
  };

  const { data: images = [], isLoading } = useQuery({
    queryKey: ["galleryImages"],
    queryFn: async () => {
      const list = await fetchGalleryImages();
      return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
  });

  const sorted = useMemo(
    () => [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [images]
  );

  return (
    <div>
      {/* HEADER (UNCHANGED STRUCTURE) */}
      <section
        className="py-20 lg:py-28"
        style={{ backgroundColor: "var(--epsy-off-white)" }}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: "var(--epsy-charcoal)" }}
            >
              {view.header_title}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p
              className="text-lg leading-relaxed"
              style={{ color: "var(--epsy-slate-blue)" }}
            >
              {view.header_subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* GALLERY SECTION → BLUE */}
      <section
        className="py-12 lg:py-16"
        style={{ backgroundColor: "#38B6FF" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {isLoading ? (
            <div
              className="text-center py-12"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              Loading...
            </div>
          ) : sorted.length === 0 ? (
            <div
              className="text-center py-12"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              No images yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((img) => (
                <div
                  key={img.id}
                  className="rounded-3xl overflow-hidden border shadow-sm"
                  style={{ borderColor: "rgba(15,30,36,0.08)" }}
                >
                  <div className="aspect-[4/3] bg-slate-100">
                    <img
                      src={img.image_url}
                      alt={img.caption || "Gallery image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
