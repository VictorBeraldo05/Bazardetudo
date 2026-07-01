export default function ProfileLoading() {
  return (
    <main className="shell pb-8 pt-4 md:pt-8">
      <div className="space-y-5 md:space-y-6">
        <section className="rounded-[1.6rem] border border-black/5 bg-white px-4 py-4 shadow-card md:rounded-[2rem] md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="h-4 w-24 animate-pulse rounded-full bg-[#f1ece3]" />
              <div className="mt-3 h-12 w-64 animate-pulse rounded-full bg-[#f1ece3]" />
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

        <div className="grid gap-5 xl:grid-cols-[0.84fr_1.16fr]">
          <section className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-card md:rounded-[2rem] md:p-6">
            <div className="h-8 w-40 animate-pulse rounded-full bg-[#f1ece3]" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-[1.2rem] bg-[#f8f4ed]" />
              ))}
            </div>
            <div className="mt-5 space-y-3">
              <div className="h-11 animate-pulse rounded-[1rem] bg-[#ead8c4]" />
              <div className="h-11 animate-pulse rounded-[1rem] bg-[#f1ece3]" />
            </div>
          </section>

          <section className="space-y-4">
            <section className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-card md:rounded-[2rem] md:p-6">
              <div className="h-8 w-44 animate-pulse rounded-full bg-[#f1ece3]" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-[1.35rem] bg-[#f8f4ed]" />
                ))}
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-card md:rounded-[2rem] md:p-6">
              <div className="h-8 w-36 animate-pulse rounded-full bg-[#f1ece3]" />
              <div className="mt-4 h-16 animate-pulse rounded-[1.3rem] bg-[#f8f4ed]" />
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}
