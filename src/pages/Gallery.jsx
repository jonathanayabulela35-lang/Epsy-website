import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, ChevronUp, ChevronDown, Save } from "lucide-react";
import { toast } from "sonner";

import {
  fetchGalleryImages,
  uploadGalleryImage,
  deleteGalleryImage,
  updateGalleryOrder,
  updateGalleryCaption,
} from "@/lib/galleryApi";

import { supabase } from "@/lib/supabaseClient";

export default function Gallery() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

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
      options: { emailRedirectTo: window.location.origin + "/gallery?admin=1" },
    });
    if (error) toast.error(error.message);
    else toast.success("Magic link sent. Check your email.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out.");
  };

  const { data: images = [], isLoading } = useQuery({
    queryKey: ["galleryImages"],
    queryFn: async () => {
      const list = await fetchGalleryImages();
      return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      setUploading(true);
      await uploadGalleryImage(file);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryImages"] });
      toast.success("Image uploaded.");
      setUploading(false);
    },
    onError: (err) => {
      console.error(err);
      setUploading(false);
      toast.error("Upload failed.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const img = images.find((i) => i.id === id);
      if (!img) return false;
      await deleteGalleryImage(img.id, img.image_path);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryImages"] });
      toast.success("Image deleted.");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Delete failed.");
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, newOrder }) => {
      const next = [...images];
      const idx = next.findIndex((i) => i.id === id);
      if (idx === -1) return false;

      next[idx] = { ...next[idx], order: newOrder };

      const normalized = next
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((img, i) => ({ ...img, order: i }));

      await updateGalleryOrder(normalized);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryImages"] });
    },
    onError: (err) => {
      console.error(err);
      toast.error("Reorder failed.");
    },
  });

  const captionMutation = useMutation({
    mutationFn: async ({ id, caption }) => {
      await updateGalleryCaption(id, caption);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryImages"] });
      toast.success("Caption saved.");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Caption save failed.");
    },
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  const moveImage = (index, direction) => {
    const sorted = [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sorted.length) return;

    const img1 = sorted[index];
    const img2 = sorted[newIndex];

    updateOrderMutation.mutate({ id: img1.id, newOrder: newIndex });
    updateOrderMutation.mutate({ id: img2.id, newOrder: index });
  };

  const sorted = useMemo(
    () => [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [images]
  );

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
                    Gallery admin
                  </div>
                  <div className="text-sm" style={{ color: "var(--epsy-slate-blue)" }}>
                    Signed in as: {session.user.email}
                  </div>
                </div>
                <Button variant="outline" className="rounded-2xl" onClick={signOut}>
                  Sign out
                </Button>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <Label
                  htmlFor="galleryUpload"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl cursor-pointer"
                  style={{ backgroundColor: "var(--epsy-sky-blue)", color: "var(--epsy-charcoal)" }}
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Add image"}
                </Label>
                <Input id="galleryUpload" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
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

      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--epsy-off-white)" }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: "var(--epsy-charcoal)" }}
          >
            Gallery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg leading-relaxed"
            style={{ color: "var(--epsy-slate-blue)" }}
          >
            A look into our moments and work.
          </motion.p>
        </div>
      </section>

      <section className="py-12 lg:py-16" style={{ backgroundColor: "white" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {isLoading ? (
            <div className="text-center py-12" style={{ color: "var(--epsy-slate-blue)" }}>
              Loading...
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-12" style={{ color: "var(--epsy-slate-blue)" }}>
              No images yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((img, index) => (
                <div
                  key={img.id}
                  className="rounded-3xl overflow-hidden border shadow-sm"
                  style={{ borderColor: "rgba(15,30,36,0.08)" }}
                >
                  <div className="aspect-[4/3] bg-slate-100">
                    <img
                      src={img.image_url}
                      alt={img.caption || "Gallery image"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    {showAdmin && isAdmin ? (
                      <div className="space-y-2">
                        <Label className="text-sm">Caption</Label>
                        <Input
                          defaultValue={img.caption || ""}
                          onBlur={(e) => {
                            const nextCaption = e.target.value?.trim() || "";
                            if ((img.caption || "") !== nextCaption) {
                              captionMutation.mutate({ id: img.id, caption: nextCaption });
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="font-medium" style={{ color: "var(--epsy-charcoal)" }}>
                        {img.caption || ""}
                      </div>
                    )}

                    {showAdmin && isAdmin && (
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="rounded-2xl"
                            onClick={() => moveImage(index, "up")}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="rounded-2xl"
                            onClick={() => moveImage(index, "down")}
                            disabled={index === sorted.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          size="icon"
                          variant="destructive"
                          className="rounded-2xl"
                          onClick={() => deleteMutation.mutate(img.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}