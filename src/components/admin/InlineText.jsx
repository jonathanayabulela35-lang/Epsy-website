import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * InlineText v5
 * - Keeps true inline editing on the page
 * - Reliable saves for short and long text
 * - Tracks draft on every input
 * - Preserves multi-line text
 * - Floating Save / Cancel toolbar
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
  showToolbar = true,
}) {
  const Tag = as;

  const elRef = useRef(null);
  const wrapRef = useRef(null);

  const lastSaved = useRef(value ?? "");
  const savedTimer = useRef(null);

  const [draft, setDraft] = useState(value ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("idle");
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });

  // Only sync from props when NOT editing
  useEffect(() => {
    if (isEditing) return;

    const next = value ?? "";
    lastSaved.current = next;
    setDraft(next);

    if (elRef.current && elRef.current.innerText !== next) {
      elRef.current.innerText = next;
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

  const positionToolbar = () => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();

    setToolbarPos({
      top: rect.top + window.scrollY - 10,
      left: Math.max(12, rect.left + window.scrollX + rect.width - 170),
    });
  };

  const enterEditMode = () => {
    if (!enabled) return;

    setIsEditing(true);
    setStatus("idle");

    setTimeout(() => {
      positionToolbar();

      if (elRef.current) {
        elRef.current.focus();

        // Move caret to end
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(elRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }, 0);
  };

  const exitEditMode = () => {
    setIsEditing(false);
    clearSavedTimer();
    setStatus("idle");
  };

  const revertUI = () => {
    const prev = lastSaved.current ?? "";
    setDraft(prev);

    if (elRef.current) {
      elRef.current.innerText = prev;
    }
  };

  const normalize = (text) => {
    const raw = text ?? "";
    return trimOnSave ? raw.trim() : raw;
  };

  const doSave = async () => {
    if (!enabled || saving) return false;

    const next = normalize(draft);
    const prev = normalize(lastSaved.current ?? "");

    if (next === prev) {
      setSavedForMoment();
      toast.success("No changes");
      return true;
    }

    try {
      setSaving(true);
      setStatus("saving");

      await onSave(next);

      lastSaved.current = next;
      setDraft(next);

      if (elRef.current && elRef.current.innerText !== next) {
        elRef.current.innerText = next;
      }

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

  useEffect(() => {
    return () => clearSavedTimer();
  }, []);

  const handleFocus = () => {
    if (!enabled) return;
    enterEditMode();
  };

  const handleBlur = () => {
    // no autosave on blur
  };

  const handleInput = (e) => {
    setDraft(e.currentTarget.innerText ?? "");
  };

  const handlePaste = (e) => {
    // Paste as plain text
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  const handleKeyDown = async (e) => {
    if (!enabled) return;

    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
      return;
    }

    if (!multiLine && e.key === "Enter") {
      e.preventDefault();
      const ok = await doSave();
      if (ok) {
        exitEditMode();
        elRef.current?.blur();
      }
      return;
    }

    if (multiLine && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const ok = await doSave();
      if (ok) {
        exitEditMode();
        elRef.current?.blur();
      }
    }
  };

  const showPlaceholder = enabled && !isEditing && !(value ?? "").length;

  return (
    <>
      <span ref={wrapRef} className="inline-block relative w-full">
        <Tag
          ref={elRef}
          className={className}
          style={{
            ...style,
            outline: "none",
            cursor: enabled ? "text" : undefined,
            whiteSpace: multiLine ? "pre-wrap" : "normal",
            wordBreak: "break-word",
          }}
          contentEditable={enabled}
          suppressContentEditableWarning
          onFocus={handleFocus}
          onBlur={handleBlur}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
        >
          {(value ?? "").length ? value : enabled ? "" : ""}
        </Tag>

        {showPlaceholder && (
          <span
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              pointerEvents: "none",
              opacity: 0.55,
              whiteSpace: multiLine ? "pre-wrap" : "normal",
            }}
          >
            {placeholder}
          </span>
        )}
      </span>

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
              onMouseDown={(e) => e.preventDefault()}
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