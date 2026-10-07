export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 pt-12 space-y-8 animate-pulse">
      <div className="h-6 w-32 rounded-full bg-border" />
      <div className="h-10 w-3/4 rounded-xl bg-border" />
      <div className="h-4 w-1/2 rounded bg-border" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
        <div className="h-48 rounded-2xl bg-border" />
        <div className="h-48 rounded-2xl bg-border" />
      </div>
    </div>
  );
}
