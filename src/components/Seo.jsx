import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "https://epsy.org.za";
const NAME = "Everyday Psychology NPO (Epsy NPO)";
const OG_IMAGE = `${SITE}/assets/logo.jpg`;

/** Title and description for every route. Keep titles under ~60 characters. */
const ROUTES = {
  "/": {
    title: "Epsy NPO | Everyday Psychology NPO, South Africa",
    description:
      "Everyday Psychology NPO (Epsy NPO) is a South African non-profit raising psychological awareness and building resilience in young people and students. It's all about mentality.",
  },
  "/about": {
    title: "About Everyday Psychology NPO (Epsy) | Vision & Mission",
    description:
      "Learn about Everyday Psychology NPO (Epsy NPO): our vision to instil psychological resilience, our mission to raise psychological awareness, and the Psychological Perspective behind our work with South African students.",
  },
  "/partnerships": {
    title: "Partner With Epsy NPO | Everyday Psychology NPO",
    description:
      "Partner with Everyday Psychology NPO (Epsy NPO). We work with schools, youth development organisations and individual supporters to build psychological resilience in young people.",
  },
  "/gallery": {
    title: "Gallery | Everyday Psychology NPO (Epsy NPO)",
    description:
      "Photos from the work and events of Everyday Psychology NPO (Epsy NPO), a South African non-profit focused on psychological awareness and youth resilience.",
  },
  "/contact": {
    title: "Contact Epsy NPO | Everyday Psychology NPO",
    description:
      "Get in touch with Everyday Psychology NPO (Epsy NPO) about partnerships, volunteering or general enquiries.",
  },
  "/privacy": {
    title: "Privacy Policy | Everyday Psychology NPO (Epsy NPO)",
    description:
      "Privacy policy for the Everyday Psychology NPO (Epsy NPO) website.",
  },
};

const NOT_FOUND = {
  title: "Page not found | Everyday Psychology NPO (Epsy NPO)",
  description: "This page could not be found.",
};

function setMeta(selector, create, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(el.tagName === "LINK" ? "href" : "content", value);
}

const metaByName = (name, value) =>
  setMeta(
    `meta[name="${name}"]`,
    () => Object.assign(document.createElement("meta"), { name }),
    value
  );

const metaByProp = (property, value) =>
  setMeta(
    `meta[property="${property}"]`,
    () => {
      const m = document.createElement("meta");
      m.setAttribute("property", property);
      return m;
    },
    value
  );

/**
 * Updates the title, description, canonical URL, social tags and robots
 * directive whenever the route changes. Mount once, inside the Router.
 */
export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
    const known = ROUTES[path];
    const page = known || NOT_FOUND;
    const url = known ? `${SITE}${path === "/" ? "/" : path}` : SITE + "/";

    document.title = page.title;
    metaByName("description", page.description);
    metaByName("robots", known ? "index, follow, max-image-preview:large" : "noindex, follow");

    setMeta(
      'link[rel="canonical"]',
      () => Object.assign(document.createElement("link"), { rel: "canonical" }),
      url
    );

    metaByProp("og:title", page.title);
    metaByProp("og:description", page.description);
    metaByProp("og:url", url);
    metaByProp("og:site_name", NAME);
    metaByProp("og:image", OG_IMAGE);
    metaByName("twitter:title", page.title);
    metaByName("twitter:description", page.description);
    metaByName("twitter:image", OG_IMAGE);
  }, [pathname]);

  return null;
}
