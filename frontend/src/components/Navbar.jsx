import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { House, Search, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import Avatar from "./Avatar";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (isDropdownOpen) {
      function handleClickOutside() {
        setIsDropdownOpen(false);
      }

      document.addEventListener("click", handleClickOutside);

      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  if (!user) return null;

  return (
    <nav className="relative flex items-center justify-between px-8 py-4 border-b border-zinc-800">
      {/* Title */}
      <div>
        <p className="font-bold text-white text-lg">MediaLog</p>
      </div>

      {/* Tabs */}
      <div className="flex transition gap-8 ">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive
              ? "text-white flex items-center gap-1"
              : "text-zinc-400 hover:text-white flex items-center gap-1"
          }
        >
          <House size={18} />
          Dashboard
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) =>
            isActive
              ? "text-white flex items-center gap-1"
              : "text-zinc-400 hover:text-white flex items-center gap-1"
          }
        >
          <Search size={18} />
          Search
        </NavLink>
      </div>

      {/* Avatar */}
      <div
        className="relative cursor-pointer select-none"
        onClick={(e) => {
          e.stopPropagation();
          setIsDropdownOpen(!isDropdownOpen);
        }}
      >
        <Avatar username={user.username} />
      </div>
      {/* Dropdown */}
      <div
        className="absolute right-8 top-full w-40 overflow-hidden transition-all duration-100"
        style={{
          clipPath: isDropdownOpen ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
        }}
      >
        <div className="bg-zinc-800 border border-zinc-700 rounded-b-md">
          <button
            className="w-full text-left px-4 py-2 text-red-400 hover:text-red-500 hover:cursor-pointer flex items-center gap-1"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
