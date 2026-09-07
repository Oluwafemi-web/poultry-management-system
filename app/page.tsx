import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-as-ink text-white overflow-x-hidden">
      <section className="relative min-h-[100svh] flex flex-col">
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=2400&q=80"
            alt="Pasture at golden hour with grazing livestock"
            className="as-hero-media h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-as-ink/90 via-as-ink/65 to-as-ink/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-as-ink via-transparent to-as-ink/40" />
        </div>

        <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <p className="font-display text-xl tracking-tight text-white md:text-2xl">
            AgroSolve
          </p>
          <nav className="flex items-center gap-4 text-sm text-white/80">
            <Link href="/marketplace" className="hover:text-white transition-colors">
              Marketplace
            </Link>
            <Link href="/signin" className="hover:text-white transition-colors">
              Sign in
            </Link>
          </nav>
        </header>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-6 pb-16 pt-24 md:pb-24 md:pt-32">
          <p className="as-fade-up font-display text-5xl leading-[0.95] tracking-tight text-white sm:text-6xl md:text-8xl md:max-w-3xl">
            AgroSolve
          </p>
          <h1 className="as-fade-up as-fade-up-delay-1 mt-5 max-w-xl text-xl font-medium text-white/95 md:text-2xl">
            Configure once. Run the whole farm from one clear board.
          </h1>
          <p className="as-fade-up as-fade-up-delay-2 mt-4 max-w-md text-base text-white/70 md:text-lg">
            Livestock, feed, health, people, and money — plus buy and sell without
            leaving the yard.
          </p>
          <div className="as-fade-up as-fade-up-delay-3 mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-full bg-as-mint px-6 py-3 text-sm font-semibold text-as-ink transition hover:bg-white"
            >
              Set up your farm
            </Link>
            <Link
              href="/signin"
              className="rounded-full border border-white/35 px-6 py-3 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="relative bg-as-paper text-as-ink">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div>
            <p className="font-display text-3xl tracking-tight md:text-4xl">
              A clean surface between you and the mess.
            </p>
            <p className="mt-4 text-as-moss/80 leading-relaxed">
              Inspired by the best operational dashboards: fewer numbers, clearer
              verdicts, and charts that show what changed — not just that something
              moved.
            </p>
          </div>
          <ul className="space-y-8">
            {[
              [
                "Farm board",
                "See livestock, feed, and profit in one glance — with a live trend graph for revenue and expenses.",
              ],
              [
                "Field workflows",
                "Workers log feed, mortality, and health from a phone-first flow that stays out of the way.",
              ],
              [
                "Buy & sell",
                "Pull supplies from the marketplace and list animals without switching tools.",
              ],
            ].map(([title, body]) => (
              <li key={title} className="border-t border-as-line pt-6">
                <h2 className="font-display text-xl text-as-forest">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-as-moss/80">
                  {body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
