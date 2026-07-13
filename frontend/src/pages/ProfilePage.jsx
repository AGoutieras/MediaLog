import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Check, X, SquarePen } from 'lucide-react'

/**
 * ProfilePage
 * Inline edit interface for username, email, and password.
 * Only one field can be in edit mode at a time (controlled by editingField state).
 * Clicking the pencil icon switches that field to edit mode; the others stay read-only.
 *
 * On successful save, the backend returns a fresh JWT (since username and email
 * are encoded in the payload). login() is called with the new token to update
 * auth state without requiring a logout/login cycle.
 *
 * Input state is reset when opening a field to avoid stale values from
 * a previous edit session appearing in the input.
 */
export default function ProfilePage() {
  const { user, login, token } = useAuth()
  const [editingField, setEditingField] = useState(null)
  const [usernameInput, setUsernameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [currentPasswordInput, setCurrentPasswordInput] = useState('')
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('')
  // errors is an object keyed by field name for per-field error display
  const [errors, setErrors] = useState({})

  async function handleSaveUsername() {
    try {
      const response = await fetch('http://localhost:3000/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: usernameInput }),
      })

      if (!response.ok) {
        const data = await response.json()
        // Refresh the JWT and user state with the updated username
        setErrors({ username: data.message })
        return
      }

      const data = await response.json()
      login(data.token, data.user)
      setEditingField(null)
      setErrors({})
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSaveEmail() {
    try {
      const response = await fetch('http://localhost:3000/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: emailInput }),
      })

      if (!response.ok) {
        const data = await response.json()
        setErrors({ email: data.message })
        return
      }

      const data = await response.json()
      login(data.token, data.user)
      setEditingField(null)
      setErrors({})
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSavePassword() {
    // Client-side check before hitting the API
    if (passwordInput !== confirmPasswordInput) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      console.error('Passwords do not match')
      return
    }

    try {
      const response = await fetch('http://localhost:3000/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPasswordInput,
          password: passwordInput,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        // Map the "incorrect current password" error to its specific field
        if (data.message === 'Current password is incorrect') {
          setErrors({ currentPassword: data.message })
        } else {
          setErrors({ password: data.message })
        }
        console.error(data.message)
        return
      }

      const data = await response.json()
      login(data.token, data.user)
      setEditingField(null)
      // Clear all password inputs after a successful change
      setCurrentPasswordInput('')
      setPasswordInput('')
      setConfirmPasswordInput('')
      setErrors({})
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen flex justify-center pt-24">
      <div className="bg-surface border border-border-strong rounded-xl p-12 w-150 h-fit shadow-[0_34px_70px_-18px_rgba(0,0,0,0.78)]">
        <h1 className="text-white text-2xl font-bold mb-6">Edit Profile</h1>

        {/* Username */}
        <div className="py-3 border-b border-border">
          <label className="text-text-muted text-xs uppercase tracking-wide">
            Username
          </label>
          <div className="flex items-center justify-between mt-1">
            {editingField === 'username' ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  placeholder={user.username}
                  className={`bg-surface-2 border rounded-md px-3 py-1 flex-1 text-white focus:outline-none placeholder:text-text-muted ${
                    errors.username
                      ? 'border-red-500'
                      : 'border-border-strong focus:border-accent'
                  }`}
                />
                <button
                  onClick={handleSaveUsername}
                  className="text-success hover:text-green-300 cursor-pointer"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="text-text-muted hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <>
                <span className="text-white">{user.username}</span>
                <button
                  onClick={() => {
                    // Reset input state before entering edit mode to avoid stale values
                    setUsernameInput('')
                    setEditingField('username')
                  }}
                  className="text-text-muted hover:text-white cursor-pointer"
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
        <div className="py-3 border-b border-border">
          <label className="text-text-muted text-xs uppercase tracking-wide">
            Email
          </label>
          <div className="flex items-center justify-between mt-1">
            {editingField === 'email' ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder={user.email}
                  className={`bg-surface-2 border rounded-md px-3 py-1 flex-1 text-white focus:outline-none placeholder:text-text-muted ${
                    errors.email
                      ? 'border-red-500'
                      : 'border-border-strong focus:border-accent'
                  }`}
                />
                <button
                  onClick={handleSaveEmail}
                  className="text-success hover:text-green-300 cursor-pointer"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="text-text-muted hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <>
                <span className="text-white">{user.email}</span>
                <button
                  onClick={() => {
                    setUsernameInput('')
                    setEditingField('email')
                  }}
                  className="text-text-muted hover:text-white cursor-pointer"
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

        {/* Password - Requires current password verification before updating*/}
        <div className="py-3 border-b border-border">
          <label className="text-text-muted text-xs uppercase tracking-wide">
            Password
          </label>
          <div className="flex items-center justify-between mt-1">
            {editingField === 'password' ? (
              <div className="flex flex-col gap-2 flex-1">
                <input
                  type="password"
                  value={currentPasswordInput}
                  onChange={e => setCurrentPasswordInput(e.target.value)}
                  placeholder="Current password"
                  className={`bg-surface-2 border rounded-md px-3 py-1 flex-1 text-white focus:outline-none placeholder:text-text-muted ${
                    errors.currentPassword
                      ? 'border-red-500'
                      : 'border-border-strong focus:border-accent'
                  }`}
                />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="New password"
                  className={`bg-surface-2 border rounded-md px-3 py-1 flex-1 text-white focus:outline-none placeholder:text-text-muted ${
                    errors.password || errors.confirmPassword
                      ? 'border-red-500'
                      : 'border-border-strong focus:border-accent'
                  }`}
                />
                <input
                  type="password"
                  value={confirmPasswordInput}
                  onChange={e => setConfirmPasswordInput(e.target.value)}
                  placeholder="Confirm new password"
                  className={`bg-surface-2 border rounded-md px-3 py-1 flex-1 text-white focus:outline-none placeholder:text-text-muted ${
                    errors.password || errors.confirmPassword
                      ? 'border-red-500'
                      : 'border-border-strong focus:border-accent'
                  }`}
                />
                <div className="flex gap-2 justify-end mt-1">
                  <button
                    onClick={handleSavePassword}
                    className="text-success hover:text-green-300 cursor-pointer"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="text-text-muted hover:text-white cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-white">••••••••</span>
                <button
                  onClick={() => {
                    // Reset all password inputs before entering edit mode
                    setCurrentPasswordInput('')
                    setPasswordInput('')
                    setConfirmPasswordInput('')
                    setEditingField('password')
                  }}
                  className="text-text-muted hover:text-white cursor-pointer"
                >
                  <SquarePen size={16} />
                </button>
              </>
            )}
          </div>
          {errors.currentPassword && (
            <p className="text-red-400 text-xs mt-1">
              {errors.currentPassword}
            </p>
          )}
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password}</p>
          )}
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
