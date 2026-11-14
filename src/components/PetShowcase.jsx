const pets = [
  {
    name: 'For the goodest companions.',
    description:
      'From everyday meals to little rewards, find thoughtful essentials for every wag, walk, and quiet moment together.',
    image:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1400&q=85',
    alt: 'Golden retriever enjoying a sunny day outdoors',
    imagePosition: 'object-center',
  },
  {
    name: 'And the curious kings and queens.',
    description:
      'Make room for every purr and playful pounce with nourishing favourites chosen for the cats who make a house a home.',
    image:
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1400&q=85',
    alt: 'Cat relaxing comfortably at home',
    imagePosition: 'object-center',
  },
]

export default function PetShowcase() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
      <div className="mb-12 max-w-2xl sm:mb-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
          Made for life with pets
        </p>
        <h1 className="mt-4 text-4xl font-medium leading-tight tracking-tight text-stone-900 sm:text-5xl">
          More love in every little moment.
        </h1>
      </div>

      <div className="space-y-16 sm:space-y-24 lg:space-y-28">
        {pets.map((pet, index) => (
          <article
            key={pet.name}
            className={`grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-20 ${
              index % 2 === 1 ? 'lg:[&>div:first-child]:order-2' : ''
            }`}
          >
            <div className="overflow-hidden rounded-2xl bg-stone-200">
              <img
                src={pet.image}
                alt={pet.alt}
                className={`aspect-[4/3] w-full object-cover ${pet.imagePosition}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
              />
            </div>
            <div className="max-w-xl py-2 lg:py-8">
              <p className="text-sm font-medium text-emerald-800">
                {index === 0 ? 'For the dogs' : 'For the cats'}
              </p>
              <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
                {pet.name}
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
                {pet.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
