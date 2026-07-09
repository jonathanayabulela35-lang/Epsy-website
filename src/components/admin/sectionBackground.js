export function getSectionBackgroundData(section) {
  const d = section?.data || {};

  return {
    backgroundType: d.background_type ?? "none",
    backgroundColor: d.background_color ?? "",
    backgroundImage: d.background_image ?? "",
    backgroundScrollEffect: d.background_scroll_effect ?? "normal",
    backgroundOverlay:
      typeof d.background_overlay === "number"
        ? d.background_overlay
        : 0.35,
  };
}

function shouldUseFixedBackground() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 1024px)").matches;
}

export function getSectionBackgroundStyle(section) {
  const {
    backgroundType,
    backgroundColor,
    backgroundImage,
    backgroundScrollEffect,
  } = getSectionBackgroundData(section);

  if (backgroundType === "color") {
    return {
      backgroundColor: backgroundColor || "transparent",
    };
  }

  if (backgroundType === "image") {
    const useFixed =
      backgroundScrollEffect === "fixed" && shouldUseFixedBackground();

    return {
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: useFixed ? "fixed" : "scroll",
    };
  }

  return {};
}