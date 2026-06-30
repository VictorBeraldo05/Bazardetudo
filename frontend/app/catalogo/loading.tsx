function CategoryStripSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-[72px] animate-pulse rounded-[1rem] bg-[#f2ede4]" />
      ))}
    </div>
  );
}

function SubcategorySkeleton() {
  return (
    <div className="grid grid-cols-3 gap-x-2 gap-y-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="text-center">
          <div className="mx-auto h-[3.5rem] w-[3.5rem] animate-pulse rounded-full bg-[#f2ede4]" />
          <div className="mx-auto mt-2 h-3 w-14 animate-pulse rounded-full bg-[#f2ede4]" />
        </div>
      ))}
    </div>
  );
}

export default function CatalogLoading() {
  return (
    <main className="shell py-4 md:py-8">
      <section className="space-y-4 md:space-y-6">
        <div className="space-y-4 lg:hidden">
          <div className="overflow-hidden rounded-[1.45rem] border border-black/6 bg-white shadow-card">
            <div className="border-b border-black/6 px-3 py-3">
              <div className="h-10 animate-pulse rounded-[0.95rem] bg-[#f2ede4]" />
            </div>
            <div className="grid grid-cols-[116px_minmax(0,1fr)]">
              <div className="border-r border-black/6 bg-[#f7f4ee] p-2">
                <CategoryStripSkeleton />
              </div>
              <div className="space-y-4 p-3">
                <div className="space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded-full bg-[#f2ede4]" />
                  <div className="h-7 w-36 animate-pulse rounded-full bg-[#f2ede4]" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-9 animate-pulse rounded-2xl bg-[#f2ede4]" />
                  <div className="h-9 animate-pulse rounded-2xl bg-[#f2ede4]" />
                </div>
                <SubcategorySkeleton />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden gap-4 lg:grid lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-[1.6rem] border border-black/6 bg-white p-4 shadow-card">
            <CategoryStripSkeleton />
          </aside>
          <div className="rounded-[1.8rem] border border-black/6 bg-white p-5 shadow-card">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded-full bg-[#f2ede4]" />
                <div className="h-9 w-60 animate-pulse rounded-full bg-[#f2ede4]" />
              </div>
              <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_auto_auto]">
                <div className="h-11 animate-pulse rounded-[1rem] bg-[#f2ede4]" />
                <div className="h-11 w-40 animate-pulse rounded-2xl bg-[#f2ede4]" />
                <div className="h-11 w-32 animate-pulse rounded-2xl bg-[#f2ede4]" />
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex animate-pulse items-center gap-3 rounded-[1.25rem] border border-black/5 p-3">
                  <div className="h-14 w-14 rounded-full bg-[#f2ede4]" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-28 rounded-full bg-[#f2ede4]" />
                    <div className="h-3 w-16 rounded-full bg-[#f2ede4]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
