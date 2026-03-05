import { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { SearchContext } from "../Context/SearchContext";
import { CartContext } from "../Context/CartContext";
import { WishlistContext } from "../Context/WishlistContext";
import { ThemeContext } from "../Context/ThemeContext";

import {
  HiMenu,
  HiX,
  HiHome,
  HiShoppingBag,
  HiHeart,
} from "react-icons/hi";

import {
  FaUserCircle,
  FaMoon,
  FaSun,
  FaShoppingCart,
} from "react-icons/fa";

import logoimage from "../assets/images/log.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useContext(AuthContext);
  const { setSearchTerm } = useContext(SearchContext);
  const { cart } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const { dark, toggleTheme } = useContext(ThemeContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [input, setInput] = useState("");
  const profileRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkStyle =
    "relative flex items-center justify-center text-xl text-gray-800 dark:text-white hover:text-[#D4AF37] dark:hover:text-[#D4AF37] transition-all duration-300 hover:scale-110";

  const activeStyle =
    "text-[#D4AF37] drop-shadow-[0_0_6px_#D4AF37]";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-[#0A0A0D]/80 border-b border-gray-200 dark:border-[#1A1A1F] shadow-sm px-6 md:px-12 py-3 flex justify-between items-center transition-all duration-300">

      {/* LEFT SIDE → Logo + Search */}
      <div className="flex items-center gap-6">

        {/* Logo */}
        <img
          src={logoimage}
          alt="Logo"
          onClick={() => navigate("/")}
          className="w-16 md:w-20 cursor-pointer object-contain hover:scale-105 transition"
        />

        {/* Search */}
        <div className="hidden md:block">
          <input
            type="text"
            placeholder="Search watches..."
            value={input}
            onChange={(e) => {
              const value = e.target.value;
              setInput(value);
              setSearchTerm(value);
              if (location.pathname !== "/") navigate("/");
            }}
            className="px-4 py-2 text-sm rounded-full bg-gray-100 dark:bg-[#141418] text-black dark:text-white border border-gray-300 dark:border-[#222228] focus:border-[#D4AF37] outline-none transition w-56"
          />
        </div>

      </div>

      {/* RIGHT SIDE → All Icons */}
      <div className="flex items-center gap-6">

        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? `${linkStyle} ${activeStyle}` : linkStyle
          }
        >
          <HiHome />
        </NavLink>

        {/* Watches */}
        <NavLink
          to="/watches"
          className={({ isActive }) =>
            isActive ? `${linkStyle} ${activeStyle}` : linkStyle
          }
        >
          <HiShoppingBag />
        </NavLink>

        {/* Wishlist */}
        <NavLink
          to="/wishlist"
          className={({ isActive }) =>
            isActive ? `${linkStyle} ${activeStyle}` : linkStyle
          }
        >
          <div className="relative">
            <HiHeart />
            {user && wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-black text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-md">
                {wishlist.length}
              </span>
            )}
          </div>
        </NavLink>

        {/* Cart */}
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            isActive ? `${linkStyle} ${activeStyle}` : linkStyle
          }
        >
          <div className="relative">
            <FaShoppingCart />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-black text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-md">
                {cart.length}
              </span>
            )}
          </div>
        </NavLink>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="text-lg text-[#D4AF37] hover:scale-110 transition"
        >
          {dark ? <FaSun /> : <FaMoon />}
        </button>

        {/* User */}
        {!user ? (
          <button
            onClick={() => navigate("/login")}
            className="text-xs border border-[#D4AF37] text-[#D4AF37] px-4 py-1.5 rounded-full hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            Login
          </button>
        ) : (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="text-2xl text-[#D4AF37] hover:scale-110 transition"
            >
              <FaUserCircle />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-[#141418] border border-gray-200 dark:border-[#222228] rounded-xl shadow-xl py-2 text-sm text-gray-800 dark:text-white">

                <button
                  onClick={() => {
                    navigate("/profile");
                    setProfileOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#1c1c22]"
                >
                  Profile
                </button>

                <button
                  onClick={() => {
                    navigate("/orders");
                    setProfileOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#1c1c22]"
                >
                  Orders
                </button>

                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                    setProfileOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-[#1c1c22]"
                >
                  Logout
                </button>

              </div>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-xl text-[#D4AF37]"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <HiX /> : <HiMenu />}
        </button>

      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full backdrop-blur-xl bg-white/90 dark:bg-[#0A0A0D]/90 border-t border-gray-200 dark:border-[#1A1A1F] md:hidden flex flex-col items-center gap-6 py-6 text-lg z-40">

          <NavLink to="/" onClick={() => setMenuOpen(false)}>
            Home
          </NavLink>

          <NavLink to="/watches" onClick={() => setMenuOpen(false)}>
            Watches
          </NavLink>

          <NavLink to="/wishlist" onClick={() => setMenuOpen(false)}>
            Wishlist
          </NavLink>

          <NavLink to="/cart" onClick={() => setMenuOpen(false)}>
            Cart
          </NavLink>

        </div>
      )}

    </nav>
  );
};

export default Navbar;