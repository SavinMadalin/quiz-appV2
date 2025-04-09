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
      {/* Navigation Links (box-like structure at the bottom) */}
      {/* Responsive Navbar */}
      <nav
        className={classNames(
          "fixed z-10",
          "bottom-0 left-0 w-full h-20", // Small screens: Bottom, full-width, fixed height
          "bg-white dark:bg-dark-grey shadow-lg", // Small screens: Background and shadow
          "lg:left-0 lg:top-24 lg:bottom-auto lg:w-48 lg:h-[calc(100vh-6rem)]", // Large screens: Position, Width (increased), Height
          "lg:bg-transparent lg:dark:bg-transparent lg:shadow-none" // Large screens: Transparent background, no shadow
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
        "flex-col text-center",
        "py-2 w-20",
        "lg:flex-row lg:justify-start lg:w-full lg:py-3 lg:px-3 lg:gap-3", // Large screens: Row layout, start alignment, full width, padding, gap
        isActive
          ? "text-blue-600 dark:text-blue-400 lg:text-white lg:font-bold lg:bg-white/10" // Active state colors (small vs large)
          : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400", // Default state colors (small)
        "lg:text-white lg:hover:bg-white/5" // Large screens: White text, hover effect
      )}
    >
      <Icon className="h-5 w-5 lg:h-5 lg:w-5" />{" "}
      {/* Adjusted icon size slightly for lg */}
      <span className="text-xs lg:text-sm">{label}</span>{" "}
      {/* Adjusted text size for lg */}
    </Link>
  );
};

export default Navbar;
