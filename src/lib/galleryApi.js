import { supabase } from "./supabaseClient";

const BUCKET = "gallery";

export async function fetchGalleryImages() {
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("order", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Convert image_path -> image_url for your UI
  return (data ?? []).map((row) => {
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(row.image_path);
    return {
      id: row.id,
      image_url: pub.publicUrl,
      caption: row.caption ?? "",
      order: row.order ?? 0,
      image_path: row.image_path, // keep for deletes
    };
  });
}

export async function uploadGalleryImage(file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `gallery/${Date.now()}_${safeName}`;

  // 1) Upload file to storage
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (upErr) throw upErr;

  // 2) Insert DB row
  const { data: inserted, error: insErr } = await supabase
    .from("gallery_images")
    .insert({
      image_path: path,
      caption: file.name.replace(/\.[^/.]+$/, ""),
      order: null,
    })
    .select("*")
    .single();

  if (insErr) throw insErr;

  return inserted;
}

export async function deleteGalleryImage(rowId, imagePath) {
  // 1) Delete from storage
  const { error: storErr } = await supabase.storage
    .from(BUCKET)
    .remove([imagePath]);

  if (storErr) throw storErr;

  // 2) Delete DB row
  const { error: dbErr } = await supabase
    .from("gallery_images")
    .delete()
    .eq("id", rowId);

  if (dbErr) throw dbErr;

  return true;
}

export async function updateGalleryOrder(items) {
  // items = [{id, order}, ...]
  const updates = items.map((it) => ({ id: it.id, order: it.order }));
  const { error } = await supabase.from("gallery_images").upsert(updates);
  if (error) throw error;
  return true;
}

export async function updateGalleryCaption(id, caption) {
  const { data, error } = await supabase
    .from("gallery_images")
    .update({ caption })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}