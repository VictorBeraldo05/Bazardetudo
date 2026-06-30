export default function AdminProductsLoading() {
  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
        <div className="h-4 w-20 animate-pulse rounded-full bg-[#f1ece3]" />
        <div className="mt-3 h-12 w-96 animate-pulse rounded-full bg-[#f1ece3]" />
        <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded-full bg-[#f1ece3]" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <section className="grid gap-5 rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-2xl bg-[#f1ece3]" />
          ))}
          <div className="h-12 animate-pulse rounded-full bg-[#ead8c4]" />
        </section>

        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <div className="h-8 w-56 animate-pulse rounded-full bg-[#f1ece3]" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-[1.5rem] bg-[#f7f2ea]" />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
