import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";

export default function EmojiSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      {/* button that shows current emoji */}
      <button
        type="button"
        className="emoji-btn"
        onClick={() => setOpen((v) => !v)}
      >
        <span style={{ fontSize: "1.4rem" }}>{value || "🛒"}</span>
        <span style={{ opacity: 0.8 }}>Choose emoji</span>
      </button>

      {open && (
        <div className="emoji-popover">
          <EmojiPicker
            theme="dark"
            searchPlaceholder="Search emoji..."
            onEmojiClick={(emojiData) => {
              onChange(emojiData.emoji); // ✅ native emoji char
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}