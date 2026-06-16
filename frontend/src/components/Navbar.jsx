import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

  const { user } = useAuth();
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
    <nav className="flex items-center justify-between px-8 py-4 border-b border-zinc-800">
      {/* Title */}
      <div>
        <p>MediaLog</p>
      </div>

      {/* Tabs */}
      <div className="flex transition gap-8 ">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "text-white" : "text-zinc-400 hover:text-white"
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) =>
            isActive ? "text-white" : "text-zinc-400 hover:text-white"
          }
        >
          Search
        </NavLink>
      </div>

      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-bold`}
      >
        {initials}
      </div>
    </nav>
  );
}
