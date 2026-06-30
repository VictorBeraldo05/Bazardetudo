export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#f3efe8]">
      <div className="mx-auto grid min-h-screen max-w-[1440px] gap-6 p-4 lg:grid-cols-[260px_1fr] lg:p-6">
        <aside className="rounded-[2rem] bg-[#111111] p-5 text-white shadow-card">
          <div className="h-8 w-40 animate-pulse rounded-full bg-white/10" />
          <div className="mt-2 h-4 w-28 animate-pulse rounded-full bg-white/10" />
          <div className="mt-8 space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-2xl bg-white/10" />
            ))}
          </div>
        </aside>

        <main className="space-y-6">
          <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
            <div className="h-4 w-24 animate-pulse rounded-full bg-[#f1ece3]" />
            <div className="mt-3 h-12 w-80 animate-pulse rounded-full bg-[#f1ece3]" />
            <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded-full bg-[#f1ece3]" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-[1.75rem] bg-white shadow-card" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
