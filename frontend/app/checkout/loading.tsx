export default function CheckoutLoading() {
  return (
    <main className="shell py-8">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
          <div className="rounded-[2rem] bg-[#111111] p-8 text-white shadow-card">
            <div className="h-4 w-24 animate-pulse rounded-full bg-white/15" />
            <div className="mt-3 h-12 w-80 animate-pulse rounded-full bg-white/15" />
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-2xl bg-[#f1ece3]" />
            ))}
            <div className="h-12 animate-pulse rounded-full bg-[#ead8c4]" />
          </div>
        </section>

        <aside className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <div className="h-8 w-48 animate-pulse rounded-full bg-[#f1ece3]" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-[1.5rem] bg-[#f7f2ea]" />
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
