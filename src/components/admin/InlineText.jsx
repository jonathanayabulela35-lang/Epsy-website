import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export default function InlineText({
  value,
  onSave,
  as = "span",
  className,
  style,
  placeholder = "Click to edit…",
  enabled = false,

  // Optional: if you ever want to allow multi-line editing explicitly
  multiline: multilineProp,
}) {
  const Tag = as;

  const elRef = useRef(null);
  const lastSaved = useRef(value ?? "");
  const saving = useRef(false);
  const isFocused = useRef(false);

  // We keep a tiny piece of state only to force placeholder behavior when empty.
  // We DO NOT store live typing in React state (prevents cursor jump).
  const [isEmpty, setIsEmpty] = useState(!(String(value ?? "").length > 0));

  const multiline = useMemo(() => {
    if (typeof multilineProp === "boolean") return multilineProp;
    // sensible defaults:
    // - paragraphs/divs: allow multiline
    // - headings/spans: single-line
    return as === "p" || as === "div";
  }, [as, multilineProp]);

  // Sync DOM text from `value`, BUT never overwrite while user is typing (focused).
  useEffect(() => {
    const next = String(value ?? "");
    lastSaved.current = next;

    // If user is actively editing, don't stomp their typing.
    if (isFocused.current) return;

    const el = elRef.current;
    if (!el) return;

    // Only update DOM if different
    if ((el.innerText ?? "") !== next) {
      el.innerText = next;
    }

    setIsEmpty(!(next.length > 0));
  }, [value]);

  const getCurrentText = () => {
    const el = elRef.current;
    return String(el?.innerText ?? "");
  };

  const saveNow = async () => {
    if (!enabled) return;
    if (saving.current) return;

    const raw = getCurrentText();

    // For single-line fields, remove newlines
    const cleaned = multiline ? raw : raw.replace(/\n/g, " ");

    const next = cleaned.trim();
    const prev = String(lastSaved.current ?? "").trim();

    if (next === prev) return;

    try {
      saving.current = true;
      await onSave(next);
      lastSaved.current = next;
      toast.success("Saved");
    } catch (e) {
      console.error(e);
      toast.error("Save failed — reverted");

      // Revert DOM to last saved
      const el = elRef.current;
      if (el) el.innerText = String(lastSaved.current ?? "");
      setIsEmpty(!(String(lastSaved.current ?? "").length > 0));
    } finally {
      saving.current = false;
    }
  };

  const handleFocus = () => {
    if (!enabled) return;
    isFocused.current = true;

    // If placeholder is showing, clear it on focus
    const el = elRef.current;
    if (!el) return;
    if ((el.innerText ?? "") === placeholder) {
      el.innerText = "";
      setIsEmpty(true);
    }
  };

  const handleBlur = async () => {
    if (!enabled) return;
    isFocused.current = false;

    const text = getCurrentText().trim();
    setIsEmpty(!(text.length > 0));

    await saveNow();
  };

  const handleInput = () => {
    const text = getCurrentText().trim();
    setIsEmpty(!(text.length > 0));
  };

  const handleKeyDown = async (e) => {
    if (!enabled) return;

    // Save shortcuts (Notion-ish):
    // - Ctrl/Cmd + Enter saves (both single + multi)
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      await saveNow();
      return;
    }

    // For single-line fields:
    // - Enter saves and prevents newline
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      await saveNow();
      // blur after save (feels “committed”)
      elRef.current?.blur();
      return;
    }

    // For multiline:
    // - Enter makes a newline (normal)
    // - (optional) you can still blur to save, or use Ctrl/Cmd+Enter
  };

  // Initial render: show value (or placeholder if admin + empty)
  const initialText =
    String(value ?? "").length > 0 ? String(value ?? "") : enabled ? placeholder : "";

  return (
    <Tag
      ref={elRef}
      className={className}
      style={{
        ...style,
        outline: "none",
        cursor: enabled ? "text" : undefined,
        // subtle hint for admin mode when empty
        opacity: enabled && isEmpty ? 0.75 : 1,
      }}
      contentEditable={enabled}
      suppressContentEditableWarning
      onFocus={handleFocus}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      {initialText}
    </Tag>
  );
}