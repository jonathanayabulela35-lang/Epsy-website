import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadSiteImage } from "@/lib/siteImageUpload";

export default function SectionBackgroundControls({
  section,
  isAdmin,
  onChange,
}) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  if (!isAdmin) return null;

  const d = section?.data || {};
  const backgroundType = d.background_type ?? "none";
  const backgroundColor = d.background_color ?? "";
  const backgroundImage = d.background_image ?? "";
  const backgroundOverlay =
    typeof d.background_overlay === "number" ? d.background_overlay : 0.35;
  const backgroundScrollEffect = d.background_scroll_effect ?? "normal";

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const publicUrl = await uploadSiteImage(file);
      onChange({
        background_type: "image",
        background_image: publicUrl,
      });
      toast.success("Image uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-3">
      <div
        className="rounded-3xl border p-4 grid gap-3"
        style={{
          borderColor: "rgba(15,30,36,0.12)",
          backgroundColor: "rgba(250,251,249,0.85)",
        }}
      >
        <div
          className="text-sm font-semibold"
          style={{ color: "var(--epsy-charcoal)" }}
        >
          Section background
        </div>

        <div className="grid gap-1">
          <Label>Background type</Label>
          <select
            className="h-10 rounded-xl border px-3"
            style={{
              borderColor: "rgba(15,30,36,0.12)",
              color: "var(--epsy-charcoal)",
              backgroundColor: "white",
            }}
            value={backgroundType}
            onChange={(e) =>
              onChange({
                background_type: e.target.value,
              })
            }
          >
            <option value="none">None</option>
            <option value="color">Color</option>
            <option value="image">Image</option>
          </select>
        </div>

        {backgroundType === "color" && (
          <div className="grid gap-1">
            <Label>Background color</Label>
            <Input
              value={backgroundColor || ""}
              placeholder="#ffffff"
              onChange={(e) =>
                onChange({
                  background_color: e.target.value,
                })
              }
            />
          </div>
        )}

        {backgroundType === "image" && (
          <>
            <div className="grid gap-2">
              <Label>Upload image</Label>

              <div className="flex flex-wrap gap-2 items-center">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                  id={`bg-upload-${section?.id || "section"}`}
                />

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() =>
                    document
                      .getElementById(`bg-upload-${section?.id || "section"}`)
                      ?.click()
                  }
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload Image"}
                </Button>
              </div>
            </div>

            <div className="grid gap-1">
              <Label>Background image URL</Label>
              <Input
                value={backgroundImage}
                placeholder="Paste an image URL or upload an image"
                onChange={(e) =>
                  onChange({
                    background_image: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid gap-1">
              <Label>Background scroll effect</Label>
              <select
                className="h-10 rounded-xl border px-3"
                style={{
                  borderColor: "rgba(15,30,36,0.12)",
                  color: "var(--epsy-charcoal)",
                  backgroundColor: "white",
                }}
                value={backgroundScrollEffect}
                onChange={(e) =>
                  onChange({
                    background_scroll_effect: e.target.value,
                  })
                }
              >
                <option value="normal">Normal</option>
                <option value="fixed">Fixed / parallax-style</option>
              </select>
              <div
                className="text-xs"
                style={{ color: "rgba(15,30,36,0.60)" }}
              >
                Fixed creates the effect of scrolling over the background image.
                On some mobile browsers it may fall back to normal behavior.
              </div>
            </div>

            <div className="grid gap-1">
              <Label>Overlay darkness</Label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={backgroundOverlay}
                onChange={(e) =>
                  onChange({
                    background_overlay: Number(e.target.value),
                  })
                }
              />
              <div
                className="text-xs"
                style={{ color: "rgba(15,30,36,0.60)" }}
              >
                Use values between 0 and 1. Example: 0.35
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}