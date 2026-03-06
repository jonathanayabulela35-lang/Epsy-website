import { supabase } from "@/lib/supabaseClient";

export async function uploadSiteImage(file) {
  if (!file) throw new Error("No file selected");

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = `backgrounds/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("site-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from("site-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}