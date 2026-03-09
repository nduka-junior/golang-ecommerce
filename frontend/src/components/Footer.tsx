import Link from "next/link";
import { Twitter, Facebook, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Description */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-bold text-white">
              Shop
            </Link>
            <p className="text-gray-400 text-sm">
              Your one-stop shop for premium products. Fast delivery, great
              prices, and excellent support.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/products" className="hover:text-white transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition">
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login"
                  className="hover:text-white transition"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="hover:text-white transition"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/help" className="hover:text-white transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center">
                <span className="mr-2">📧</span>
                <a
                  href="mailto:support@shop.com"
                  className="hover:text-white transition"
                >
                  support@shop.com
                </a>
              </li>
              <li className="flex items-center">
                <span className="mr-2">📞</span>
                <a
                  href="tel:+234123456789"
                  className="hover:text-white transition"
                >
                  +234 123 456 789
                </a>
              </li>
              <li className="flex items-center">
                <span className="mr-2">📍</span>
                <span>Ibadan, Oyo State, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>© {currentYear} Shop. All rights reserved.</p>
          <p className="mt-2">
            Built with ❤️ by{" "}
            <a
              href="https://x.com/nduka_junior"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Nduka Junior
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
