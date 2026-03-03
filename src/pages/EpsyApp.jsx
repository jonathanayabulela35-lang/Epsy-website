import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Library, Search, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabaseClient";
import { getSiteContent, updateSiteContent } from "@/lib/siteContentApi";

export default function EpsyApp() {
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
      options: { emailRedirectTo: window.location.origin + "/epsyapp?admin=1" },
    });
    if (error) toast.error(error.message);
    else toast.success("Magic link sent. Check your email.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out.");
  };

  // Load "epsyapp" content JSON
  const { data: pageContent = {}, isLoading } = useQuery({
    queryKey: ["siteContent", "epsyapp"],
    queryFn: async () => await getSiteContent("epsyapp"),
  });

  // View fallbacks
  const viewHeaderTitle = pageContent.header_title ?? "EpsyApp";
  const viewHeaderSubtitle =
    pageContent.header_subtitle ??
    "EpsyApp is a structured student cognitive literacy and psychological resilience platform. It is not a chatbot. It is not therapy. It is a structured thinking and learning system.";

  const viewFeatures =
    pageContent.features ?? [
      {
        key: "library",
        title: "Psychological Insight Library",
        description:
          "Content curated and uploaded by Epsy covering real challenges students face.",
        details: [
          "Topics: Bullying, imposter syndrome, exam anxiety, friend groups, gifts and talents, procrastination, fear of failure",
          "Each topic includes: Why this happens, How to reframe, If you ignore, If you act, Practical steps",
          "Daily Execution shows visible day-by-day growth, with detailed depth inside each specific day",
        ],
      },
      {
        key: "decoder",
        title: "Question Decoder",
        description:
          "Content uploaded by Epsy to help students understand how exam questions are built.",
        details: [
          "Includes past paper examples",
          "Explains how exam questions are framed",
          "Embedded sections: How to Respond, How to Remember the Response",
        ],
      },
      {
        key: "builder",
        title: "Question Builder",
        description:
          "Structured guidance created by Epsy to help students ask clearer academic questions.",
        details: [
          "Step-by-step framework for building better questions",
          "Learn to identify what you actually need to know",
          "Develop critical thinking through question formation",
        ],
      },
    ];

  // Editor fields
  const [headerTitle, setHeaderTitle] = useState("");
  const [headerSubtitle, setHeaderSubtitle] = useState("");

  const [f1Title, setF1Title] = useState("");
  const [f1Desc, setF1Desc] = useState("");
  const [f1D1, setF1D1] = useState("");
  const [f1D2, setF1D2] = useState("");
  const [f1D3, setF1D3] = useState("");

  const [f2Title, setF2Title] = useState("");
  const [f2Desc, setF2Desc] = useState("");
  const [f2D1, setF2D1] = useState("");
  const [f2D2, setF2D2] = useState("");
  const [f2D3, setF2D3] = useState("");

  const [f3Title, setF3Title] = useState("");
  const [f3Desc, setF3Desc] = useState("");
  const [f3D1, setF3D1] = useState("");
  const [f3D2, setF3D2] = useState("");
  const [f3D3, setF3D3] = useState("");

  // Sync editor fields when content loads
  useEffect(() => {
    setHeaderTitle(pageContent.header_title ?? viewHeaderTitle);
    setHeaderSubtitle(pageContent.header_subtitle ?? viewHeaderSubtitle);

    const list =
      Array.isArray(pageContent.features) && pageContent.features.length
        ? pageContent.features
        : viewFeatures;

    setF1Title(list?.[0]?.title ?? "Psychological Insight Library");
    setF1Desc(list?.[0]?.description ?? "");
    setF1D1(list?.[0]?.details?.[0] ?? "");
    setF1D2(list?.[0]?.details?.[1] ?? "");
    setF1D3(list?.[0]?.details?.[2] ?? "");

    setF2Title(list?.[1]?.title ?? "Question Decoder");
    setF2Desc(list?.[1]?.description ?? "");
    setF2D1(list?.[1]?.details?.[0] ?? "");
    setF2D2(list?.[1]?.details?.[1] ?? "");
    setF2D3(list?.[1]?.details?.[2] ?? "");

    setF3Title(list?.[2]?.title ?? "Question Builder");
    setF3Desc(list?.[2]?.description ?? "");
    setF3D1(list?.[2]?.details?.[0] ?? "");
    setF3D2(list?.[2]?.details?.[1] ?? "");
    setF3D3(list?.[2]?.details?.[2] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageContent]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const next = {
        ...pageContent,
        header_title: headerTitle,
        header_subtitle: headerSubtitle,
        features: [
          {
            key: "library",
            title: f1Title,
            description: f1Desc,
            details: [f1D1, f1D2, f1D3].filter(Boolean),
          },
          {
            key: "decoder",
            title: f2Title,
            description: f2Desc,
            details: [f2D1, f2D2, f2D3].filter(Boolean),
          },
          {
            key: "builder",
            title: f3Title,
            description: f3Desc,
            details: [f3D1, f3D2, f3D3].filter(Boolean),
          },
        ],
      };
      await updateSiteContent("epsyapp", next);
      return true;
    },
    onSuccess: () => {
      toast.success("EpsyApp updated.");
      queryClient.invalidateQueries({ queryKey: ["siteContent", "epsyapp"] });
    },
    onError: (err) => {
      console.error(err);
      toast.error("Save failed.");
    },
  });

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const featureIcons = [Library, Search, MessageSquare];

  return (
    <div>
      {/* Admin panel (ONLY if ?admin=1) */}
      {showAdmin && (
        <div className="max-w-6xl mx-auto px-6 lg:px-12 pt-6">
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
                    EpsyApp editor
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

                <div className="grid gap-2 pt-3">
                  <div className="font-semibold" style={{ color: "var(--epsy-charcoal)" }}>
                    Feature 1
                  </div>
                  <Label>Title</Label>
                  <Input value={f1Title} onChange={(e) => setF1Title(e.target.value)} />
                  <Label>Description</Label>
                  <Input value={f1Desc} onChange={(e) => setF1Desc(e.target.value)} />
                  <Label>Bullet 1</Label>
                  <Input value={f1D1} onChange={(e) => setF1D1(e.target.value)} />
                  <Label>Bullet 2</Label>
                  <Input value={f1D2} onChange={(e) => setF1D2(e.target.value)} />
                  <Label>Bullet 3</Label>
                  <Input value={f1D3} onChange={(e) => setF1D3(e.target.value)} />
                </div>

                <div className="grid gap-2 pt-3">
                  <div className="font-semibold" style={{ color: "var(--epsy-charcoal)" }}>
                    Feature 2
                  </div>
                  <Label>Title</Label>
                  <Input value={f2Title} onChange={(e) => setF2Title(e.target.value)} />
                  <Label>Description</Label>
                  <Input value={f2Desc} onChange={(e) => setF2Desc(e.target.value)} />
                  <Label>Bullet 1</Label>
                  <Input value={f2D1} onChange={(e) => setF2D1(e.target.value)} />
                  <Label>Bullet 2</Label>
                  <Input value={f2D2} onChange={(e) => setF2D2(e.target.value)} />
                  <Label>Bullet 3</Label>
                  <Input value={f2D3} onChange={(e) => setF2D3(e.target.value)} />
                </div>

                <div className="grid gap-2 pt-3">
                  <div className="font-semibold" style={{ color: "var(--epsy-charcoal)" }}>
                    Feature 3
                  </div>
                  <Label>Title</Label>
                  <Input value={f3Title} onChange={(e) => setF3Title(e.target.value)} />
                  <Label>Description</Label>
                  <Input value={f3Desc} onChange={(e) => setF3Desc(e.target.value)} />
                  <Label>Bullet 1</Label>
                  <Input value={f3D1} onChange={(e) => setF3D1(e.target.value)} />
                  <Label>Bullet 2</Label>
                  <Input value={f3D2} onChange={(e) => setF3D2(e.target.value)} />
                  <Label>Bullet 3</Label>
                  <Input value={f3D3} onChange={(e) => setF3D3(e.target.value)} />
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

      {/* Header */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--epsy-off-white)" }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold mb-6"
            style={{ color: "var(--epsy-charcoal)" }}
          >
            {viewHeaderTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-lg leading-relaxed"
            style={{ color: "var(--epsy-slate-blue)" }}
          >
            {viewHeaderSubtitle}
          </motion.p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="space-y-8">
            {viewFeatures.map((feature, index) => {
              const Icon = featureIcons[index] || Library;
              return (
                <motion.div
                  key={feature.key || index}
                  {...fadeInUp}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="p-8 lg:p-10 rounded-2xl"
                  style={{ backgroundColor: "var(--epsy-off-white)" }}
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "var(--epsy-sky-blue)" }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--epsy-charcoal)" }}>
                        {feature.title}
                      </h3>
                      <p className="text-base mb-4 leading-relaxed" style={{ color: "var(--epsy-slate-blue)" }}>
                        {feature.description}
                      </p>
                      <ul className="space-y-2">
                        {(feature.details || []).map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div
                              className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                              style={{ backgroundColor: "var(--epsy-sky-blue)" }}
                            />
                            <span className="text-sm leading-relaxed" style={{ color: "var(--epsy-slate-blue)" }}>
                              {detail}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}