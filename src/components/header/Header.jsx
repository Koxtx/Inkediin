import { useContext, useState } from "react";
import {
  Home,
  Search,
  Bell,
  MessageSquare,
  Bookmark,
  Users,
  User,
  MoreHorizontal,
  PenSquare,
  Wrench,
  LogOut,
  Image,
} from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";
import { FaMoon } from "react-icons/fa";
import { FaSun } from "react-icons/fa";
import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/logo_inkedin_noir.png";
import logoWhite from "../../assets/logo_inkedin_blanc.png";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Desktop Header  */}
      <div className="hidden md:flex flex-col fixed h-screen w-64 bg-white dark:bg-prim dark:border-gray-700 p-4 border-r border-gray-200 z-50">
        <div className="mb-6">
          {theme === "dark" ? (
            <Link to="/">
              <img src={logoWhite} alt="logo blanc inkediin" className="w-52" />
            </Link>
          ) : (
            <Link to="/">
              <img src={logo} alt="logo inkediin" className="w-52" />
            </Link>
          )}
        </div>

        {/* Navigation Desktop */}
        <nav className="flex flex-col space-y-4 flex-grow">
          <NavLink
            to={"/"}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <Home size={24} />
            <span>Accueil</span>
          </NavLink>
          <NavLink
            to={"/feed"}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <Image size={24} />
            <span>Feed</span>
          </NavLink>
          <NavLink
            to={"/exploration"}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <Search size={24} />
            <span>Explorer</span>
          </NavLink>
          <NavLink
            to={"/notification"}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <Bell size={24} />
            <span>Notifications</span>
          </NavLink>
          <NavLink
            to={"/messagerie"}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <MessageSquare size={24} />
            <span>Messages</span>
          </NavLink>
          <NavLink
            to={"/wishlist"}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <Bookmark size={24} />
            <span>Signets</span>
          </NavLink>
          <NavLink className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <Users size={24} />
            <span>Communautés</span>
          </NavLink>
          <NavLink
            to={"/profiltatoueur"}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <User size={24} />
            <span>Profil</span>
          </NavLink>
          <NavLink className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <MoreHorizontal size={24} />
            <span>Plus</span>
          </NavLink>
        </nav>

        {/* Bouton Poster */}
        <button className="mt-4 bg-red-400 text-white py-3 px-6 rounded-full font-bold hover:bg-red-600">
          Poster
        </button>
        <div className="flex items-center justify-center gap-4 w-full mt-4">
          <button
            onClick={toggleTheme}
            className="text-xl hover:text-blue-400 transition"
          >
            {theme === "dark" ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        {/* Profil utilisateur */}
        <div className="mt-6 flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer">
          <Link to={"/profiltatoueur"} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <p className="font-semibold">Nom Utilisateur</p>
            </div>
          </Link>
          <MoreHorizontal size={20} />
        </div>
      </div>

      {/* Mobile Header (en haut) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-prim sticky top-0 z-20 w-full">
        {theme === "dark" ? (
          <Link to="/">
            <img
              src={logoWhite}
              alt="logo blanc inkediin"
              className="w-18 h-18"
            />
          </Link>
        ) : (
          <Link to="/">
            <img src={logo} alt="logo inkediin" className="w-18 h-18" />
          </Link>
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 mr-2">
            <button
              onClick={toggleTheme}
              className="text-xl hover:text-blue-400 transition"
            >
              {theme === "dark" ? <FaSun /> : <FaMoon />}
            </button>
          </div>
          <div className="relative cursor-pointer" onClick={toggleMenu}>
            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <User size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Menu latéral mobile */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 overflow-y-auto">
          <div className="mt-6 flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <p className="font-semibold">Nom Utilisateur</p>
              </div>
            </div>
            <MoreHorizontal size={20} />
          </div>

          <div className="py-4">
            <NavLink
              to={"/profiltatoueur"}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <User size={24} />
              <span>Profil</span>
            </NavLink>
            <NavLink className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Users size={24} />
              <span>Communautés</span>
            </NavLink>

            <NavLink
              to={"/wishlist"}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Bookmark size={24} />
              <span>Signets</span>
            </NavLink>
            <NavLink className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Wrench size={24} />
              <span>Paramètres et conf...</span>
            </NavLink>
            <NavLink className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700">
              <LogOut size={24} />
              <span>Déconnexion</span>
            </NavLink>
          </div>
        </div>
      )}

      {/* Overlay pour fermer le menu en cliquant en dehors */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Navigation mobile (en bas) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-prim border-t border-gray-200 dark:border-gray-700 flex justify-around p-2 z-10">
        <NavLink
          to={"/"}
          className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-red-500 p-1"
        >
          <Home size={24} />
          <span className="text-xs mt-1">Accueil</span>
        </NavLink>
        <NavLink
          to={"/feed"}
          className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-red-500 p-1"
        >
          <Image size={24} />
          <span>Feed</span>
        </NavLink>
        <NavLink
          to={"/exploration"}
          className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-red-500 p-1"
        >
          <Search size={24} />
          <span className="text-xs mt-1">Explorer</span>
        </NavLink>
        <NavLink
          to={"/notification"}
          className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-red-500 p-1"
        >
          <Bell size={24} />
          <span className="text-xs mt-1">Notif.</span>
        </NavLink>
        <NavLink
          to={"/messagerie"}
          className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-red-500 p-1"
        >
          <MessageSquare size={24} />
          <span className="text-xs mt-1">Messages</span>
        </NavLink>
      </div>
    </>
  );
}
