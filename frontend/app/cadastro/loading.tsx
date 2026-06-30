export default function SignupLoading() {
  return (
    <main className="shell py-8">
      <div className="mx-auto max-w-lg rounded-[2rem] bg-white p-8 shadow-card">
        <div className="h-4 w-24 animate-pulse rounded-full bg-[#f1ece3]" />
        <div className="mt-3 h-12 w-72 animate-pulse rounded-full bg-[#f1ece3]" />
        <div className="mt-6 grid gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-2xl bg-[#f1ece3]" />
          ))}
          <div className="h-11 animate-pulse rounded-full bg-[#ead8c4]" />
        </div>
      </div>
    </main>
  );
}
