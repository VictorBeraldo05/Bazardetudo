export default function FavoritesLoading() {
  return (
    <main className="shell space-y-6 py-6 md:py-8">
      <section className="rounded-[2rem] bg-[#111111] p-6 text-white shadow-card md:p-8">
        <div className="h-4 w-36 animate-pulse rounded-full bg-white/15" />
        <div className="mt-3 h-12 w-72 animate-pulse rounded-full bg-white/15" />
        <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded-full bg-white/10" />
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <div className="h-8 w-48 animate-pulse rounded-full bg-[#f1ece3]" />
          <div className="mt-6 grid gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-2xl bg-[#f1ece3]" />
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <div className="h-8 w-44 animate-pulse rounded-full bg-[#f1ece3]" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-[1.5rem] bg-[#f7f2ea]" />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
