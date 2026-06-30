export default function ProfileLoading() {
  return (
    <main className="shell space-y-6 py-6 md:py-8">
      <section className="rounded-[2rem] bg-[#111111] p-6 text-white shadow-card md:p-8">
        <div className="h-4 w-28 animate-pulse rounded-full bg-white/15" />
        <div className="mt-3 h-12 w-80 animate-pulse rounded-full bg-white/15" />
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <div className="h-8 w-40 animate-pulse rounded-full bg-[#f1ece3]" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-5 animate-pulse rounded-full bg-[#f1ece3]" />
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <div className="h-8 w-44 animate-pulse rounded-full bg-[#f1ece3]" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-[1.5rem] bg-[#f7f2ea]" />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
