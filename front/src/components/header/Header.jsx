import React, { useContext, useState } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import Logo from "./components/Logo";
import ThemeToggle from "./components/ThemeToggle";
import ProfileImage from "./components/ProfileImage";
import UserProfileSection from "./components/UserProfileSection";
import NavigationMenu from "./components/NavigationMenu";
import MobileSidebar from "./components/MobileSidebar";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { logout, user } = useContext(AuthContext);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:flex flex-col fixed h-screen w-64 bg-white dark:bg-prim dark:border-gray-700 p-4 border-r border-gray-200 z-50">
        <div className="mb-6">
          <Logo theme={theme} />
        </div>
        {user ? (
          <>
            <NavigationMenu variant="desktop" />

            <UserProfileSection user={user} logout={logout} />
          </>
        ) : (
          <div className="flex items-end justify-center gap-4 w-full mt-4">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        )}
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-prim sticky top-0 z-20 w-full">
        <Logo theme={theme} size="small" />

        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 mr-2">
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
            <div className="relative cursor-pointer" onClick={toggleMenu}>
              <ProfileImage user={user} />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 mr-2">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        )}
      </div>

      {user ? (
        <>
          <MobileSidebar
            isOpen={isMenuOpen}
            onClose={closeMenu}
            user={user}
            logout={logout}
          />
          <NavigationMenu variant="mobile-bottom" />
        </>
      ) : null}
    </>
  );
}
