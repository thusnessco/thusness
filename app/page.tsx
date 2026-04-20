export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-3xl mx-auto space-y-16">

        {/* Hero */}
        <section className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-light tracking-tight">
            Thusness
          </h1>

          <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
            Direct recognition.  
            Deconditioning.  
            Lived clarity.
          </p>

          <div className="pt-6">
            <a
              href="https://thusness.as.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 border border-white rounded-full hover:bg-white hover:text-black transition"
            >
              Book a Session
            </a>
          </div>
        </section>

        {/* Description */}
        <section className="space-y-6 text-gray-300 text-lg leading-relaxed">
          <p>
            This is not about fixing yourself or becoming something else.
          </p>

          <p>
            It’s about seeing clearly what is already here — and what has been layered on top.
          </p>

          <p>
            Through direct exploration, we begin to recognize experience more precisely,
            dissolve unnecessary tension, and allow a more natural way of being to emerge.
          </p>
        </section>

        {/* Offer */}
        <section className="space-y-4">
          <h2 className="text-2xl font-light">Work Together</h2>

          <p className="text-gray-400">
            1:1 sessions, small group explorations, and ongoing guidance.
          </p>

          <a
            href="https://thusness.as.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block px-6 py-3 border border-white rounded-full hover:bg-white hover:text-black transition"
          >
            Learn More
          </a>
        </section>

      </div>
    </main>
  );
}