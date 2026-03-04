import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabaseClient";
import { getSiteContent, updateSiteContent } from "@/lib/siteContentApi";

import AdminBar from "@/components/admin/AdminBar";
import InlineText from "@/components/admin/InlineText";

function encode(data) {
  return new URLSearchParams(data).toString();
}

export default function Contact() {
  const queryClient = useQueryClient();

  // admin mode only with ?admin=1
  const showAdmin = useMemo(() => {
    return new URLSearchParams(window.location.search).get("admin") === "1";
  }, []);

  const ADMIN_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || "ayabulelaplatana126@gmail.com";

  // Load contact content JSON
  const { data: contactContent = {} } = useQuery({
    queryKey: ["siteContent", "contact"],
    queryFn: async () => await getSiteContent("contact"),
  });

  // session for enabling inline editing
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

  // View fallbacks
  const view = {
    header_title: contactContent.header_title ?? "Contact",
    header_subtitle:
      contactContent.header_subtitle ?? "Send us a message and we’ll get back to you.",

    form_title: contactContent.form_title ?? "Send a message",
    details_title: contactContent.details_title ?? "Contact details",

    email: contactContent.email ?? "hello@epsy.org.za",
    phone: contactContent.phone ?? "+27 00 000 0000",
    location: contactContent.location ?? "South Africa",

    email_link: contactContent.email_link ?? `mailto:${contactContent.email ?? "hello@epsy.org.za"}`,
    phone_link:
      contactContent.phone_link ??
      `tel:${String(contactContent.phone ?? "+27 00 000 0000").replace(/\s+/g, "")}`,
    location_link: contactContent.location_link ?? "",
  };

  const saveField = async (field, value) => {
    const next = { ...contactContent, [field]: value };
    await updateSiteContent("contact", next);
    queryClient.invalidateQueries({ queryKey: ["siteContent", "contact"] });
  };

  // Contact form state (Netlify Forms)
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
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

  const contactInfo = [
    {
      key: "email",
      icon: Mail,
      title: "Email",
      detail: view.email,
      link: view.email_link,
      detailField: "email",
      linkField: "email_link",
      defaultLink: (v) => `mailto:${v}`,
    },
    {
      key: "phone",
      icon: Phone,
      title: "Phone",
      detail: view.phone,
      link: view.phone_link,
      detailField: "phone",
      linkField: "phone_link",
      defaultLink: (v) => `tel:${String(v).replace(/\s+/g, "")}`,
    },
    {
      key: "location",
      icon: MapPin,
      title: "Location",
      detail: view.location,
      link: view.location_link || "",
      detailField: "location",
      linkField: "location_link",
      defaultLink: () => "", // optional
    },
  ];

  const LinkEditor = ({ label, value, onSave, placeholder }) => {
    if (!isAdmin) return null;
    return (
      <div className="mt-2">
        <div className="text-xs mb-1" style={{ color: "rgba(15,30,36,0.65)" }}>
          {label}
        </div>
        <Input
          defaultValue={value || ""}
          placeholder={placeholder}
          onBlur={(e) => onSave(e.target.value.trim())}
        />
        <div className="text-xs mt-1" style={{ color: "rgba(15,30,36,0.55)" }}>
          Tip: For maps, paste a Google Maps link.
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Admin bar */}
      <AdminBar
        show={showAdmin}
        redirectPathWithAdmin="/contact?admin=1"
        adminEmail={ADMIN_EMAIL}
      />

      {/* Hidden form for Netlify build-time detection */}
      <form name="contact" data-netlify="true" netlify-honeypot="bot-field" hidden>
        <input name="bot-field" />
        <input type="text" name="name" />
        <input type="email" name="email" />
        <textarea name="message" />
      </form>

      {/* Header */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--epsy-off-white)" }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <InlineText
              enabled={isAdmin}
              as="h1"
              value={view.header_title}
              onSave={(v) => saveField("header_title", v)}
              className="text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: "var(--epsy-charcoal)" }}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <InlineText
              enabled={isAdmin}
              as="p"
              value={view.header_subtitle}
              onSave={(v) => saveField("header_subtitle", v)}
              className="text-lg leading-relaxed"
              style={{ color: "var(--epsy-slate-blue)" }}
            />
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: "white" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Form */}
          <motion.div {...fadeInUp}>
            <Card className="p-8 rounded-2xl border-0 shadow-sm" style={{ backgroundColor: "var(--epsy-off-white)" }}>
              <InlineText
                enabled={isAdmin}
                as="h2"
                value={view.form_title}
                onSave={(v) => saveField("form_title", v)}
                className="text-2xl font-bold mb-6"
                style={{ color: "var(--epsy-charcoal)" }}
              />

              {/* Visitor form (NOT inline editable) */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <input type="hidden" name="form-name" value="contact" />
                <p hidden>
                  <label>
                    Don’t fill this out: <input name="bot-field" onChange={() => {}} />
                  </label>
                </p>

                <div>
                  <Label htmlFor="name" className="text-sm font-medium mb-2 block" style={{ color: "var(--epsy-charcoal)" }}>
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
                  <Label htmlFor="email" className="text-sm font-medium mb-2 block" style={{ color: "var(--epsy-charcoal)" }}>
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
                  <Label htmlFor="message" className="text-sm font-medium mb-2 block" style={{ color: "var(--epsy-charcoal)" }}>
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
                  style={{ backgroundColor: "var(--epsy-sky-blue)", color: "var(--epsy-charcoal)" }}
                >
                  {loading ? "Sending..." : "Send message"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>

                {submitted && (
                  <div className="flex items-center justify-center gap-2 text-sm font-medium mt-2" style={{ color: "var(--epsy-slate-blue)" }}>
                    <CheckCircle className="h-4 w-4" /> Message sent!
                  </div>
                )}
              </form>
            </Card>
          </motion.div>

          {/* Details */}
          <motion.div {...fadeInUp} transition={{ duration: 0.6, delay: 0.1 }}>
            <Card className="p-8 rounded-2xl border-0 shadow-sm" style={{ backgroundColor: "var(--epsy-off-white)" }}>
              <InlineText
                enabled={isAdmin}
                as="h2"
                value={view.details_title}
                onSave={(v) => saveField("details_title", v)}
                className="text-2xl font-bold mb-6"
                style={{ color: "var(--epsy-charcoal)" }}
              />

              <div className="space-y-6">
                {contactInfo.map((info) => {
                  const Icon = info.icon;

                  // If admin changes the DETAIL, we also auto-fix email/tel link if they kept the default format
                  const onSaveDetail = async (v) => {
                    await saveField(info.detailField, v);

                    // auto-update link for email/phone if link is empty or looks auto-generated
                    if (info.key === "email") {
                      const auto = `mailto:${v}`;
                      if (!view.email_link || view.email_link.startsWith("mailto:")) {
                        await saveField(info.linkField, auto);
                      }
                    }
                    if (info.key === "phone") {
                      const auto = `tel:${String(v).replace(/\s+/g, "")}`;
                      if (!view.phone_link || view.phone_link.startsWith("tel:")) {
                        await saveField(info.linkField, auto);
                      }
                    }
                  };

                  return (
                    <div key={info.key} className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(12,192,223,0.20)" }}>
                        <Icon className="h-5 w-5" style={{ color: "var(--epsy-sky-blue)" }} />
                      </div>

                      <div className="flex-1">
                        <div className="font-medium mb-1" style={{ color: "var(--epsy-charcoal)" }}>
                          {info.title}
                        </div>

                        {/* Detail value (inline editable) */}
                        {info.link ? (
                          <a href={info.link} className="text-sm hover:underline" style={{ color: "var(--epsy-slate-blue)" }}>
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

                        {/* Link editor (admin only, because you can’t “see” a link) */}
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
                            // allow empty to remove location link
                            if (info.key === "location") {
                              await saveField(info.linkField, v || "");
                            } else {
                              await saveField(info.linkField, v);
                            }
                            toast.success("Saved");
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