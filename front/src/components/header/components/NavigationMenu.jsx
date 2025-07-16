import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Search,
  Bell,
  MessageSquare,
  Bookmark,
  Users,
  User,
  Image,
} from 'lucide-react';

const NavigationMenu = ({ variant = 'desktop' }) => {
  const menuItems = [
    { to: "/", icon: Home, label: "Accueil" },
    { to: "/tatoueur", icon: Image, label: "Tatoueur" },
    { to: "/exploration", icon: Search, label: "Explorer" },
    { to: "/notification", icon: Bell, label: "Notifications" },
    { to: "/messagerie", icon: MessageSquare, label: "Messages" },
    { to: "/wishlist", icon: Bookmark, label: "Signets" },
    { to: "/mentionlegal", icon: Users, label: "Communautés" },
    { to: "/profil", icon: User, label: "Profil" },
  ];

  if (variant === 'mobile-bottom') {
    const bottomMenuItems = menuItems.slice(0, 5);
    
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-prim border-t border-gray-200 dark:border-gray-700 flex justify-around p-2 z-10">
        {bottomMenuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-red-500 p-1"
          >
            <item.icon size={24} />
            <span className="text-xs mt-1">
              {item.label === "Notifications" ? "Notif" : item.label}
            </span>
          </NavLink>
        ))}
      </div>
    );
  }

  const linkClass = variant === 'desktop' 
    ? "flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
    : "flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700";

  return (
    <nav className={variant === 'desktop' ? "flex flex-col space-y-4 flex-grow" : "py-4"}>
      {menuItems.map((item, index) => (
        <NavLink
          key={index}
          to={item.to}
          className={linkClass}
        >
          <item.icon size={24} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default NavigationMenu;