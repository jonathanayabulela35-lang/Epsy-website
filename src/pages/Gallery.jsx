import React, { useMemo } from "react";
import { motion } from "framer-motion";

const IMAGES = [
  { id: 1, image_url: "/assets/gallery/img1.jpg", order: 1 },
  { id: 2, image_url: "/assets/gallery/img2.jpg", order: 2 },
  { id: 3, image_url: "/assets/gallery/img3.jpg", order: 3 },
  { id: 4, image_url: "/assets/gallery/img4.jpg", order: 4 },
  { id: 5, image_url: "/assets/gallery/img5.jpg", order: 5 },
  { id: 6, image_url: "/assets/gallery/img6.jpg", order: 6 },
  { id: 7, image_url: "/assets/gallery/img7.jpg", order: 7 },
  { id: 8, image_url: "/assets/gallery/img8.jpeg", order: 8 },
  { id: 9, image_url: "/assets/gallery/img9.jpg", order: 9 },
  { id: 10, image_url: "/assets/gallery/img10.jpg", order: 10 },
];

const ROW_COUNT = 3;

/** Rotate a list so each row starts on a different image. */
function rotate(list, by) {
  if (list.length === 0) return list;
  const n = by % list.length;
  return [...list.slice(n), ...list.slice(0, n)];
}

function MarqueeRow({ images, direction, duration }) {
  // The set is rendered twice; the track slides by exactly half its width,
  // so the loop is seamless in both directions.
  const loop = [...images, ...images];

  return (
    <div className="marquee" role="group" aria-label="Gallery images">
      <div
        className={`marquee-track ${direction === "left" ? "to-left" : "to-right"}`}
        style={{ "--marquee-duration": `${duration}s` }}
      >
        {loop.map((img, i) => {
          const isClone = i >= images.length;
          return (
            <div
              key={`${img.id}-${i}`}
              className="shrink-0 pr-4 sm:pr-6"
              aria-hidden={isClone ? "true" : undefined}
            >
              <div
                className="w-64 sm:w-80 lg:w-[26rem] aspect-[4/3] rounded-3xl overflow-hidden bg-white/10 ring-1 ring-white/20"
                style={{ boxShadow: "0 18px 50px rgba(15,30,36,0.18)" }}
              >
                <img
                  src={img.image_url}
                  alt={isClone ? "" : "Everyday Psychology NPO (Epsy NPO) gallery photo"}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Gallery() {
  const view = {
    header_title: "Gallery",
    header_subtitle: "A look into some of our moments.",
  };

  const sorted = useMemo(
    () => [...IMAGES].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    []
  );

  const rows = useMemo(() => {
    if (sorted.length === 0) return [];
    const step = Math.max(1, Math.floor(sorted.length / ROW_COUNT));
    return Array.from({ length: ROW_COUNT }, (_, r) => ({
      id: r,
      // Row 1 goes right to left, row 2 left to right, row 3 right to left...
      direction: r % 2 === 0 ? "left" : "right",
      // Slightly different speeds keep the rows from moving in lockstep.
      duration: 70 + r * 12,
      images: rotate(sorted, r * step),
    }));
  }, [sorted]);

  return (
    <div className="epsy-page-gradient min-h-[calc(100vh-92px)]">
      <section className="pt-16 pb-10 lg:pt-24 lg:pb-14">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: "#FFFFFF" }}
          >
            {view.header_title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg leading-relaxed max-w-3xl mx-auto"
            style={{ color: "rgba(255,255,255,0.92)", textAlign: "center" }}
          >
            {view.header_subtitle}
          </motion.p>
        </div>
      </section>

      <section className="pb-16 lg:pb-24">
        {rows.length === 0 ? (
          <div
            className="text-center py-12"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            No images yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-6">
            {rows.map((row) => (
              <MarqueeRow
                key={row.id}
                images={row.images}
                direction={row.direction}
                duration={row.duration}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
