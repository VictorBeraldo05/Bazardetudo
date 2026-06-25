"use client";

import { Share2 } from "lucide-react";

export function ShareProductButton() {
  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // fall through to manual open
      }
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank");
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Compartilhar produto"
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-card transition hover:bg-[#f6f1e8]"
    >
      <Share2 size={18} />
    </button>
  );
}
