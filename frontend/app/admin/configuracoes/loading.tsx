export default function AdminSettingsLoading() {
  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
        <div className="h-4 w-28 animate-pulse rounded-full bg-[#f1ece3]" />
        <div className="mt-3 h-12 w-96 animate-pulse rounded-full bg-[#f1ece3]" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-[1.6rem] bg-white shadow-card" />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="h-[30rem] animate-pulse rounded-[2rem] bg-white shadow-card" />
        <section className="h-[30rem] animate-pulse rounded-[2rem] bg-white shadow-card" />
      </div>
    </main>
  );
}
