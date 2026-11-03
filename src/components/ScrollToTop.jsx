import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Sends every newly navigated page to the top, wherever the previous page
 * was scrolled to. Mount once, inside the Router.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
