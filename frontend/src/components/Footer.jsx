import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiMail } from 'react-icons/fi';

const Footer = () => (
  <footer className="bg-primary text-on-primary mt-20">
    <div className="container-max px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
      <div>
        <h3 className="font-display text-2xl text-secondary-container mb-4">ITRAFUME</h3>
        <p className="text-sm text-white/70 leading-relaxed">
          Bespoke artisanal perfume oils, hand-crafted in small batches using rare oud, attar, and floral essences.
        </p>
        <div className="flex gap-4 mt-5 text-lg">
          <a href="#" aria-label="Instagram" className="hover:text-secondary-container"><FiInstagram /></a>
          <a href="#" aria-label="Facebook" className="hover:text-secondary-container"><FiFacebook /></a>
          <a href="#" aria-label="Twitter" className="hover:text-secondary-container"><FiTwitter /></a>
          <a href="mailto:hello@itrafume.com" aria-label="Email" className="hover:text-secondary-container"><FiMail /></a>
        </div>
      </div>

      <div>
        <h4 className="font-semibold tracking-wide uppercase text-sm mb-4 text-white/90">Shop</h4>
        <ul className="space-y-2 text-sm text-white/70">
          <li><Link to="/shop" className="hover:text-secondary-container">All Products</Link></li>
          <li><Link to="/shop?category=Attar" className="hover:text-secondary-container">Attar</Link></li>
          <li><Link to="/shop?category=Oud" className="hover:text-secondary-container">Oud</Link></li>
          <li><Link to="/shop?bestseller=true" className="hover:text-secondary-container">Bestsellers</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold tracking-wide uppercase text-sm mb-4 text-white/90">Company</h4>
        <ul className="space-y-2 text-sm text-white/70">
          <li><Link to="/about" className="hover:text-secondary-container">Our Story</Link></li>
          <li><Link to="/account" className="hover:text-secondary-container">My Account</Link></li>
          <li><a href="#" className="hover:text-secondary-container">Shipping &amp; Returns</a></li>
          <li><a href="#" className="hover:text-secondary-container">Contact Us</a></li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold tracking-wide uppercase text-sm mb-4 text-white/90">Newsletter</h4>
        <p className="text-sm text-white/70 mb-3">Join for early access to new blends and exclusive offers.</p>
        <form className="flex" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Your email"
            className="flex-1 px-3 py-2 text-sm rounded-l-sm text-on-surface focus:outline-none"
          />
          <button className="bg-secondary-container text-on-secondary-container px-4 py-2 text-sm font-semibold rounded-r-sm">
            Join
          </button>
        </form>
      </div>
    </div>
    <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
      &copy; {new Date().getFullYear()} ItraFume. All rights reserved.
    </div>
  </footer>
);

export default Footer;
