import { supabase } from "@/lib/supabaseClient";

const BUCKET = "gallery";
const TABLE = "gallery_images";

export async function loadGalleryImages() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("order", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function uploadGalleryImage(file, caption, order) {
  // 1) upload file to storage
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = fileName;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  // 2) get public URL
  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  const image_url = publicUrlData.publicUrl;

  // 3) insert row into table
  const { data, error: insertError } = await supabase
    .from(TABLE)
    .insert([{ image_url, caption, order }])
    .select()
    .single();

  if (insertError) throw insertError;
  return data;
}

export async function deleteGalleryImage(row) {
  // remove storage object if possible
  try {
    const url = row.image_url || "";
    const idx = url.indexOf(`/storage/v1/object/public/${BUCKET}/`);
    if (idx !== -1) {
      const path = url.substring(idx + `/storage/v1/object/public/${BUCKET}/`.length);
      await supabase.storage.from(BUCKET).remove([path]);
    }
  } catch {
    // ignore storage delete failures
  }

  const { error } = await supabase.from(TABLE).delete().eq("id", row.id);
  if (error) throw error;
}

export async function saveGalleryOrder(imagesInOrder) {
  // imagesInOrder: array of rows in the final order
  const updates = imagesInOrder.map((img, i) => ({ id: img.id, order: i }));

  const { error } = await supabase.from(TABLE).upsert(updates, { onConflict: "id" });
  if (error) throw error;
}
