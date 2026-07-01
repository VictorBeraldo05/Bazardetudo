export default function FavoritesLoading() {
  return (
    <main className="shell pb-8 pt-4 md:pt-8">
      <div className="space-y-5 md:space-y-6">
        <section className="rounded-[1.6rem] border border-black/5 bg-white px-4 py-4 shadow-card md:rounded-[2rem] md:px-6 md:py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="h-4 w-32 animate-pulse rounded-full bg-[#f1ece3]" />
              <div className="mt-3 h-12 w-72 animate-pulse rounded-full bg-[#f1ece3]" />
              <div className="mt-3 h-4 w-full max-w-lg animate-pulse rounded-full bg-[#f1ece3]" />
            </div>
            <div className="h-11 w-36 animate-pulse rounded-[1rem] bg-[#f7f3ec]" />
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-[1.6rem] bg-white shadow-card" />
          ))}
        </section>

        <div className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
          <section className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-card md:rounded-[2rem] md:p-6">
            <div className="h-8 w-40 animate-pulse rounded-full bg-[#f1ece3]" />
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-20 animate-pulse rounded-[1rem] bg-[#f8f4ed]" />
                <div className="h-20 animate-pulse rounded-[1rem] bg-[#f8f4ed]" />
              </div>
              <div className="h-20 animate-pulse rounded-[1rem] bg-[#f8f4ed]" />
              <div className="h-20 animate-pulse rounded-[1rem] bg-[#f8f4ed]" />
              <div className="h-32 animate-pulse rounded-[1rem] bg-[#f8f4ed]" />
              <div className="h-24 animate-pulse rounded-[1.2rem] bg-[#f8f4ed]" />
              <div className="h-12 animate-pulse rounded-[1rem] bg-[#ead8c4]" />
            </div>
          </section>

          <section className="space-y-4">
            <section className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-card md:rounded-[2rem] md:p-6">
              <div className="h-8 w-44 animate-pulse rounded-full bg-[#f1ece3]" />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-28 animate-pulse rounded-[1.3rem] bg-[#f8f4ed]" />
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
