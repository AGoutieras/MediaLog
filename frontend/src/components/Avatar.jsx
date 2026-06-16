export default function Avatar({
  username,
  size = "w-9 h-9",
  textSize = "text-sm",
}) {
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

  const avatarColor = colors[username.charCodeAt(0) % colors.length];

  const initials = username.includes(" ")
    ? username
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : username[0].toUpperCase();
  return (
    <div
      className={`${size} rounded-full ${avatarColor} flex items-center justify-center text-white ${textSize} font-bold`}
    >
      {initials}
    </div>
  );
}
