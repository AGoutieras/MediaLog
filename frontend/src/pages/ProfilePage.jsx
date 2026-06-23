import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Check, X, SquarePen } from "lucide-react";

export default function ProfilePage() {
  const { user, login, token } = useAuth();
  const [editingField, setEditingField] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [errors, setErrors] = useState({});

  async function handleSaveUsername() {
    try {
      const response = await fetch("http://localhost:3000/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: usernameInput }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrors({ username: data.message });
        return;
      }

      const data = await response.json();
      login(data.token, data.user);
      setEditingField(null);
      setErrors({});
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveEmail() {
    try {
      const response = await fetch("http://localhost:3000/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: emailInput }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrors({ email: data.message });
        return;
      }

      const data = await response.json();
      login(data.token, data.user);
      setEditingField(null);
      setErrors({});
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSavePassword() {
    if (passwordInput !== confirmPasswordInput) {
      setErrors({ confirmPassword: "Passwords do not match" });
      console.error("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPasswordInput,
          password: passwordInput,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.message === "Current password is incorrect") {
          setErrors({ currentPassword: data.message });
        } else {
          setErrors({ password: data.message });
        }
        console.error(data.message);
        return;
      }

      const data = await response.json();
      login(data.token, data.user);
      setEditingField(null);
      setCurrentPasswordInput("");
      setPasswordInput("");
      setConfirmPasswordInput("");
      setErrors({});
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="max-w-md mx-auto px-8 py-12">
      <h1 className="text-white text-2xl font-bold mb-6">Edit Profile</h1>

      {/* Username */}
      <div className="py-3 border-b border-zinc-800">
        <label className="text-zinc-500 text-xs uppercase tracking-wide">
          Username
        </label>
        <div className="flex items-center justify-between mt-1">
          {editingField === "username" ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder={user.username}
                className={`bg-zinc-800 border rounded-md px-3 py-1 flex-1 focus:outline-none ${
                  errors.username
                    ? "border-red-500"
                    : "border-zinc-600 focus:border-zinc-400"
                }`}
              />
              <button
                onClick={handleSaveUsername}
                className="text-green-400 hover:text-green-300 cursor-pointer"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <span className="text-white">{user.username}</span>
              <button
                onClick={() => setEditingField("username")}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <SquarePen size={16} />
              </button>
            </>
          )}
        </div>
        {errors.username && (
          <p className="text-red-400 text-xs mt-1">{errors.username}</p>
        )}
      </div>

      {/* Email */}
      <div className="py-3 border-b border-zinc-800">
        <label className="text-zinc-500 text-xs uppercase tracking-wide">
          Email
        </label>
        <div className="flex items-center justify-between mt-1">
          {editingField === "email" ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder={user.email}
                className={`bg-zinc-800 border rounded-md px-3 py-1 flex-1 focus:outline-none ${
                  errors.email
                    ? "border-red-500"
                    : "border-zinc-600 focus:border-zinc-400"
                }`}
              />
              <button
                onClick={handleSaveEmail}
                className="text-green-400 hover:text-green-300 cursor-pointer"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <span className="text-white">{user.email}</span>
              <button
                onClick={() => setEditingField("email")}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <SquarePen size={16} />
              </button>
            </>
          )}
        </div>
        {errors.email && (
          <p className="text-red-400 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="py-3 border-b border-zinc-800">
        <label className="text-zinc-500 text-xs uppercase tracking-wide">
          Password
        </label>
        <div className="flex items-center justify-between mt-1">
          {editingField === "password" ? (
            <div className="flex flex-col gap-2 flex-1">
              <input
                type="password"
                value={currentPasswordInput}
                onChange={(e) => setCurrentPasswordInput(e.target.value)}
                placeholder="Current password"
                className={`bg-zinc-800 border rounded-md px-3 py-1 flex-1 focus:outline-none ${
                  errors.currentPassword
                    ? "border-red-500"
                    : "border-zinc-600 focus:border-zinc-400"
                }`}
              />
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="New password"
                className={`bg-zinc-800 border rounded-md px-3 py-1 flex-1 focus:outline-none ${
                  errors.password || errors.confirmPassword
                    ? "border-red-500"
                    : "border-zinc-600 focus:border-zinc-400"
                }`}
              />
              <input
                type="password"
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                placeholder="Confirm new password"
                className={`bg-zinc-800 border rounded-md px-3 py-1 flex-1 focus:outline-none ${
                  errors.password || errors.confirmPassword
                    ? "border-red-500"
                    : "border-zinc-600 focus:border-zinc-400"
                }`}
              />
              <div className="flex gap-2 justify-end mt-1">
                <button
                  onClick={handleSavePassword}
                  className="text-green-400 hover:text-green-300 cursor-pointer"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className="text-white">••••••••</span>
              <button
                onClick={() => setEditingField("password")}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <SquarePen size={16} />
              </button>
            </>
          )}
        </div>
        {errors.currentPassword && (
          <p className="text-red-400 text-xs mt-1">{errors.currentPassword}</p>
        )}
        {errors.password && (
          <p className="text-red-400 text-xs mt-1">{errors.password}</p>
        )}
        {errors.confirmPassword && (
          <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
        )}
      </div>
    </div>
  );
}
