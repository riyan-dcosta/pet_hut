const testimonials = [
  {
    pet: 'Milo',
    owner: 'Ananya, Bengaluru',
    quote:
      'Milo gets excited the moment his food arrives. I love finding his everyday favourites in one place.',
    image:
      'https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=320&h=320&q=85',
    alt: 'Milo, a happy dog',
  },
  {
    pet: 'Miso',
    owner: 'Karthik, Mysuru',
    quote:
      'Miso is a picky little eater, so it is lovely to have trusted options that keep her purring.',
    image:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=320&h=320&q=85',
    alt: 'Miso, a curious cat',
  },
  {
    pet: 'Bruno',
    owner: 'Priya, Mangaluru',
    quote:
      'From his favourite treats to dinner, shopping for Bruno has become wonderfully simple.',
    image:
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=320&h=320&q=85',
    alt: 'Bruno, a friendly dog',
  },
]

export default function Testimonials() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
            Notes from pet parents
          </p>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-stone-900 sm:text-4xl">
            A little love goes a long way.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.pet}
              className="flex flex-col rounded-2xl border border-stone-200 bg-stone-50 p-6 sm:p-8"
            >
              <blockquote className="flex-1 text-base leading-7 text-stone-700">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.alt}
                  className="h-14 w-14 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="font-medium text-stone-900">{testimonial.pet}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    Pet parent · {testimonial.owner}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
