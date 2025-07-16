import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, UserCog, Palette, LogOut } from 'lucide-react';
import ProfileImage from './ProfileImage';

const UserProfileSection = ({ user, logout, variant = 'desktop' }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuItems = [
    { to: "/param", icon: UserCog, label: "Modifier le profil" },
    { to: "/apparence", icon: Palette, label: "Apparence" },
  ];

  if (variant === 'mobile') {
    return (
      <div className="mt-6 flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
        <Link to={"/profil"} className="flex items-center gap-3">
          <ProfileImage user={user} />
          <div>
            <p className="font-semibold">{user?.nom || "Utilisateur"}</p>
            {user?.userType && (
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user.userType}
              </p>
            )}
          </div>
        </Link>
        <MoreHorizontal size={20} />
      </div>
    );
  }

  return (
    <div className="mt-6 relative" ref={userMenuRef}>
      <div className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer">
        <Link to={"/profil"} className="flex items-center gap-3">
          <ProfileImage user={user} />
          <div>
            <p className="font-semibold">{user?.nom || "Utilisateur"}</p>
            {user?.userType && (
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user.userType}
              </p>
            )}
          </div>
        </Link>
        <button onClick={toggleUserMenu}>
          <MoreHorizontal size={20} />
        </button>
      </div>

      {isUserMenuOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-60">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
          <hr className="my-2 border-gray-200 dark:border-gray-700" />
          <button
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm w-full text-left text-red-600 dark:text-red-400"
            onClick={logout}
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileSection;