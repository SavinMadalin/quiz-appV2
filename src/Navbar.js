// src/Navbar.js
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ClockIcon,
  CogIcon,
  StarIcon,
} from "@heroicons/react/24/outline"; // Import icons
import classNames from "classnames"; // Import classnames

const Navbar = () => {
  return (
    <>
      {/* Responsive Navbar */}
      <nav
        className={classNames(
          "fixed z-10",
          "bottom-0 left-0 w-full h-16", // Small screens: Bottom, full-width, fixed height
          // "bg-gradient-to-t from-gray-200 to-gray-500 border-t border-gray-600",
          // Dark theme gradient (dark gray) and border
          // "dark:bg-gradient-to-t dark:from-gray-200 dark:to-gray-900 dark:border-gray-600",
          "bg-gray-100 dark:bg-gray-800 sm:border-t sm:border-t-gray-300 sm:dark:border-t-gray-700", // Gray background for large screens
          "lg:bg-indigo-100 lg:dark:bg-indigo-1000 lg:shadow-none lg:border-r lg:border-r-indigo-200 dark:border-r-gray-700 lg:rounded-tr-xl lg:rounded-br-xl", // Large screens: specific background, no top border, add right border and round right corners

          "lg:left-0 lg:top-12 lg:bottom-auto lg:w-48 lg:h-[calc(100vh-3rem)]" // Large screens: Position, Width, Height
          // Added lg:bg-none to ensure gradient is removed
        )}
      >
        <div
          className={classNames(
            "mx-auto flex items-center h-full",
            "px-4 sm:px-6 justify-around", // Small screens: Horizontal layout, space items
            "lg:flex-col lg:justify-start lg:items-start lg:pt-8 lg:gap-4 lg:px-4" // Large screens: Vertical column, align items left, padding, reduced gap
          )}
        >
          <NavLinkBottom to="/" label="Home" Icon={HomeIcon} />
          <NavLinkBottom to="/history" label="History" Icon={ClockIcon} />
          <NavLinkBottom to="/settings" label="Settings" Icon={CogIcon} />
          <NavLinkBottom
            to="/subscription"
            label="Premium"
            Icon={StarIcon}
          />{" "}
          {/* Add Subscription Link */}
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
      title={label}
      className={classNames(
        "group flex items-center justify-center transition-colors duration-200 rounded-md", // Base flex, center items
        "flex-col text-center", // Small screens: Column layout
        "py-2 w-20", // Small screens: Padding and width
        "lg:flex-row lg:justify-start lg:w-full lg:py-3 lg:px-3 lg:gap-3", // Large screens: Row layout, start alignment, full width, padding, gap
        isActive
          ? // Active State: Added background for small screens, adjusted lg background
            "font-bold text-gray-900 dark:text-white bg-gray-300 dark:bg-gray-600 lg:bg-indigo-200 lg:dark:bg-gray-600"
          : // Default State: Removed font-bold, added background hover for small screens
            "text-gray-800 dark:text-white hover:bg-gray-400/30 dark:hover:bg-gray-600/30 lg:text-gray-700 lg:dark:text-white lg:hover:bg-indigo-200 lg:dark:hover:bg-gray-700/50"
      )}
    >
      {/* Updated lg icon size */}
      <Icon className="h-5 w-5 lg:h-6 lg:w-6" />
      <span className="text-xs lg:text-sm">{label}</span> {/* Text size */}
    </Link>
  );
};

export default Navbar;
