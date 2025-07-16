import React from "react";
import { NavLink } from "react-router-dom";
import {
  User,
  UserCog,
  Settings,
  HelpCircle,
  Shield,
  Volume2,
  Globe,
  Palette,
  LogOut,
} from "lucide-react";
import UserProfileSection from "./UserProfileSection";
import NavigationMenu from "./NavigationMenu";

const MobileSidebar = ({ isOpen, onClose, user, logout }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="md:hidden fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 overflow-y-auto">
        <UserProfileSection user={user} logout={logout} variant="mobile" />

        <div className="py-4">
          <NavLink
            to={"/profil"}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <User size={24} />
            <span>Profil</span>
          </NavLink>
          <NavLink
            to={"/param"}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <UserCog size={24} />
            <span>Modifier le profil</span>
          </NavLink>

          <hr className="my-4 border-gray-200 dark:border-gray-700" />

          <NavigationMenu variant="mobile" />

         

          <hr className="my-4 border-gray-200 dark:border-gray-700" />

          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-red-600 dark:text-red-400"
          >
            <LogOut size={24} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      <div
        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
    </>
  );
};

export default MobileSidebar;
