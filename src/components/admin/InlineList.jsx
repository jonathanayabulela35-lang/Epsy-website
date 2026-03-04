import React from "react";
import InlineText from "./InlineText";

/**
 * InlineList
 * Props:
 * - items: string[]
 * - onSave: async (newItems: string[]) => void
 */
export default function InlineList({ items = [], onSave }) {
  const safeItems = Array.isArray(items) ? items : [];

  const saveItem = async (index, newValue) => {
    const next = [...safeItems];
    next[index] = newValue;
    // remove empty lines
    const cleaned = next.map((x) => (x ?? "").trim()).filter(Boolean);
    await onSave(cleaned);
  };

  // Add a new blank bullet (admin only usage)
  const addItem = async () => {
    const next = [...safeItems, "New bullet"];
    await onSave(next);
  };

  const removeItem = async (index) => {
    const next = safeItems.filter((_, i) => i !== index);
    await onSave(next);
  };

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {safeItems.map((txt, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: "var(--epsy-sky-blue)" }} />
            <div className="flex-1">
              <InlineText
                as="span"
                value={txt}
                onSave={(v) => saveItem(idx, v)}
                className="text-sm leading-relaxed"
                style={{ color: "var(--epsy-slate-blue)" }}
              />
            </div>
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="text-xs underline"
              style={{ color: "var(--epsy-slate-blue)" }}
            >
              remove
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={addItem}
        className="text-sm underline"
        style={{ color: "var(--epsy-sky-blue)" }}
      >
        + add bullet
      </button>
    </div>
  );
}