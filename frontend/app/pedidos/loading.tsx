export default function OrdersLoading() {
  return (
    <main className="shell space-y-6 py-8">
      <section className="rounded-[2rem] bg-[#111111] p-8 text-white shadow-card">
        <div className="h-4 w-24 animate-pulse rounded-full bg-white/15" />
        <div className="mt-3 h-12 w-96 animate-pulse rounded-full bg-white/15" />
      </section>

      <div className="grid gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-[2rem] border border-black/5 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-6 w-36 animate-pulse rounded-full bg-[#f1ece3]" />
                <div className="h-4 w-60 animate-pulse rounded-full bg-[#f1ece3]" />
              </div>
              <div className="h-10 w-32 animate-pulse rounded-full bg-[#f1ece3]" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
