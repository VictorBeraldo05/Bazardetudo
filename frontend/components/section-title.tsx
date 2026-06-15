export function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-6 space-y-2">
      <p className="text-xs uppercase tracking-[0.3em] text-black/45">{eyebrow}</p>
      <h2 className="font-display text-3xl text-black md:text-4xl">{title}</h2>
      <p className="max-w-2xl text-sm text-black/60 md:text-base">{description}</p>
    </div>
  );
}

