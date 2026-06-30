export default function ProductLoading() {
  return (
    <main className="shell space-y-8 py-4 md:space-y-10 md:py-8">
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <div className="aspect-square animate-pulse rounded-[1.75rem] bg-[#f1ece3] md:rounded-[2rem]" />

        <div className="space-y-5 md:space-y-6">
          <div className="space-y-3">
            <div className="h-6 w-28 animate-pulse rounded-full bg-[#f1ece3]" />
            <div className="h-14 w-full animate-pulse rounded-[1rem] bg-[#f1ece3]" />
            <div className="h-5 w-4/5 animate-pulse rounded-full bg-[#f1ece3]" />
          </div>

          <div className="rounded-[1.75rem] bg-white p-4 shadow-card md:rounded-[2rem] md:p-5">
            <div className="h-12 w-40 animate-pulse rounded-full bg-[#f1ece3]" />
            <div className="mt-4 h-20 animate-pulse rounded-[1.25rem] bg-[#f8f5ef]" />
          </div>

          <div className="rounded-[1.75rem] border border-black/5 bg-white p-5 shadow-card md:rounded-[2rem] md:p-6">
            <div className="h-8 w-48 animate-pulse rounded-full bg-[#f1ece3]" />
            <div className="mt-4 h-24 animate-pulse rounded-[1rem] bg-[#f6f2eb]" />
          </div>

          <div className="grid gap-3">
            <div className="h-14 animate-pulse rounded-[1.35rem] bg-[#f1ece3]" />
            <div className="h-14 animate-pulse rounded-[1.35rem] bg-[#f7f2ea]" />
          </div>
        </div>
      </div>
    </main>
  );
}
