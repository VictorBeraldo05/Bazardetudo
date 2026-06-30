export default function OrdersLoading() {
  return (
    <main className="shell pb-8 pt-4 md:pt-8">
      <div className="space-y-5 md:space-y-6">
        <section className="rounded-[1.6rem] border border-black/5 bg-white px-4 py-4 shadow-card md:rounded-[2rem] md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="h-4 w-20 animate-pulse rounded-full bg-[#f1ece3]" />
              <div className="mt-3 h-12 w-60 animate-pulse rounded-full bg-[#f1ece3]" />
              <div className="mt-3 h-4 w-full max-w-sm animate-pulse rounded-full bg-[#f1ece3]" />
            </div>
            <div className="hidden h-16 w-28 animate-pulse rounded-[1.1rem] bg-[#f7f3ec] md:block" />
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-[1.6rem] bg-white shadow-card" />
          ))}
        </section>

        <section className="space-y-3 md:space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-[1.45rem] border border-black/5 bg-white p-4 shadow-card md:rounded-[1.8rem] md:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="h-6 w-40 animate-pulse rounded-full bg-[#f1ece3]" />
                  <div className="mt-3 h-4 w-full max-w-md animate-pulse rounded-full bg-[#f1ece3]" />
                </div>
                <div className="grid grid-cols-3 gap-4 md:min-w-[22rem]">
                  {Array.from({ length: 3 }).map((__, infoIndex) => (
                    <div key={infoIndex}>
                      <div className="h-3 w-14 animate-pulse rounded-full bg-[#f1ece3]" />
                      <div className="mt-2 h-4 w-20 animate-pulse rounded-full bg-[#f1ece3]" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 h-2 animate-pulse rounded-full bg-[#f2ede4]" />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
