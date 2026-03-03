import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Target, Eye, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabaseClient";
import { getSiteContent, updateSiteContent } from "@/lib/siteContentApi";

export default function About() {
  const queryClient = useQueryClient();

  // Show admin UI only with ?admin=1
  const showAdmin = useMemo(() => {
    return new URLSearchParams(window.location.search).get("admin") === "1";
  }, []);

  const ADMIN_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || "ayabulelaplatana126@gmail.com";

  const [session, setSession] = useState(null);
  const [email, setEmail] = useState(ADMIN_EMAIL);

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
      email,
      options: { emailRedirectTo: window.location.origin + "/about?admin=1" },
    });

    if (error) toast.error(error.message);
    else toast.success("Magic link sent. Check your email.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out.");
  };

  // Load "about" content JSON
  const { data: aboutContent = {}, isLoading } = useQuery({
    queryKey: ["siteContent", "about"],
    queryFn: async () => await getSiteContent("about"),
  });

  // View values (fallbacks)
  const viewHeaderTitle = aboutContent.header_title ?? "Who We Are";
  const viewHeaderSubtitle =
    aboutContent.header_subtitle ??
    "Epsy is a non-profit organisation focused on psychological awareness and resilience.";

  const viewVisionTitle = aboutContent.vision_title ?? "Vision";
  const viewVisionText = aboutContent.vision_text ?? "To instill psychological resilience.";

  const viewMissionTitle = aboutContent.mission_title ?? "Mission";
  const viewMissionText = aboutContent.mission_text ?? "To raise psychological awareness.";

  const viewStoryTitle = aboutContent.story_title ?? "Our Story";
  const viewStoryP1 =
    aboutContent.story_p1 ??
    "Epsy was founded to help students develop a true and realistic understanding of life at its different stages. Many people are first defeated in their minds before they are defeated outwardly. Epsy exists to challenge that pattern.";
  const viewStoryP2 =
    aboutContent.story_p2 ??
    "We guide students to mentally prepare for the realities of growth, responsibility, pressure, success, and failure — so they are strengthened inwardly before life tests them outwardly.";

  const viewMottoTitle = aboutContent.motto_title ?? `"It's All About Mentality."`;
  const viewMottoText =
    aboutContent.motto_text ??
    "Your thinking shapes your decisions. Your decisions shape your actions. Your actions shape your outcomes. When you strengthen your mentality, you strengthen your foundation for everything that follows. This is why mentality matters — it's where everything begins.";

  // Admin editor state
  const [headerTitle, setHeaderTitle] = useState("");
  const [headerSubtitle, setHeaderSubtitle] = useState("");
  const [visionTitle, setVisionTitle] = useState("");
  const [visionText, setVisionText] = useState("");
  const [missionTitle, setMissionTitle] = useState("");
  const [missionText, setMissionText] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyP1, setStoryP1] = useState("");
  const [storyP2, setStoryP2] = useState("");
  const [mottoTitle, setMottoTitle] = useState("");
  const [mottoText, setMottoText] = useState("");

  // Sync editor fields when content loads
  useEffect(() => {
    setHeaderTitle(aboutContent.header_title ?? viewHeaderTitle);
    setHeaderSubtitle(aboutContent.header_subtitle ?? viewHeaderSubtitle);

    setVisionTitle(aboutContent.vision_title ?? viewVisionTitle);
    setVisionText(aboutContent.vision_text ?? viewVisionText);

    setMissionTitle(aboutContent.mission_title ?? viewMissionTitle);
    setMissionText(aboutContent.mission_text ?? viewMissionText);

    setStoryTitle(aboutContent.story_title ?? viewStoryTitle);
    setStoryP1(aboutContent.story_p1 ?? viewStoryP1);
    setStoryP2(aboutContent.story_p2 ?? viewStoryP2);

    setMottoTitle(aboutContent.motto_title ?? viewMottoTitle);
    setMottoText(aboutContent.motto_text ?? viewMottoText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aboutContent]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const next = {
        ...aboutContent,
        header_title: headerTitle,
        header_subtitle: headerSubtitle,

        vision_title: visionTitle,
        vision_text: visionText,

        mission_title: missionTitle,
        mission_text: missionText,

        story_title: storyTitle,
        story_p1: storyP1,
        story_p2: storyP2,

        motto_title: mottoTitle,
        motto_text: mottoText,
      };

      await updateSiteContent("about", next);
      return true;
    },
    onSuccess: () => {
      toast.success("About updated.");
      queryClient.invalidateQueries({ queryKey: ["siteContent", "about"] });
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
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
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
                    About editor
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
                    <Label>Vision title</Label>
                    <Input value={visionTitle} onChange={(e) => setVisionTitle(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Vision text</Label>
                    <Input value={visionText} onChange={(e) => setVisionText(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Mission title</Label>
                    <Input value={missionTitle} onChange={(e) => setMissionTitle(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Mission text</Label>
                    <Input value={missionText} onChange={(e) => setMissionText(e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Story title</Label>
                  <Input value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Story paragraph 1</Label>
                  <Input value={storyP1} onChange={(e) => setStoryP1(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Story paragraph 2</Label>
                  <Input value={storyP2} onChange={(e) => setStoryP2(e.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label>Motto title</Label>
                  <Input value={mottoTitle} onChange={(e) => setMottoTitle(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Motto text</Label>
                  <Input value={mottoText} onChange={(e) => setMottoText(e.target.value)} />
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

      {/* Vision & Mission */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div {...fadeInUp} className="p-10 rounded-2xl" style={{ backgroundColor: "var(--epsy-off-white)" }}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: "var(--epsy-sky-blue)" }}>
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--epsy-charcoal)" }}>
                {viewVisionTitle}
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: "var(--epsy-slate-blue)" }}>
                {viewVisionText}
              </p>
            </motion.div>

            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="p-10 rounded-2xl"
              style={{ backgroundColor: "var(--epsy-off-white)" }}
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: "var(--epsy-sky-blue)" }}>
                <Target className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--epsy-charcoal)" }}>
                {viewMissionTitle}
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: "var(--epsy-slate-blue)" }}>
                {viewMissionText}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: "var(--epsy-off-white)" }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeInUp}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 mx-auto" style={{ backgroundColor: "var(--epsy-sky-blue)" }}>
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-center" style={{ color: "var(--epsy-charcoal)" }}>
              {viewStoryTitle}
            </h2>
            <div className="space-y-6 text-lg leading-relaxed" style={{ color: "var(--epsy-slate-blue)" }}>
              <p>{viewStoryP1}</p>
              <p>{viewStoryP2}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Motto Explanation */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeInUp} className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6" style={{ color: "var(--epsy-charcoal)" }}>
              {viewMottoTitle}
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: "var(--epsy-slate-blue)" }}>
              {viewMottoText}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}