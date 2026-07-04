import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-black text-gray-400 py-12 px-4 md:px-8 border-t border-gray-900">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Summary */}
        <div className="space-y-4">
          <span className="text-lg font-bold tracking-[0.2em] text-white">MERRKY LONDON</span>
          <p className="text-xs text-gray-500 leading-relaxed">
            Experience premium curated luxury fashion. Crafted in London, inspired globally. Hand-tailored designs for the modern look.
          </p>
          <div className="flex space-x-4 pt-2">
            <a href="#" className="hover:text-white transition"><FacebookIcon /></a>
            <a href="#" className="hover:text-white transition"><InstagramIcon /></a>
            <a href="#" className="hover:text-white transition"><TwitterIcon /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-semibold text-white tracking-widest uppercase mb-4">Shop Collections</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/products?category=men" className="hover:text-white transition">Men's Wear</Link></li>
            <li><Link to="/products?category=women" className="hover:text-white transition">Women's Wear</Link></li>
            <li><Link to="/products?category=kids" className="hover:text-white transition">Kids' Collection</Link></li>
            <li><Link to="/products?category=accessories" className="hover:text-white transition">Accessories</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-xs font-semibold text-white tracking-widest uppercase mb-4">Customer Support</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
            <li><a href="#" className="hover:text-white transition">Shipping & Delivery</a></li>
            <li><a href="#" className="hover:text-white transition">Returns & Exchanges</a></li>
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Newsletter / Contact */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-white tracking-widest uppercase">Newsletter</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Subscribe to get updates on special offers, new arrivals, and styling trends.
          </p>
          <form className="flex" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="w-full bg-gray-900 border border-gray-800 text-xs px-3 py-2 outline-none text-white focus:border-white transition"
            />
            <button className="bg-white text-black font-semibold text-xs px-4 hover:bg-gray-200 transition">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl mt-12 pt-6 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} MERRKY LONDON. All rights reserved.</p>
        <p className="mt-2 md:mt-0">Designed for Visual Excellence</p>
      </div>
    </footer>
  );
};

export default Footer;
