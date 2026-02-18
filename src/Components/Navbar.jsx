import { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { SearchContext } from "../Context/SearchContext";
import { CartContext } from "../Context/CartContext";
import { ThemeContext } from "../Context/ThemeContext";
import { HiMenu, HiX } from "react-icons/hi";
import { FaUserCircle, FaMoon, FaSun } from "react-icons/fa";
import logoimage from "../assets/images/log.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useContext(AuthContext);
  const { setSearchTerm } = useContext(SearchContext);
  const { cart } = useContext(CartContext);
  const { dark, toggleTheme } = useContext(ThemeContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [input, setInput] = useState("");
  const profileRef = useRef();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkBase =
    "hover:text-[#D4AF37] transition duration-300 text-[11px] tracking-[2px] uppercase";

  const activeLink = "text-[#D4AF37]";

  return (
    <nav className="relative sticky top-0 z-50 bg-white dark:bg-[#0A0A0D] text-black dark:text-white backdrop-blur-md px-6 md:px-10 py-3 flex justify-between items-center border-b border-gray-200 dark:border-[#1A1A1F] transition-colors duration-300">

      {/* Logo */}
      <img
        src={logoimage}
        alt="Logo"
        onClick={() => navigate("/")}
        className="w-16 md:w-20 cursor-pointer object-contain"
      />

      {/* Desktop Links */}
      <div className="hidden md:flex gap-8 items-center font-light">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? `${linkBase} ${activeLink}` : linkBase
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/watches"
          className={({ isActive }) =>
            isActive ? `${linkBase} ${activeLink}` : linkBase
          }
        >
          Watches
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            isActive ? `${linkBase} ${activeLink}` : linkBase
          }
        >
          <div className="relative">
            Cart
            <span className="absolute -top-2 -right-4 bg-[#D4AF37] text-black text-[9px] px-1.5 rounded-full">
              {/* {cart.length} */}
            </span>
          </div>
        </NavLink>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 relative">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="text-lg text-[#D4AF37] hover:scale-110 transition"
        >
          {dark ? <FaSun /> : <FaMoon />}
        </button>

        {/* Live Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search watches..."
            value={input}
            onChange={(e) => {
              const value = e.target.value;
              setInput(value);
              setSearchTerm(value);

              if (location.pathname !== "/") {
                navigate("/");
              }
            }}
            className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-[#141418] text-black dark:text-white border border-gray-300 dark:border-[#222228] focus:border-[#D4AF37] outline-none transition w-40"
          />
        </div>

        {/* User Section */}
        {!user ? (
          <button
            onClick={() => navigate("/login")}
            className="text-[11px] border border-[#D4AF37] text-[#D4AF37] px-3 py-1 rounded-full hover:bg-[#D4AF37] hover:text-black transition duration-300"
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
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#141418] border border-gray-200 dark:border-[#222228] rounded-lg shadow-lg py-2 text-sm">
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

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-[#0A0A0D] border-t border-gray-200 dark:border-[#1A1A1F] md:hidden flex flex-col items-center gap-6 py-6 text-sm tracking-[2px] uppercase z-40">

          <NavLink
            to="/"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              isActive ? `${linkBase} ${activeLink}` : linkBase
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/watches"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              isActive ? `${linkBase} ${activeLink}` : linkBase
            }
          >
            Watches
          </NavLink>

          <NavLink
            to="/cart"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              isActive ? `${linkBase} ${activeLink}` : linkBase
            }
          >
            <div className="relative">
              Cart
              <span className="absolute -top-2 -right-4 bg-[#D4AF37] text-black text-[9px] px-1.5 rounded-full">
                {cart.length}
              </span>
            </div>
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
