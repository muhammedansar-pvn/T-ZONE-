import { NavLink } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black border-t border-yellow-500/20 py-12 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">
        
        {/* Logo Section */}
        <div>
          <h3 className="text-2xl font-bold text-yellow-500 mb-4">
            T-ZONE
          </h3>
          <p>
            Premium watch collections crafted for elegance and timeless luxury.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-yellow-400 font-semibold mb-4">
            Quick Links
          </h4>
          <ul className="space-y-2">
            <li>
              <NavLink to="/" className="hover:text-yellow-400 transition">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/watches" className="hover:text-yellow-400 transition">
                Watches
              </NavLink>
            </li>
            <li>
              <NavLink to="/cart" className="hover:text-yellow-400 transition">
                Cart
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-yellow-400 font-semibold mb-4">
            Contact
          </h4>
          <p>Email: ansarbinkunhimarakkar@gmail.com</p>
          <p>Phone: +91 7994050309</p>

          {/* Social Icons */}
          <div className="flex gap-4 mt-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 p-3 rounded-full hover:bg-yellow-500 hover:text-black transition duration-300 hover:scale-110"
            >
              <FaFacebookF />
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 p-3 rounded-full hover:bg-yellow-500 hover:text-black transition duration-300 hover:scale-110"
            >
              <FaInstagram />
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 p-3 rounded-full hover:bg-yellow-500 hover:text-black transition duration-300 hover:scale-110"
            >
              <FaTwitter />
            </a>

            <a
              href="https://wa.me/917994050309"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 p-3 rounded-full hover:bg-yellow-500 hover:text-black transition duration-300 hover:scale-110"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="text-center mt-10 text-sm text-gray-500">
        © 2026 T-Zone. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
