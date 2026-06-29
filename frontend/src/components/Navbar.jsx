import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { House, Search, LogOut, UserPen } from "lucide-react";
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
    <nav className="flex items-center justify-between px-8 py-4 border-b border-border sticky top-0 z-10 bg-base">
      {/* Title */}
      <div>
        <p className="font-bold text-white text-lg select-none">MediaLog</p>
      </div>

      {/* Tabs */}
      <div className="flex transition gap-8 ">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive
              ? "text-white flex items-center gap-1"
              : "text-text-muted hover:text-white flex items-center gap-1"
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
              : "text-text-muted hover:text-white flex items-center gap-1"
          }
        >
          <Search size={18} />
          Search
        </NavLink>
      </div>

      {/* Avatar */}
      <div
        className="relative cursor-pointer select-none transition-transform duration-100 hover:scale-110 will-change-transform"
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
        <div className="bg-surface border border-border-strong rounded-b-md">
          <button
            className="w-full text-left px-4 py-2 text-text-secondary hover:text-text-muted hover:cursor-pointer flex items-center gap-1"
            onClick={() => {
              navigate("/profile");
            }}
          >
            <UserPen size={16} />
            Edit Profile
          </button>
          <button
            className="w-full text-left px-4 py-2 text-danger hover:text-red-400 hover:cursor-pointer flex items-center gap-1"
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