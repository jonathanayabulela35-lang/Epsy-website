import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  CheckCircle,
  GripVertical,
  Copy,
  Trash2,
  Plus,
  Minus,
  Type,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

import { supabase } from "@/lib/supabaseClient";
import { getSiteContent, updateSiteContent } from "@/lib/siteContentApi";

import AdminBar from "@/components/admin/AdminBar";
import InlineText from "@/components/admin/InlineText";
import SectionBackgroundControls from "@/components/admin/SectionBackgroundControls.jsx";
import {
  getSectionBackgroundData,
  getSectionBackgroundStyle,
} from "@/components/admin/sectionBackground";

function encode(data) {
  return new URLSearchParams(data).toString();
}

export default function Contact() {
  const queryClient = useQueryClient();

  const showAdmin = useMemo(() => {
    return new URLSearchParams(window.location.search).get("admin") === "1";
  }, []);

  const ADMIN_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || "ayabulelaplatana126@gmail.com";

  const { data: contactContent = {} } = useQuery({
    queryKey: ["siteContent", "contact"],
    queryFn: async () => await getSiteContent("contact"),
  });

  const { data: sessionData } = useQuery({
    queryKey: ["authSession"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: 1000 * 10,
  });

  const isAdmin =
    showAdmin &&
    sessionData?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const oldView = {
    header_title: contactContent.header_title ?? "Contact",
    header_subtitle:
      contactContent.header_subtitle ??
      "Send us a message and we’ll get back to you.",

    form_title: contactContent.form_title ?? "Send a message",
    details_title: contactContent.details_title ?? "Contact details",

    email: contactContent.email ?? "hello@epsy.org.za",
    phone: contactContent.phone ?? "+27 00 000 0000",
    location: contactContent.location ?? "South Africa",

    email_link:
      contactContent.email_link ??
      `mailto:${contactContent.email ?? "hello@epsy.org.za"}`,
    phone_link:
      contactContent.phone_link ??
      `tel:${String(contactContent.phone ?? "+27 00 000 0000").replace(
        /\s+/g,
        ""
      )}`,
    location_link: contactContent.location_link ?? "",
  };

  const sections = useMemo(() => {
    const s = contactContent.sections;
    if (Array.isArray(s) && s.length) return s;

    return [
      {
        id: "header",
        type: "header",
        data: {
          header_title: oldView.header_title,
          header_subtitle: oldView.header_subtitle,
          background_type: "color",
          background_color: "var(--epsy-off-white)",
          background_image: "",
          background_overlay: 0.35,
        },
      },
      {
        id: "contact_layout",
        type: "contact_layout",
        data: {
          form_title: oldView.form_title,
          details_title: oldView.details_title,
          email: oldView.email,
          email_link: oldView.email_link,
          phone: oldView.phone,
          phone_link: oldView.phone_link,
          location: oldView.location,
          location_link: oldView.location_link || "",
          background_type: "none",
          background_color: "",
          background_image: "",
          background_overlay: 0.35,
        },
      },
    ];
  }, [contactContent.sections, oldView]);

  const saveSections = async (nextSections) => {
    const next = { ...contactContent, sections: nextSections };
    await updateSiteContent("contact", next);
    queryClient.invalidateQueries({ queryKey: ["siteContent", "contact"] });
  };

  const saveSectionField = async (sectionId, field, value) => {
    const nextSections = sections.map((s) =>
      s.id === sectionId ? { ...s, data: { ...s.data, [field]: value } } : s
    );
    await saveSections(nextSections);
  };

  const updateSectionData = async (sectionId, patch) => {
    const nextSections = sections.map((s) =>
      s.id === sectionId ? { ...s, data: { ...s.data, ...patch } } : s
    );
    await saveSections(nextSections);
  };

  const dragIdRef = useRef(null);

  const onDragStart = (id) => {
    dragIdRef.current = id;
  };

  const onDropOn = async (targetId) => {
    const draggedId = dragIdRef.current;
    dragIdRef.current = null;

    if (!draggedId || draggedId === targetId) return;

    const current = [...sections];
    const fromIndex = current.findIndex((s) => s.id === draggedId);
    const toIndex = current.findIndex((s) => s.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);

    try {
      await saveSections(current);
      toast.success("Section moved");
    } catch (e) {
      console.error(e);
      toast.error("Move failed");
    }
  };

  const duplicateSection = async (id) => {
    const current = [...sections];
    const idx = current.findIndex((s) => s.id === id);
    if (idx === -1) return;

    const src = current[idx];
    const cloned = {
      ...src,
      id: `${src.type}_${Date.now()}`,
      data: JSON.parse(JSON.stringify(src.data || {})),
    };

    current.splice(idx + 1, 0, cloned);

    try {
      await saveSections(current);
      toast.success("Section duplicated");
    } catch (e) {
      console.error(e);
      toast.error("Duplicate failed");
    }
  };

  const deleteSection = async (id) => {
    if (sections.length <= 1) {
      toast.error("You must keep at least one section.");
      return;
    }

    const current = sections.filter((s) => s.id !== id);

    try {
      await saveSections(current);
      toast.success("Section deleted");
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
  };

  const makeSection = (type) => {
    const id = `${type}_${Date.now()}`;

    if (type === "header") {
      return {
        id,
        type: "header",
        data: {
          header_title: "Contact",
          header_subtitle: "Send us a message and we’ll get back to you.",
          background_type: "color",
          background_color: "var(--epsy-off-white)",
          background_image: "",
          background_overlay: 0.35,
        },
      };
    }

    if (type === "contact_layout") {
      return {
        id,
        type: "contact_layout",
        data: {
          form_title: "Send a message",
          details_title: "Contact details",
          email: "hello@epsy.org.za",
          email_link: "mailto:hello@epsy.org.za",
          phone: "+27 00 000 0000",
          phone_link: "tel:+27000000000",
          location: "South Africa",
          location_link: "",
          background_type: "none",
          background_color: "",
          background_image: "",
          background_overlay: 0.35,
        },
      };
    }

    if (type === "text") {
      return {
        id,
        type: "text",
        data: {
          title: "Section title…",
          body: "Write your text here…",
          background_type: "none",
          background_color: "",
          background_image: "",
          background_overlay: 0.35,
        },
      };
    }

    if (type === "divider") {
      return {
        id,
        type: "divider",
        data: {
          background_type: "none",
          background_color: "",
          background_image: "",
          background_overlay: 0.35,
        },
      };
    }

    if (type === "spacer") {
      return {
        id,
        type: "spacer",
        data: {
          height: 48,
          background_type: "none",
          background_color: "",
          background_image: "",
          background_overlay: 0.35,
        },
      };
    }

    return {
      id,
      type: "text",
      data: {
        title: "Section",
        body: "",
        background_type: "none",
        background_color: "",
        background_image: "",
        background_overlay: 0.35,
      },
    };
  };

  const addSection = async (type) => {
    const current = [...sections, makeSection(type)];
    try {
      await saveSections(current);
      toast.success("Section added");
    } catch (e) {
      console.error(e);
      toast.error("Add section failed");
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({ "form-name": "contact", ...formData }),
      });

      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error("Contact form submission failed:", err);
      alert("Sorry — something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const SectionControls = ({ section }) => {
    if (!isAdmin) return null;

    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-6">
        <div className="flex items-center justify-end gap-2">
          <div
            className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={() => onDragStart(section.id)}
            style={{
              borderColor: "rgba(15,30,36,0.12)",
              backgroundColor: "rgba(250,251,249,0.85)",
              color: "var(--epsy-charcoal)",
            }}
            title="Drag to move section"
          >
            <GripVertical className="h-4 w-4" />
            <span className="text-xs font-medium">Drag</span>
          </div>

          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => duplicateSection(section.id)}
            title="Duplicate section"
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>

          <Button
            variant="destructive"
            className="rounded-2xl"
            onClick={() => deleteSection(section.id)}
            title="Delete section"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    );
  };

  const AdminAddBar = () => {
    if (!isAdmin) return null;

    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-6">
        <div
          className="rounded-3xl border p-4 flex flex-wrap gap-2 items-center"
          style={{
            borderColor: "rgba(15,30,36,0.12)",
            backgroundColor: "rgba(250,251,249,0.85)",
          }}
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl"
            style={{ color: "var(--epsy-charcoal)" }}
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-semibold">Add section</span>
          </div>

          <Button
            className="rounded-2xl"
            variant="outline"
            onClick={() => addSection("header")}
          >
            Add Header
          </Button>

          <Button
            className="rounded-2xl"
            variant="outline"
            onClick={() => addSection("contact_layout")}
          >
            Add Contact Layout
          </Button>

          <Button
            className="rounded-2xl"
            variant="outline"
            onClick={() => addSection("text")}
          >
            <Type className="h-4 w-4 mr-2" />
            Add Text
          </Button>

          <Button
            className="rounded-2xl"
            variant="outline"
            onClick={() => addSection("divider")}
          >
            <Minus className="h-4 w-4 mr-2" />
            Add Divider
          </Button>

          <Button
            className="rounded-2xl"
            variant="outline"
            onClick={() => addSection("spacer")}
          >
            Add Spacer
          </Button>
        </div>
      </div>
    );
  };

  const LinkEditor = ({ label, value, placeholder, onSave }) => {
    const [draft, setDraft] = useState(value || "");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      setDraft(value || "");
    }, [value]);

    if (!isAdmin) return null;

    const handleSave = async () => {
      try {
        setSaving(true);
        await onSave((draft || "").trim());
        toast.success("Saved");
      } catch (err) {
        console.error(err);
        toast.error("Save failed");
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="mt-2">
        <div className="text-xs mb-1" style={{ color: "rgba(15,30,36,0.65)" }}>
          {label}
        </div>

        <div className="flex gap-2 items-center">
          <Input
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
          />

          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>

        <div className="text-xs mt-1" style={{ color: "rgba(15,30,36,0.55)" }}>
          Tip: For maps, paste a Google Maps link.
        </div>
      </div>
    );
  };

  const renderSection = (section) => {
    const bgData = getSectionBackgroundData(section);
    const bgStyle = getSectionBackgroundStyle(section);

    if (section.type === "header") {
      const d = section.data || {};
      const title = d.header_title ?? "Contact";
      const subtitle =
        d.header_subtitle ?? "Send us a message and we’ll get back to you.";

      return (
        <div
          onDragOver={(e) => isAdmin && e.preventDefault()}
          onDrop={() => isAdmin && onDropOn(section.id)}
        >
          <SectionControls section={section} />
          <SectionBackgroundControls
            section={section}
            isAdmin={isAdmin}
            onChange={(patch) => updateSectionData(section.id, patch)}
          />

          <section
            className="py-20 lg:py-28 relative overflow-hidden"
            style={
              bgData.backgroundType === "color"
                ? bgStyle
                : bgData.backgroundType === "none"
                ? { backgroundColor: "var(--epsy-off-white)" }
                : {}
            }
          >
            {bgData.backgroundType === "image" && (
              <>
                <div className="absolute inset-0" style={bgStyle} />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: "black",
                    opacity: bgData.backgroundOverlay,
                  }}
                />
              </>
            )}

            <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <InlineText
                  enabled={isAdmin}
                  as="h1"
                  value={title}
                  onSave={(v) => saveSectionField(section.id, "header_title", v)}
                  className="text-4xl lg:text-5xl font-bold mb-4"
                  style={{
                    color:
                      bgData.backgroundType === "image"
                        ? "white"
                        : "var(--epsy-charcoal)",
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <InlineText
                  enabled={isAdmin}
                  as="p"
                  multiLine
                  value={subtitle}
                  onSave={(v) =>
                    saveSectionField(section.id, "header_subtitle", v)
                  }
                  className="text-lg leading-relaxed"
                  style={{
                    color:
                      bgData.backgroundType === "image"
                        ? "rgba(255,255,255,0.9)"
                        : "var(--epsy-slate-blue)",
                  }}
                />
              </motion.div>
            </div>
          </section>
        </div>
      );
    }

    if (section.type === "contact_layout") {
      const d = section.data || {};

      const formTitle = d.form_title ?? "Send a message";
      const detailsTitle = d.details_title ?? "Contact details";

      const email = d.email ?? "hello@epsy.org.za";
      const emailLink = d.email_link ?? `mailto:${email}`;

      const phone = d.phone ?? "+27 00 000 0000";
      const phoneLink = d.phone_link ?? `tel:${String(phone).replace(/\s+/g, "")}`;

      const location = d.location ?? "South Africa";
      const locationLink = d.location_link ?? "";

      const contactInfo = [
        {
          key: "email",
          icon: Mail,
          title: "Email",
          detail: email,
          link: emailLink,
          detailField: "email",
          linkField: "email_link",
        },
        {
          key: "phone",
          icon: Phone,
          title: "Phone",
          detail: phone,
          link: phoneLink,
          detailField: "phone",
          linkField: "phone_link",
        },
        {
          key: "location",
          icon: MapPin,
          title: "Location",
          detail: location,
          link: locationLink || "",
          detailField: "location",
          linkField: "location_link",
        },
      ];

      return (
        <div
          onDragOver={(e) => isAdmin && e.preventDefault()}
          onDrop={() => isAdmin && onDropOn(section.id)}
        >
          <SectionControls section={section} />
          <SectionBackgroundControls
            section={section}
            isAdmin={isAdmin}
            onChange={(patch) => updateSectionData(section.id, patch)}
          />

          <form
            name="contact"
            data-netlify="true"
            netlify-honeypot="bot-field"
            hidden
          >
            <input name="bot-field" />
            <input type="text" name="name" />
            <input type="email" name="email" />
            <textarea name="message" />
          </form>

          <section
            className="py-16 lg:py-24 relative overflow-hidden"
            style={
              bgData.backgroundType === "color"
                ? bgStyle
                : bgData.backgroundType === "none"
                ? { backgroundColor: "white" }
                : {}
            }
          >
            {bgData.backgroundType === "image" && (
              <>
                <div className="absolute inset-0" style={bgStyle} />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: "black",
                    opacity: bgData.backgroundOverlay,
                  }}
                />
              </>
            )}

            <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
              <motion.div {...fadeInUp}>
                <Card
                  className="p-8 rounded-2xl border-0 shadow-sm"
                  style={{
                    backgroundColor:
                      bgData.backgroundType === "image"
                        ? "rgba(250,251,249,0.94)"
                        : "var(--epsy-off-white)",
                  }}
                >
                  <InlineText
                    enabled={isAdmin}
                    as="h2"
                    value={formTitle}
                    onSave={(v) =>
                      saveSectionField(section.id, "form_title", v)
                    }
                    className="text-2xl font-bold mb-6"
                    style={{ color: "var(--epsy-charcoal)" }}
                  />

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <input type="hidden" name="form-name" value="contact" />
                    <p hidden>
                      <label>
                        Don’t fill this out:{" "}
                        <input name="bot-field" onChange={() => {}} />
                      </label>
                    </p>

                    <div>
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium mb-2 block"
                        style={{ color: "var(--epsy-charcoal)" }}
                      >
                        Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium mb-2 block"
                        style={{ color: "var(--epsy-charcoal)" }}
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="message"
                        className="text-sm font-medium mb-2 block"
                        style={{ color: "var(--epsy-charcoal)" }}
                      >
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Tell us what you need..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full py-6 rounded-2xl font-semibold"
                      style={{
                        backgroundColor: "var(--epsy-sky-blue)",
                        color: "var(--epsy-charcoal)",
                      }}
                    >
                      {loading ? "Sending..." : "Send message"}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>

                    {submitted && (
                      <div
                        className="flex items-center justify-center gap-2 text-sm font-medium mt-2"
                        style={{ color: "var(--epsy-slate-blue)" }}
                      >
                        <CheckCircle className="h-4 w-4" /> Message sent!
                      </div>
                    )}
                  </form>
                </Card>
              </motion.div>

              <motion.div
                {...fadeInUp}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card
                  className="p-8 rounded-2xl border-0 shadow-sm"
                  style={{
                    backgroundColor:
                      bgData.backgroundType === "image"
                        ? "rgba(250,251,249,0.94)"
                        : "var(--epsy-off-white)",
                  }}
                >
                  <InlineText
                    enabled={isAdmin}
                    as="h2"
                    value={detailsTitle}
                    onSave={(v) =>
                      saveSectionField(section.id, "details_title", v)
                    }
                    className="text-2xl font-bold mb-6"
                    style={{ color: "var(--epsy-charcoal)" }}
                  />

                  <div className="space-y-6">
                    {contactInfo.map((info) => {
                      const Icon = info.icon;

                      const onSaveDetail = async (v) => {
                        await saveSectionField(section.id, info.detailField, v);

                        if (info.key === "email") {
                          const auto = `mailto:${v}`;
                          if (
                            !emailLink ||
                            String(emailLink).startsWith("mailto:")
                          ) {
                            await saveSectionField(
                              section.id,
                              info.linkField,
                              auto
                            );
                          }
                        }

                        if (info.key === "phone") {
                          const auto = `tel:${String(v).replace(/\s+/g, "")}`;
                          if (
                            !phoneLink ||
                            String(phoneLink).startsWith("tel:")
                          ) {
                            await saveSectionField(
                              section.id,
                              info.linkField,
                              auto
                            );
                          }
                        }
                      };

                      return (
                        <div key={info.key} className="flex items-start gap-4">
                          <div
                            className="h-10 w-10 rounded-2xl flex items-center justify-center"
                            style={{
                              backgroundColor: "rgba(12,192,223,0.20)",
                            }}
                          >
                            <Icon
                              className="h-5 w-5"
                              style={{ color: "var(--epsy-sky-blue)" }}
                            />
                          </div>

                          <div className="flex-1">
                            <div
                              className="font-medium mb-1"
                              style={{ color: "var(--epsy-charcoal)" }}
                            >
                              {info.title}
                            </div>

                            {info.link ? (
                              <a
                                href={info.link}
                                className="text-sm hover:underline"
                                style={{ color: "var(--epsy-slate-blue)" }}
                              >
                                <InlineText
                                  enabled={isAdmin}
                                  as="span"
                                  value={info.detail}
                                  onSave={onSaveDetail}
                                  style={{ display: "inline-block" }}
                                />
                              </a>
                            ) : (
                              <InlineText
                                enabled={isAdmin}
                                as="div"
                                value={info.detail}
                                onSave={onSaveDetail}
                                className="text-sm"
                                style={{ color: "var(--epsy-slate-blue)" }}
                              />
                            )}

                            <LinkEditor
                              label="Link"
                              value={info.link}
                              placeholder={
                                info.key === "email"
                                  ? "mailto:hello@epsy.org.za"
                                  : info.key === "phone"
                                  ? "tel:+27000000000"
                                  : "https://maps.google.com/..."
                              }
                              onSave={async (v) => {
                                if (info.key === "location") {
                                  await saveSectionField(
                                    section.id,
                                    info.linkField,
                                    v || ""
                                  );
                                } else {
                                  await saveSectionField(
                                    section.id,
                                    info.linkField,
                                    v
                                  );
                                }
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            </div>
          </section>
        </div>
      );
    }

    if (section.type === "text") {
      const d = section.data || {};
      const title = d.title ?? "Section title…";
      const body = d.body ?? "Write your text here…";

      return (
        <div
          onDragOver={(e) => isAdmin && e.preventDefault()}
          onDrop={() => isAdmin && onDropOn(section.id)}
        >
          <SectionControls section={section} />
          <SectionBackgroundControls
            section={section}
            isAdmin={isAdmin}
            onChange={(patch) => updateSectionData(section.id, patch)}
          />

          <section
            className="py-16 lg:py-24 relative overflow-hidden"
            style={
              bgData.backgroundType === "color"
                ? bgStyle
                : bgData.backgroundType === "none"
                ? { backgroundColor: "white" }
                : {}
            }
          >
            {bgData.backgroundType === "image" && (
              <>
                <div className="absolute inset-0" style={bgStyle} />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: "black",
                    opacity: bgData.backgroundOverlay,
                  }}
                />
              </>
            )}

            <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center relative z-10">
              <InlineText
                enabled={isAdmin}
                as="h2"
                value={title}
                onSave={(v) => saveSectionField(section.id, "title", v)}
                className="text-3xl lg:text-4xl font-bold mb-6"
                style={{
                  color:
                    bgData.backgroundType === "image"
                      ? "white"
                      : "var(--epsy-charcoal)",
                }}
              />
              <InlineText
                enabled={isAdmin}
                as="p"
                multiLine
                value={body}
                onSave={(v) => saveSectionField(section.id, "body", v)}
                className="text-lg leading-relaxed"
                style={{
                  color:
                    bgData.backgroundType === "image"
                      ? "rgba(255,255,255,0.9)"
                      : "var(--epsy-slate-blue)",
                }}
              />
            </div>
          </section>
        </div>
      );
    }

    if (section.type === "divider") {
      return (
        <div
          onDragOver={(e) => isAdmin && e.preventDefault()}
          onDrop={() => isAdmin && onDropOn(section.id)}
        >
          <SectionControls section={section} />
          <SectionBackgroundControls
            section={section}
            isAdmin={isAdmin}
            onChange={(patch) => updateSectionData(section.id, patch)}
          />

          <div
            className="max-w-7xl mx-auto px-6 lg:px-12 py-6 relative overflow-hidden"
            style={bgData.backgroundType === "color" ? bgStyle : {}}
          >
            {bgData.backgroundType === "image" && (
              <>
                <div className="absolute inset-0" style={bgStyle} />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: "black",
                    opacity: bgData.backgroundOverlay,
                  }}
                />
              </>
            )}
            <div className="relative z-10">
              <div
                className="h-px w-full"
                style={{
                  backgroundColor:
                    bgData.backgroundType === "image"
                      ? "rgba(255,255,255,0.35)"
                      : "rgba(15,30,36,0.10)",
                }}
              />
            </div>
          </div>
        </div>
      );
    }

    if (section.type === "spacer") {
      const h = Number(section.data?.height ?? 48);
      return (
        <div
          onDragOver={(e) => isAdmin && e.preventDefault()}
          onDrop={() => isAdmin && onDropOn(section.id)}
        >
          <SectionControls section={section} />
          <SectionBackgroundControls
            section={section}
            isAdmin={isAdmin}
            onChange={(patch) => updateSectionData(section.id, patch)}
          />

          <div
            className="relative overflow-hidden"
            style={
              bgData.backgroundType === "color"
                ? { ...bgStyle, height: Math.max(12, Math.min(h, 240)) }
                : { height: Math.max(12, Math.min(h, 240)) }
            }
          >
            {bgData.backgroundType === "image" && (
              <>
                <div className="absolute inset-0" style={bgStyle} />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: "black",
                    opacity: bgData.backgroundOverlay,
                  }}
                />
              </>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        onDragOver={(e) => isAdmin && e.preventDefault()}
        onDrop={() => isAdmin && onDropOn(section.id)}
      >
        <SectionControls section={section} />
        <SectionBackgroundControls
          section={section}
          isAdmin={isAdmin}
          onChange={(patch) => updateSectionData(section.id, patch)}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
          <div
            className="rounded-3xl border p-6"
            style={{ borderColor: "rgba(15,30,36,0.12)" }}
          >
            <div
              className="font-semibold"
              style={{ color: "var(--epsy-charcoal)" }}
            >
              Unknown section type
            </div>
            <div className="text-sm" style={{ color: "var(--epsy-slate-blue)" }}>
              type: {section.type}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <AdminBar
        show={showAdmin}
        redirectPathWithAdmin="/contact?admin=1"
        adminEmail={ADMIN_EMAIL}
      />

      <AdminAddBar />

      {sections.map((section) => (
        <div key={section.id}>{renderSection(section)}</div>
      ))}
    </div>
  );
}