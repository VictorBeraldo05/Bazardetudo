export default function AdminCategoriesLoading() {
  return (
    <main className="space-y-6">
      <section className="rounded-[1.5rem] border border-black/5 bg-white p-5 shadow-card sm:rounded-[2rem] sm:p-6">
        <div className="h-4 w-32 animate-pulse rounded-full bg-[#f1ece3]" />
        <div className="mt-3 h-12 w-80 animate-pulse rounded-full bg-[#f1ece3]" />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-[1.6rem] bg-white shadow-card" />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[380px_380px_minmax(0,1fr)]">
        {Array.from({ length: 3 }).map((_, index) => (
          <section key={index} className="h-[34rem] animate-pulse rounded-[2rem] bg-white shadow-card" />
        ))}
      </div>
    </main>
  );
}
