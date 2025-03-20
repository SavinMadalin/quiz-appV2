// src/Navbar.js
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { HomeIcon, ClockIcon, CogIcon } from '@heroicons/react/24/outline'; // Import icons
import classNames from 'classnames'; // Import classnames

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation(); // Get the current route location

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    setIsMenuOpen(false); // Close the menu when route changes
  }, [location]);

  return (
    <>
      {/* Mobile Menu (hidden by default) */}
      <div className={`md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-dark-grey shadow-md z-20 ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="flex flex-col space-y-2 py-2">
          {<NavLinkBottom to="/" label="Home" Icon={HomeIcon} />}
          {<NavLinkBottom to="/history" label="History" Icon={ClockIcon} />}
          {<NavLinkBottom to="/settings" label="Settings" Icon={CogIcon} />}
        </div>
      </div>
      {/* Navigation Links (box-like structure at the bottom) */}
      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 sm:w-10/12 md:w-3/4 lg:w-1/2 bg-white dark:bg-dark-grey shadow-lg z-10 rounded-full">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 flex justify-around items-center h-16">
          <NavLinkBottom to="/" label="Home" Icon={HomeIcon} />
          <NavLinkBottom to="/history" label="History" Icon={ClockIcon} />
          <NavLinkBottom to="/settings" label="Settings" Icon={CogIcon} />

          {/* Responsive menu button for smaller screens (hamburger icon) */}
          <div className="md:hidden">
            <button className="text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-400 focus:outline-none" onClick={toggleMenu}>
              {/* Add onClick */}
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

// Reusable NavLink component for the bottom navigation
const NavLinkBottom = ({ to, label, Icon }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={classNames(
                "group flex flex-col items-center justify-center text-center py-2 w-20",
                isActive ? "text-blue-600 dark:text-white" : "text-primary-color dark:text-white hover:text-blue-600 dark:hover:text-white"
            )}
        >
            <Icon className="h-6 w-6 mb-1 group-hover:text-blue-600 dark:group-hover:text-white" />
            <span className="text-xs">{label}</span>
        </Link>
    );
};

export default Navbar;
