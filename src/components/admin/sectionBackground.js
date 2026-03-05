export function getSectionBackgroundData(section) {
  const d = section?.data || {};

  return {
    backgroundType: d.background_type ?? "none",
    backgroundColor: d.background_color ?? "",
    backgroundImage: d.background_image ?? "",
    backgroundOverlay:
      typeof d.background_overlay === "number"
        ? d.background_overlay
        : 0.35,
  };
}

export function getSectionBackgroundStyle(section) {
  const { backgroundType, backgroundColor, backgroundImage } =
    getSectionBackgroundData(section);

  if (backgroundType === "color") {
    return {
      backgroundColor: backgroundColor || "transparent",
    };
  }

  if (backgroundType === "image") {
    return {
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }

  return {};
}