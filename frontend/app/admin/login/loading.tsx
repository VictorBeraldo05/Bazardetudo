export default function AdminLoginLoading() {
  return (
    <main className="shell flex min-h-[80vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-[2rem] bg-[#111111] p-8 text-white shadow-card">
        <div className="h-4 w-28 animate-pulse rounded-full bg-white/10" />
        <div className="mt-3 h-12 w-52 animate-pulse rounded-full bg-white/10" />
        <div className="mt-6 grid gap-4">
          <div className="h-12 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-12 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-11 animate-pulse rounded-full bg-white/15" />
        </div>
      </div>
    </main>
  );
}
