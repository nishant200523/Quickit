import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useThemeStore from "../store/themeStore";
import useUserStore from "../store/useUserStore";
import useLayoutStore from "../store/layoutStore";
import { TbMessage2Heart, TbUserCircle } from "react-icons/tb";
import { motion } from "framer-motion";
import { MdOutlineRadioButtonChecked } from "react-icons/md";
import { FaCog, FaMoon, FaSun, FaSignOutAlt } from "react-icons/fa";
import { disconnectSocket } from "../services/chat.service";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsMenuRef = useRef(null);
  const { theme, setTheme } = useThemeStore();
  const { user, logout } = useUserStore();
  const { activeTab, setActiveTab, selectedContact } = useLayoutStore();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (location.pathname === "/") {
      setActiveTab("chats");
    } else if (location.pathname === "/status") {
      setActiveTab("status");
    } else if (location.pathname === "/user-profile") {
      setActiveTab("profile");
    } else if (location.pathname === "/setting") {
      setActiveTab("setting");
    }
  }, [location, setActiveTab]);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (isMobile && selectedContact) {
    return null;
  }

  const SidebarContent = (
    <>
      <Link
        to="/"
        className={`${isMobile ? " " : "mb-8"} ${
          activeTab === "chats" && "bg-gray-300 shadow-sm p-2 rounded-full"
        }`}
      >
        <TbMessage2Heart
          className={`h-6 w-6 ${
            activeTab === "chats"
              ? theme === "dark"
                ? "text-gray-800"
                : ""
              : theme === "dark"
              ? "text-gray-300"
              : "text-gray-800"
          } focus:outline-none`}
        />
      </Link>

      <Link
        to="/status"
        className={`${isMobile ? " " : "mb-8"} ${
          activeTab === "status" && "bg-gray-300 shadow-sm p-2 rounded-full"
        }`}
      >
        <MdOutlineRadioButtonChecked
          className={`h-6 w-6 ${
            activeTab === "status"
              ? theme === "dark"
                ? "text-gray-800"
                : ""
              : theme === "dark"
              ? "text-gray-300"
              : "text-gray-800"
          } focus:outline-none`}
        />
      </Link>

      {!isMobile && <div className="flex-grow" />}

      <Link
        to="/user-profile"
        className={`${isMobile ? " " : "mb-8"} ${
          activeTab === "profile" && "bg-gray-300 shadow-sm p-2 rounded-full"
        } focus:outline-none`}
      >
        {user?.profilePicture ? (
          <img
            src={user?.profilePicture}
            alt="user"
            className="h-6 w-6 rounded-full"
          />
        ) : (
          <TbUserCircle
            className={`h-6 w-6 ${
              activeTab === "profile"
                ? theme === "dark"
                  ? "text-gray-800"
                  : ""
                : theme === "dark"
                ? "text-gray-300"
                : "text-gray-800"
            } focus:outline-none`}
          />
        )}
      </Link>

      {/* Settings Icon with Dropdown */}
      <div className={`${isMobile ? " " : "mb-8"} relative`} ref={settingsMenuRef}>
        <button
          onClick={() => setShowSettingsMenu(!showSettingsMenu)}
          className={`${
            activeTab === "setting" && "bg-gray-300 shadow-sm p-2 rounded-full"
          } focus:outline-none`}
        >
          <FaCog
            className={`h-6 w-6 ${
              activeTab === "setting"
                ? theme === "dark"
                  ? "text-gray-800"
                  : ""
                : theme === "dark"
                ? "text-gray-300"
                : "text-gray-800"
            } focus:outline-none`}
          />
        </button>

        {/* Settings Dropdown Menu */}
        {showSettingsMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${
              isMobile ? "bottom-full mb-2 right-0" : "left-full ml-2 bottom-0"
            } w-56 rounded-lg shadow-xl ${
              theme === "dark"
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            } py-2 z-50`}
          >
            {/* User Info */}
            <div className={`px-4 py-3 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
              <div className="flex items-center space-x-3">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="user"
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <TbUserCircle className="h-10 w-10 text-gray-400" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {user?.username || "User"}
                  </p>
                  <p className={`text-xs truncate ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    {user?.email || ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`w-full px-4 py-3 flex items-center space-x-3 ${
                theme === "dark"
                  ? "hover:bg-gray-700 text-gray-200"
                  : "hover:bg-gray-100 text-gray-700"
              } transition-colors`}
            >
              {theme === "dark" ? (
                <FaSun className="h-5 w-5 text-yellow-400" />
              ) : (
                <FaMoon className="h-5 w-5 text-blue-500" />
              )}
              <span className="text-sm font-medium">
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`w-full px-4 py-3 flex items-center space-x-3 border-t ${
                theme === "dark"
                  ? "border-gray-700 hover:bg-red-900/20 text-red-400"
                  : "border-gray-200 hover:bg-red-50 text-red-600"
              } transition-colors`}
            >
              <FaSignOutAlt className="h-5 w-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </motion.div>
        )}
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`${
        isMobile
          ? "fixed bottom-0 left-0 right-0 h-16"
          : "w-16 h-screen border-r-2"
      }
      ${
        theme === "dark"
          ? "bg-gray-800 border-gray-600"
          : "bg-[rgb(239,242,254)] border-gray-300"
      }

      bg-opacity-90 flex items-center py-4 shadow-lg
      ${isMobile ? "flex-row justify-around" : "flex-col justify-between"}
      
      `}
    >
      {SidebarContent}
    </motion.div>
  );
};

export default Sidebar;
