const bookingHref = "https://thusness.as.me/";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16 md:py-24">
      <div className="max-w-3xl mx-auto space-y-20 md:space-y-28">

        {/* Hero */}
        <section className="text-center space-y-8">
          <header className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white">
              Thusness
            </h1>
            <p className="text-xl md:text-2xl font-light text-gray-400 tracking-wide">
              ~As it is
            </p>
          </header>

          <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-xl mx-auto">
            Direct recognition
            <br />
            Deconditioning
            <br />
            Lived clarity
          </p>

          <div className="pt-2">
            <a
              href={bookingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3.5 border border-white rounded-full text-sm font-medium tracking-wide uppercase hover:bg-white hover:text-black transition-colors"
            >
              Book a session
            </a>
          </div>
        </section>

        {/* Description */}
        <section className="space-y-8 text-gray-300 text-lg md:text-xl leading-relaxed border-t border-white/10 pt-16 md:pt-20">
          <p>
            This is only about noticing what is already here.
          </p>
        </section>

      </div>
    </main>
  );
}