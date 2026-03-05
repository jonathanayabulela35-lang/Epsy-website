import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SectionBackgroundControls({
  section,
  isAdmin,
  onChange,
}) {
  if (!isAdmin) return null;

  const d = section?.data || {};
  const backgroundType = d.background_type ?? "none";
  const backgroundColor = d.background_color ?? "";
  const backgroundImage = d.background_image ?? "";
  const backgroundOverlay =
    typeof d.background_overlay === "number" ? d.background_overlay : 0.35;

  return (
    <div
      className="mt-3 rounded-2xl border p-4 grid gap-3"
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

      {/* Type selector */}
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

      {/* Color picker */}
      {backgroundType === "color" && (
        <div className="grid gap-1">
          <Label>Background color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={backgroundColor || "#ffffff"}
              onChange={(e) =>
                onChange({
                  background_color: e.target.value,
                })
              }
              className="h-10 w-16 rounded-xl border"
              style={{ borderColor: "rgba(15,30,36,0.12)" }}
            />
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
        </div>
      )}

      {/* Image input */}
      {backgroundType === "image" && (
        <>
          <div className="grid gap-1">
            <Label>Background image URL</Label>
            <Input
              value={backgroundImage}
              placeholder="Paste an image URL or /assets/your-image.jpg"
              onChange={(e) =>
                onChange({
                  background_image: e.target.value,
                })
              }
            />
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
  );
}