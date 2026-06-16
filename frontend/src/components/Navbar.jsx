import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { House, Search, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const colors = [
    "bg-red-600",
    "bg-orange-600",
    "bg-amber-600",
    "bg-yellow-600",
    "bg-lime-600",
    "bg-green-600",
    "bg-emerald-600",
    "bg-teal-600",
    "bg-cyan-600",
    "bg-sky-600",
    "bg-blue-600",
    "bg-indigo-600",
    "bg-violet-600",
    "bg-purple-600",
    "bg-fuschia-600",
    "bg-pink-600",
    "bg-rose-600",
    "bg-slate-600",
    "bg-zinc-950",
  ];

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

  const avatarColor = colors[user.username.charCodeAt(0) % colors.length];

  const initials = user.username.includes(" ")
    ? user.username
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.username[0].toUpperCase();

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
        <div
          className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-bold`}
        >
          {initials}
        </div>
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
