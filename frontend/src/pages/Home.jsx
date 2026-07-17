import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Loader from '../components/ProtectedRoute';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/products/featured')
      .then(({ data }) => setFeatured(data.data.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Helmet>
        <title>ItraFume — Bespoke Artisanal Perfume Oils</title>
      </Helmet>

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] overflow-hidden bg-primary">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          poster="/media/images/IMG-20260706-WA0000.jpg"
        >
          <source src="/media/videos/VID-20260706-WA0034.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
        <div className="relative h-full container-max px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16">
          <p className="text-secondary-container uppercase tracking-[0.3em] text-xs sm:text-sm mb-4">
            Handcrafted &middot; Small Batch &middot; Alcohol-Free
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white max-w-2xl leading-tight mb-6">
            The Art of Bespoke Fragrance
          </h1>
          <p className="text-white/80 max-w-lg mb-8 text-sm sm:text-base">
            Discover rare oud, Damascus rose, and artisanal attars — poured by hand, worn by generations.
          </p>
          <div className="flex gap-4">
            <Link to="/shop" className="btn-secondary">Shop Collection</Link>
            <Link to="/about" className="border border-white text-white px-6 py-3 rounded-sm font-semibold text-sm tracking-wider uppercase hover:bg-white hover:text-primary transition-all">
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="container-max px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-secondary mb-1">Curated For You</p>
            <h2 className="font-display text-3xl">Featured Blends</h2>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-primary hover:underline hidden sm:block">
            View All &rarr;
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Story strip */}
      <section className="bg-surface-container-low py-16">
        <div className="container-max px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="grid grid-cols-2 gap-4">
            <img src="/media/images/IMG-20260706-WA0057.jpg" alt="Craft of ItraFume" className="rounded-md object-cover h-64 w-full" />
            <img src="/media/images/IMG-20260706-WA0032.jpg" alt="Bespoke perfume oils" className="rounded-md object-cover h-64 w-full mt-8" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-secondary mb-2">Our Craft</p>
            <h2 className="font-display text-3xl mb-4">Centuries-Old Tradition, Modern Artistry</h2>
            <p className="text-on-surface-variant leading-relaxed mb-6">
              Every ItraFume blend is hand-poured in small batches using traditional attar distillation
              techniques passed down through generations, paired with rare, ethically-sourced ingredients
              from across the world.
            </p>
            <Link to="/about" className="btn-outline">Read Our Story</Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="container-max px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          ['100% Alcohol-Free', 'Pure oil-based perfumes, gentle on skin'],
          ['Handcrafted in Small Batches', 'Quality over quantity, always'],
          ['Secure Payments', 'Razorpay &amp; Stripe protected checkout'],
          ['Free Shipping ₹999+', 'Fast, discreet delivery nationwide'],
        ].map(([title, desc]) => (
          <div key={title}>
            <h4 className="font-display text-lg mb-1">{title}</h4>
            <p className="text-xs text-on-surface-variant" dangerouslySetInnerHTML={{ __html: desc }} />
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
