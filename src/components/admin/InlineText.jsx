import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * InlineText v3 (Notion-style toolbar)
 * - Stable cursor (no re-render on each keystroke)
 * - Draft does NOT get overwritten while editing
 * - Floating Save/Cancel toolbar appears while editing
 * - Status: Saving… / Saved ✓ / Error
 */
export default function InlineText({
  value,
  onSave,
  as = "span",
  className,
  style,
  placeholder = "Click to edit…",
  enabled = false,

  // Editing behavior
  multiLine = false,
  trimOnSave = true,

  // UI
  showToolbar = true, // ✅ Notion-style mini toolbar
}) {
  const Tag = as;

  const elRef = useRef(null);
  const wrapRef = useRef(null);

  const lastSaved = useRef(value ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const savedTimer = useRef(null);

  // Only sync from props when NOT editing
  useEffect(() => {
    if (isEditing) return;
    lastSaved.current = value ?? "";
    if (elRef.current) {
      elRef.current.innerText = (value ?? "") || "";
    }
  }, [value, isEditing]);

  const clearSavedTimer = () => {
    if (savedTimer.current) {
      clearTimeout(savedTimer.current);
      savedTimer.current = null;
    }
  };

  const setSavedForMoment = () => {
    clearSavedTimer();
    setStatus("saved");
    savedTimer.current = setTimeout(() => setStatus("idle"), 1500);
  };

  const getCurrentText = () => {
    if (!elRef.current) return "";
    return elRef.current.innerText ?? "";
  };

  const positionToolbar = () => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    // Show near top-right of the editable element, with a small offset
    setToolbarPos({
      top: rect.top + window.scrollY - 10,
      left: rect.left + window.scrollX + rect.width - 170, // ~toolbar width
    });
  };

  const enterEditMode = () => {
    if (!enabled) return;
    setIsEditing(true);
    setStatus("idle");
    // Position after render tick
    setTimeout(positionToolbar, 0);
  };

  const exitEditMode = () => {
    setIsEditing(false);
    clearSavedTimer();
    setStatus("idle");
  };

  const revertUI = () => {
    if (!elRef.current) return;
    elRef.current.innerText = lastSaved.current ?? "";
  };

  const doSave = async () => {
    if (!enabled) return;
    if (saving) return;

    const raw = getCurrentText();
    const next = trimOnSave ? raw.trim() : raw;
    const prev = trimOnSave
      ? (lastSaved.current ?? "").trim()
      : (lastSaved.current ?? "");

    if (next === prev) {
      // No changes, but still confirm
      setSavedForMoment();
      toast.success("No changes");
      return;
    }

    try {
      setSaving(true);
      setStatus("saving");
      await onSave(next);
      lastSaved.current = next;
      setSaving(false);
      setSavedForMoment();
      toast.success("Saved");
      return true;
    } catch (e) {
      console.error(e);
      setSaving(false);
      setStatus("error");
      toast.error("Save failed");
      return false;
    }
  };

  const cancelEdit = () => {
    revertUI();
    exitEditMode();
    elRef.current?.blur();
  };

  // Keep toolbar positioned on scroll/resize while editing
  useEffect(() => {
    if (!isEditing) return;

    const onScroll = () => positionToolbar();
    const onResize = () => positionToolbar();

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [isEditing]);

  const handleFocus = () => {
    if (!enabled) return;
    enterEditMode();
  };

  const handleBlur = () => {
    // Don’t autosave on blur anymore (toolbar handles save),
    // because clicking the toolbar triggers blur.
    // We'll keep editing until Save/Cancel.
  };

  const handleKeyDown = async (e) => {
    if (!enabled) return;

    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
      return;
    }

    // Save shortcuts:
    // Single-line: Enter saves
    if (!multiLine && e.key === "Enter") {
      e.preventDefault();
      const ok = await doSave();
      if (ok) {
        exitEditMode();
        elRef.current?.blur();
      }
      return;
    }

    // Multi-line:
    // Shift+Enter creates new line (allow)
    // Ctrl/Cmd+Enter saves
    if (multiLine && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const ok = await doSave();
      if (ok) {
        exitEditMode();
        elRef.current?.blur();
      }
    }
  };

  return (
    <>
      <span ref={wrapRef} className="inline-block relative">
        <Tag
          ref={elRef}
          className={className}
          style={{
            ...style,
            outline: "none",
            cursor: enabled ? "text" : undefined,
            whiteSpace: multiLine ? "pre-wrap" : "normal",
          }}
          contentEditable={enabled}
          suppressContentEditableWarning
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        >
          {(value ?? "").length ? value : enabled ? "" : ""}
        </Tag>

        {/* Optional placeholder (visual only) */}
        {enabled && !(value ?? "").length && !isEditing && (
          <span
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              pointerEvents: "none",
              opacity: 0.55,
            }}
          >
            {placeholder}
          </span>
        )}
      </span>

      {/* Floating toolbar */}
      {enabled && showToolbar && isEditing && (
        <div
          style={{
            position: "absolute",
            top: toolbarPos.top,
            left: toolbarPos.left,
            zIndex: 9999,
          }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl shadow-sm border"
            style={{
              backgroundColor: "rgba(250,251,249,0.98)",
              borderColor: "rgba(15,30,36,0.12)",
              backdropFilter: "blur(10px)",
            }}
          >
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()} // prevents blur killing edit
              onClick={async () => {
                const ok = await doSave();
                if (ok) {
                  exitEditMode();
                  elRef.current?.blur();
                }
              }}
              className="text-sm font-semibold px-3 py-1 rounded-xl"
              style={{
                backgroundColor: "var(--epsy-charcoal)",
                color: "white",
                opacity: saving ? 0.6 : 1,
              }}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={cancelEdit}
              className="text-sm font-semibold px-3 py-1 rounded-xl"
              style={{
                backgroundColor: "rgba(15,30,36,0.08)",
                color: "var(--epsy-charcoal)",
              }}
            >
              Cancel
            </button>

            {/* Status */}
            <div
              className="text-xs ml-1"
              style={{ color: "rgba(15,30,36,0.65)", minWidth: 70 }}
            >
              {status === "saving" && "Saving…"}
              {status === "saved" && "Saved ✓"}
              {status === "error" && "Error"}
              {status === "idle" && ""}
            </div>
          </div>
        </div>
      )}
    </>
  );
}