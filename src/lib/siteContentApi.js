import { supabase } from "@/lib/supabaseClient";

export async function getSiteContent(key) {
  const { data, error } = await supabase
    .from("site_content")
    .select("key, content")
    .eq("key", key)
    .single();

  if (error) throw error;
  return data?.content ?? {};
}

export async function updateSiteContent(key, content) {
  const { error } = await supabase
    .from("site_content")
    .upsert(
      { key, content, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

  if (error) throw error;
  return true;
}