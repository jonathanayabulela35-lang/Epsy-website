import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { fetchGalleryImages, uploadGalleryImage, deleteGalleryImage, updateGalleryOrder } from "@/lib/galleryApi";
import { supabase } from "@/lib/supabaseClient";

export default function Gallery() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // 🔐 ADMIN AUTH
  const ADMIN_EMAIL =
    import.meta.env.VITE_ADMIN_EMAIL || "ayabulelaplatana126@gmail.com";

  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession)
    );

    return () => sub.subscription.unsubscribe();
  }, []);

  const showAdminLogin =
    new URLSearchParams(window.location.search).get("admin") === "1";

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + "/gallery?admin=1",
      },
    });

    if (error) toast.error(error.message);
    else toast.success("Magic link sent. Check your email.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out.");
  };

  // 📦 FETCH IMAGES
  const { data: images = [], isLoading } = useQuery({
    queryKey: ["galleryImages"],
    queryFn: async () => {
      const list = await fetchGalleryImages();
      return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
  });

  // 📤 UPLOAD
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      setUploading(true);
      await uploadGalleryImage(file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryImages"] });
      toast.success("Image uploaded.");
      setUploading(false);
    },
    onError: (err) => {
      console.error(err);
      toast.error("Upload failed.");
      setUploading(false);
    },
  });

  // 🗑 DELETE
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const img = images.find((i) => i.id === id);
      if (!img) return;
      await deleteGalleryImage(img.id, img.image_path);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryImages"] });
      toast.success("Image deleted.");
    },
  });

  // 🔄 REORDER
  const updateOrderMutation = useMutation({
    mutationFn: async (normalized) => {
      await updateGalleryOrder(normalized);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryImages"] });
    },
  });

  const moveImage = (index, direction) => {
    const sorted = [...images].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sorted.length) return;

    const temp = sorted[index];
    sorted[index] = sorted[newIndex];
    sorted[newIndex] = temp;

    const normalized = sorted.map((img, i) => ({
      ...img,
      order: i,
    }));

    updateOrderMutation.mutate(normalized);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  const sorted = useMemo(
    () => [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [images]
  );

  return (
    <div>
      <section
        className="py-20 lg:py-28"
        style={{ backgroundColor: "var(--epsy-off-white)" }}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Gallery
          </motion.h1>
          <motion.p className="text-lg leading-relaxed">
            A look into our moments and work.
          </motion.p>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          {/* 🔐 ADMIN LOGIN (hidden unless ?admin=1) */}
          {showAdminLogin && !session && (
            <div className="mb-6 max-w-md">
              <Input
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button className="mt-3" onClick={signIn}>
                Send magic link
              </Button>
            </div>
          )}

          {isAdmin && (
            <div className="mb-6 flex gap-3">
              <Button onClick={() => setEditMode((v) => !v)}>
                {editMode ? "Exit edit mode" : "Edit mode"}
              </Button>
              <Button variant="outline" onClick={signOut}>
                Sign out
              </Button>
            </div>
          )}

          {isAdmin && editMode && (
            <div className="mb-6">
              <Label htmlFor="galleryUpload">
                <Upload className="inline w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Add image"}
              </Label>
              <Input
                id="galleryUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-12">
              {isAdmin
                ? "No images yet. Turn on Edit mode to add images."
                : ""}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((img, index) => (
                <div key={img.id} className="rounded-3xl overflow-hidden border shadow-sm">
                  <div className="aspect-[4/3] bg-slate-100">
                    <img
                      src={img.image_url}
                      alt={img.caption || "Gallery image"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {isAdmin && editMode && (
                    <div className="flex justify-between p-4">
                      <Button
                        size="icon"
                        onClick={() => moveImage(index, "up")}
                        disabled={index === 0}
                      >
                        <ChevronUp />
                      </Button>

                      <Button
                        size="icon"
                        onClick={() => moveImage(index, "down")}
                        disabled={index === sorted.length - 1}
                      >
                        <ChevronDown />
                      </Button>

                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(img.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}