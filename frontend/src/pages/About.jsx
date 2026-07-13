import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const About = () => (
  <div>
    <Helmet><title>Our Story — ItraFume</title></Helmet>
    <section className="relative h-[45vh] min-h-[320px] overflow-hidden">
      <img src="/media/images/IMG-20260706-WA0020.jpg" alt="ItraFume craftsmanship" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-primary/50 flex items-center justify-center">
        <h1 className="font-display text-4xl sm:text-5xl text-white text-center px-4">Our Story</h1>
      </div>
    </section>

    <section className="container-max px-4 sm:px-6 lg:px-8 py-16 max-w-3xl mx-auto text-center">
      <p className="text-on-surface-variant leading-relaxed text-lg mb-6">
        ItraFume was born from a simple belief: that fragrance is deeply personal, and the finest perfumes
        are made by hand, not by machine. Rooted in centuries-old attar-distillation traditions, we craft
        every blend in small batches — combining rare oud, hand-harvested saffron, and triple-distilled
        Damascus rose with a modern sensibility.
      </p>
      <p className="text-on-surface-variant leading-relaxed text-lg mb-10">
        Each bottle that leaves our studio is alcohol-free, cruelty-free, and made to last on skin for hours.
        We believe luxury shouldn't come at the cost of authenticity — and every ItraFume creation reflects
        that philosophy.
      </p>
      <Link to="/shop" className="btn-primary">Explore Our Collection</Link>
    </section>
  </div>
);

export default About;
