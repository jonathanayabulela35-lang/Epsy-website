import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

function encode(data) {
  return new URLSearchParams(data).toString();
}

export default function Contact() {
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
      // Netlify Forms submission
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
      detail: "hello@epsy.org.za",
      link: "mailto:hello@epsy.org.za",
    },
    {
      icon: Phone,
      title: "Phone",
      detail: "+27 00 000 0000",
      link: "tel:+27000000000",
    },
    {
      icon: MapPin,
      title: "Location",
      detail: "South Africa",
      link: null,
    },
  ];

  return (
    <div>
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
            Contact
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg leading-relaxed"
            style={{ color: "var(--epsy-slate-blue)" }}
          >
            Send us a message and we’ll get back to you.
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: "white" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <motion.div {...fadeInUp}>
            <Card className="p-8 rounded-2xl border-0 shadow-sm" style={{ backgroundColor: "var(--epsy-off-white)" }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--epsy-charcoal)" }}>
                Send a message
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
                Contact details
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
