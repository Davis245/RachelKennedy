import { siteCopy } from "@/lib/site";

export function SiteHero() {
  return (
    <main className="min-h-screen px-6 py-16 sm:px-10 lg:px-16">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
          <span className="rounded-full border border-amber-200 bg-amber-100 px-4 py-2">
            Travel Journal
          </span>
          <span className="rounded-full border border-stone-200 bg-white px-4 py-2">
            Coming Soon
          </span>
        </div>
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-stone-500">
            {siteCopy.kicker}
          </p>
          <h1 className="text-5xl font-black uppercase tracking-tight sm:text-7xl">
            {siteCopy.title}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-stone-700 sm:text-xl">
            {siteCopy.description}
          </p>
        </div>
      </section>
    </main>
  );
}
