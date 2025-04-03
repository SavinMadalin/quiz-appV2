// src/Navbar.js
import { Link, useLocation } from "react-router-dom";
import { HomeIcon, ClockIcon, CogIcon } from "@heroicons/react/24/outline"; // Import icons
import classNames from "classnames"; // Import classnames

const Navbar = () => {
  return (
    <>
      {/* Navigation Links (box-like structure at the bottom) */}
      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 sm:w-10/12 md:w-3/4 lg:w-1/2 bg-white dark:bg-dark-grey shadow-lg z-10 rounded-full">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 flex justify-around items-center h-16">
          <NavLinkBottom to="/" label="Home" Icon={HomeIcon} />
          <NavLinkBottom to="/history" label="History" Icon={ClockIcon} />
          <NavLinkBottom to="/settings" label="Settings" Icon={CogIcon} />
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
        isActive
          ? "text-blue-600 dark:text-white"
          : "text-primary-color dark:text-white hover:text-blue-600 dark:hover:text-white"
      )}
    >
      <Icon className="h-6 w-6 mb-1 group-hover:text-blue-600 dark:group-hover:text-white" />
      <span className="text-xs">{label}</span>
    </Link>
  );
};

export default Navbar;
