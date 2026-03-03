import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabaseClient";
import { getSiteContent, updateSiteContent } from "@/lib/siteContentApi";

function encode(data) {
  return new URLSearchParams(data).toString();
}

export default function Contact() {
  const queryClient = useQueryClient();

  // Admin UI only with ?admin=1
  const showAdmin = useMemo(() => {
    return new URLSearchParams(window.location.search).get("admin") === "1";
  }, []);

  const ADMIN_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || "ayabulelaplatana126@gmail.com";

  const [session, setSession] = useState(null);
  const [emailLogin, setEmailLogin] = useState(ADMIN_EMAIL);

  const isAdmin =
    session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) =>
      setSession(newSession)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email: emailLogin,
      options: { emailRedirectTo: window.location.origin + "/contact?admin=1" },
    });
    if (error) toast.error(error.message);
    else toast.success("Magic link sent. Check your email.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out.");
  };

  // Load contact content JSON
  const { data: contactContent = {}, isLoading } = useQuery({
    queryKey: ["siteContent", "contact"],
    queryFn: async () => await getSiteContent("contact"),
  });

  // View fallbacks
  const viewHeaderTitle = contactContent.header_title ?? "Contact";
  const viewHeaderSubtitle =
    contactContent.header_subtitle ?? "Send us a message and we’ll get back to you.";

  const viewFormTitle = contactContent.form_title ?? "Send a message";
  const viewDetailsTitle = contactContent.details_title ?? "Contact details";

  const viewEmail = contactContent.email ?? "hello@epsy.org.za";
  const viewPhone = contactContent.phone ?? "+27 00 000 0000";
  const viewLocation = contactContent.location ?? "South Africa";

  const viewEmailLink = contactContent.email_link ?? `mailto:${viewEmail}`;
  const viewPhoneLink =
    contactContent.phone_link ??
    `tel:${String(viewPhone).replace(/\s+/g, "")}`;
  const viewLocationLink = contactContent.location_link ?? null;

  // Editor state (admin only)
  const [headerTitle, setHeaderTitle] = useState("");
  const [headerSubtitle, setHeaderSubtitle] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [detailsTitle, setDetailsTitle] = useState("");

  const [detailEmail, setDetailEmail] = useState("");
  const [detailEmailLink, setDetailEmailLink] = useState("");

  const [detailPhone, setDetailPhone] = useState("");
  const [detailPhoneLink, setDetailPhoneLink] = useState("");

  const [detailLocation, setDetailLocation] = useState("");
  const [detailLocationLink, setDetailLocationLink] = useState("");

  // Sync editor fields when content loads
  useEffect(() => {
    setHeaderTitle(contactContent.header_title ?? viewHeaderTitle);
    setHeaderSubtitle(contactContent.header_subtitle ?? viewHeaderSubtitle);
    setFormTitle(contactContent.form_title ?? viewFormTitle);
    setDetailsTitle(contactContent.details_title ?? viewDetailsTitle);

    setDetailEmail(contactContent.email ?? viewEmail);
    setDetailEmailLink(contactContent.email_link ?? viewEmailLink);

    setDetailPhone(contactContent.phone ?? viewPhone);
    setDetailPhoneLink(contactContent.phone_link ?? viewPhoneLink);

    setDetailLocation(contactContent.location ?? viewLocation);
    setDetailLocationLink(contactContent.location_link ?? viewLocationLink ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactContent]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const next = {
        ...contactContent,
        header_title: headerTitle,
        header_subtitle: headerSubtitle,
        form_title: formTitle,
        details_title: detailsTitle,

        email: detailEmail,
        email_link: detailEmailLink,

        phone: detailPhone,
        phone_link: detailPhoneLink,

        location: detailLocation,
        location_link: detailLocationLink || null,
      };
      await updateSiteContent("contact", next);
      return true;
    },
    onSuccess: () => {
      toast.success("Contact updated.");
      queryClient.invalidateQueries({ queryKey: ["siteContent", "contact"] });
    },
    onError: (err) => {
      console.error(err);
      toast.error("Save failed.");
    },
  });

  // Contact form state (Netlify Forms stays unchanged)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

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

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      detail: viewEmail,
      link: viewEmailLink,
    },
    {
      icon: Phone,
      title: "Phone",
      detail: viewPhone,
      link: viewPhoneLink,
    },
    {
      icon: MapPin,
      title: "Location",
      detail: viewLocation,
      link: viewLocationLink,
    },
  ];

  return (
    <div>
      {/* Admin panel (ONLY if ?admin=1) */}
      {showAdmin && (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-6">
          {!session ? (
            <div
              className="rounded-3xl border p-5 max-w-lg"
              style={{ borderColor: "rgba(15,30,36,0.12)" }}
            >
              <div className="font-semibold mb-3" style={{ color: "var(--epsy-charcoal)" }}>
                Admin login
              </div>
              <Label className="mb-2 block">Email</Label>
              <Input value={emailLogin} onChange={(e) => setEmailLogin(e.target.value)} />
              <Button className="mt-3 rounded-2xl" onClick={signIn}>
                Send magic link
              </Button>
            </div>
          ) : isAdmin ? (
            <div
              className="rounded-3xl border p-5"
              style={{ borderColor: "rgba(15,30,36,0.12)" }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold" style={{ color: "var(--epsy-charcoal)" }}>
                    Contact editor
                  </div>
                  <div className="text-sm" style={{ color: "var(--epsy-slate-blue)" }}>
                    Signed in as: {session.user.email}
                  </div>
                </div>
                <Button variant="outline" className="rounded-2xl" onClick={signOut}>
                  Sign out
                </Button>
              </div>

              <div className="grid gap-4 mt-5">
                <div className="grid gap-2">
                  <Label>Header title</Label>
                  <Input value={headerTitle} onChange={(e) => setHeaderTitle(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Header subtitle</Label>
                  <Input value={headerSubtitle} onChange={(e) => setHeaderSubtitle(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Form card title</Label>
                    <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Details card title</Label>
                    <Input value={detailsTitle} onChange={(e) => setDetailsTitle(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Email text</Label>
                    <Input value={detailEmail} onChange={(e) => setDetailEmail(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email link</Label>
                    <Input value={detailEmailLink} onChange={(e) => setDetailEmailLink(e.target.value)} />
                  </div>

                  <div className="grid gap-2">
                    <Label>Phone text</Label>
                    <Input value={detailPhone} onChange={(e) => setDetailPhone(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone link</Label>
                    <Input value={detailPhoneLink} onChange={(e) => setDetailPhoneLink(e.target.value)} />
                  </div>

                  <div className="grid gap-2">
                    <Label>Location text</Label>
                    <Input value={detailLocation} onChange={(e) => setDetailLocation(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Location link (optional)</Label>
                    <Input
                      value={detailLocationLink}
                      onChange={(e) => setDetailLocationLink(e.target.value)}
                      placeholder="Leave empty for no link"
                    />
                  </div>
                </div>

                <Button
                  className="rounded-2xl"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  style={{ backgroundColor: "var(--epsy-charcoal)", color: "white" }}
                >
                  {saveMutation.isPending ? "Saving..." : "Save changes"}
                </Button>

                {isLoading && (
                  <div className="text-sm" style={{ color: "var(--epsy-slate-blue)" }}>
                    Loading content…
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="rounded-3xl border p-5 max-w-lg"
              style={{ borderColor: "rgba(15,30,36,0.12)" }}
            >
              <div className="font-semibold mb-2" style={{ color: "var(--epsy-charcoal)" }}>
                Logged in, but not admin
              </div>
              <div className="text-sm" style={{ color: "var(--epsy-slate-blue)" }}>
                Signed in as: {session.user.email}
              </div>
            </div>
          )}
        </div>
      )}

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
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: "var(--epsy-charcoal)" }}
          >
            {viewHeaderTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg leading-relaxed"
            style={{ color: "var(--epsy-slate-blue)" }}
          >
            {viewHeaderSubtitle}
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: "white" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <motion.div {...fadeInUp}>
            <Card className="p-8 rounded-2xl border-0 shadow-sm" style={{ backgroundColor: "var(--epsy-off-white)" }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--epsy-charcoal)" }}>
                {viewFormTitle}
              </h2>

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

          <motion.div {...fadeInUp} transition={{ duration: 0.6, delay: 0.1 }}>
            <Card className="p-8 rounded-2xl border-0 shadow-sm" style={{ backgroundColor: "var(--epsy-off-white)" }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--epsy-charcoal)" }}>
                {viewDetailsTitle}
              </h2>

              <div className="space-y-6">
                {contactInfo.map((info) => {
                  const Icon = info.icon;
                  return (
                    <div key={info.title} className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(12,192,223,0.20)" }}>
                        <Icon className="h-5 w-5" style={{ color: "var(--epsy-sky-blue)" }} />
                      </div>
                      <div>
                        <div className="font-medium mb-1" style={{ color: "var(--epsy-charcoal)" }}>
                          {info.title}
                        </div>
                        {info.link ? (
                          <a href={info.link} className="text-sm hover:underline" style={{ color: "var(--epsy-slate-blue)" }}>
                            {info.detail}
                          </a>
                        ) : (
                          <div style={{ color: "var(--epsy-slate-blue)" }}>{info.detail}</div>
                        )}
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