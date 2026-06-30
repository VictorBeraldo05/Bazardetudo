export default function CheckoutLoading() {
  return (
    <main className="shell pb-36 pt-4 md:pb-8 md:pt-8">
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="space-y-4">
          <div className="rounded-[1.6rem] border border-black/5 bg-white px-4 py-4 shadow-card md:rounded-[2rem] md:px-6 md:py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="h-4 w-24 animate-pulse rounded-full bg-[#f1ece3]" />
                <div className="mt-3 h-12 w-64 animate-pulse rounded-full bg-[#f1ece3]" />
                <div className="mt-3 h-4 w-full max-w-sm animate-pulse rounded-full bg-[#f1ece3]" />
              </div>
              <div className="h-16 w-28 animate-pulse rounded-[1.1rem] bg-[#f7f3ec]" />
            </div>
          </div>

          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, sectionIndex) => (
              <div key={sectionIndex} className="rounded-[1.6rem] border border-black/5 bg-white p-4 shadow-card md:rounded-[2rem] md:p-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-[1rem] bg-[#f7f2ea]" />
                  <div className="flex-1">
                    <div className="h-6 w-40 animate-pulse rounded-full bg-[#f1ece3]" />
                    <div className="mt-2 h-4 w-56 animate-pulse rounded-full bg-[#f1ece3]" />
                  </div>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {Array.from({ length: sectionIndex === 2 ? 3 : sectionIndex === 1 ? 2 : 4 }).map((_, inputIndex) => (
                    <div
                      key={inputIndex}
                      className={`h-12 animate-pulse rounded-2xl bg-[#f1ece3] ${sectionIndex === 2 ? "md:col-span-2" : ""}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-[2rem] border border-black/5 bg-white p-5 shadow-card md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="h-8 w-44 animate-pulse rounded-full bg-[#f1ece3]" />
              <div className="mt-2 h-4 w-32 animate-pulse rounded-full bg-[#f1ece3]" />
            </div>
            <div className="h-9 w-24 animate-pulse rounded-full bg-[#f7f3ec]" />
          </div>

          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-[1.35rem] bg-[#f8f4ed]" />
            ))}
          </div>

          <div className="mt-5 space-y-3">
            <div className="h-4 w-full animate-pulse rounded-full bg-[#f1ece3]" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-[#f1ece3]" />
          </div>

          <div className="mt-5 h-20 animate-pulse rounded-[1.3rem] bg-[#f8f4ed]" />
          <div className="mt-6 h-12 animate-pulse rounded-[1.2rem] bg-[#ead8c4]" />
        </aside>
      </div>
    </main>
  );
}
