const STORAGE_KEY = "epsy_gallery_images_v1";

/**
 * Image shape:
 * { id: string, image_url: string, caption: string, order: number }
 */
export function loadGalleryImages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGalleryImages(images) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
}

export async function fileToDataUrl(file) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
