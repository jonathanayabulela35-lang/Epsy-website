import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function InlineText({
  value,
  onSave,
  as = "span",
  className,
  style,
  placeholder = "Click to edit…",
  enabled = false,
}) {
  const Tag = as;
  const [draft, setDraft] = useState(value ?? "");
  const lastSaved = useRef(value ?? "");
  const saving = useRef(false);

  useEffect(() => {
    setDraft(value ?? "");
    lastSaved.current = value ?? "";
  }, [value]);

  const handleBlur = async () => {
    if (!enabled) return;
    if (saving.current) return;

    const next = (draft ?? "").trim();
    const prev = (lastSaved.current ?? "").trim();
    if (next === prev) return;

    try {
      saving.current = true;
      await onSave(next);
      lastSaved.current = next;
      toast.success("Saved");
    } catch (e) {
      console.error(e);
      toast.error("Save failed");
      setDraft(lastSaved.current ?? "");
    } finally {
      saving.current = false;
    }
  };

  return (
    <Tag
      className={className}
      style={{
        ...style,
        outline: "none",
        cursor: enabled ? "text" : undefined,
      }}
      contentEditable={enabled}
      suppressContentEditableWarning
      onInput={(e) => setDraft(e.currentTarget.innerText)}
      onBlur={handleBlur}
    >
      {(draft ?? "").length ? draft : enabled ? placeholder : ""}
    </Tag>
  );
}