import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Navigate } from 'react-router-dom'

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { login, token } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState({})

  async function handleSubmit() {
    try {
      const url = mode === 'login' ? '/auth/login' : '/auth/register'
      const body =
        mode === 'login' ? { email, password } : { email, password, username }

      if (mode === 'register' && password !== confirmPassword) {
        setError({ confirmPassword: 'Passwords do not match' })
        return
      }

      if (mode === 'register') {
        if (username.length < 3) {
          setError({ username: 'Username must be at least 3 characters' })
          return
        }
      }

      if (!email.includes('@')) {
        setError({ email: 'Invalid email' })
        return
      }
      if (password.length < 6) {
        setError({ password: 'Password must be at least 6 characters' })
        return
      }

      const response = await fetch(`http://localhost:3000${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.message === 'Email already in use.') {
          setError({ email: data.message })
        } else if (data.message === 'Username already in use') {
          setError({ username: data.message })
        } else {
          setError({ general: data.message || 'An error occured' })
        }
        return
      }

      const data = await response.json()

      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    }
  }

  if (token) {
    return <Navigate to="/dashboard" />
  }

  return (
    <div className="min-h-screen flex justify-center pt-32">
      {/* Auth card */}
      <div className="bg-surface border border-border-strong rounded-xl p-20 w-150 h-fit text-white shadow-[0_34px_70px_-18px_rgba(0,0,0,0.78)]">
        {/* App title */}
        <div className="text-2xl font-bold text-center mb-6">MediaLog</div>

        {/* Tab switcher: Login / Register */}
        <div className="relative flex w-full border-b border-border-strong mb-6">
          <button
            onClick={() => setMode('login')}
            className={
              mode === 'login'
                ? 'flex-1 text-accent-soft pb-3 font-medium'
                : 'flex-1 text-text-muted pb-3'
            }
          >
            Log in
          </button>
          <button
            onClick={() => setMode('register')}
            className={
              mode === 'register'
                ? 'flex-1 text-accent-soft pb-3 font-medium'
                : 'flex-1 text-text-muted pb-3'
            }
          >
            Register
          </button>
          {/* Sliding indicator */}
          <div
            className="absolute bottom-0 h-0.5 w-1/2 bg-accent transition-transform duration-300"
            style={{
              transform:
                mode === 'login' ? 'translateX(0%)' : 'translateX(100%)',
            }}
          />
        </div>

        {/* Form fields */}
        <div>
          {/* Username - register only */}
          {mode === 'register' && (
            <div className="mt-4">
              <label htmlFor="username" className="text-text-muted text-sm">
                Username
              </label>
              <input
                type="text"
                value={username}
                autoComplete="off"
                onChange={e => setUsername(e.target.value)}
                className={`w-full bg-surface-2 border rounded-md px-3 py-2.5 text-white focus:outline-none mt-1 transition-shadow ${
                  error.username
                    ? 'border-red-500'
                    : 'border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_rgba(108,64,196,0.25)]'
                }`}
              />
              {error.username && (
                <p className="text-red-400 text-xs mt-1">{error.username}</p>
              )}
            </div>
          )}

          {/* Email */}
          <div className="mt-4">
            <label htmlFor="email" className="text-text-muted text-sm">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              autoComplete="off"
              onChange={e => setEmail(e.target.value)}
              className={`w-full bg-surface-2 border rounded-md px-3 py-2.5 text-white focus:outline-none mt-1 transition-shadow ${
                error.email
                  ? 'border-red-500'
                  : 'border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_rgba(108,64,196,0.25)]'
              }`}
            />
            {error.email && (
              <p className="text-red-400 text-xs mt-1">{error.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mt-4">
            <label htmlFor="password" className="text-text-muted text-sm">
              Password
            </label>
            <input
              type="password"
              value={password}
              autoComplete="off"
              onChange={e => setPassword(e.target.value)}
              className={`w-full bg-surface-2 border rounded-md px-3 py-2.5 text-white focus:outline-none mt-1 transition-shadow ${
                error.password
                  ? 'border-red-500'
                  : 'border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_rgba(108,64,196,0.25)]'
              }`}
            />
            {error.password && (
              <p className="text-red-400 text-xs mt-1">{error.password}</p>
            )}
          </div>

          {/* Confirm password - register only */}
          {mode === 'register' && (
            <div className="mt-4">
              <label
                htmlFor="confirmPassword"
                className="text-text-muted text-sm"
              >
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                autoComplete="off"
                onChange={e => setConfirmPassword(e.target.value)}
                className={`w-full bg-surface-2 border rounded-md px-3 py-2.5 text-white focus:outline-none mt-1 transition-shadow ${
                  error.confirmPassword
                    ? 'border-red-500'
                    : 'border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_rgba(108,64,196,0.25)]'
                }`}
              />
              {error.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {error.confirmPassword}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error message + submit button */}
        <div>
          {error.general && (
            <p className="text-red-400 text-sm">{error.general}</p>
          )}
          <button
            onClick={handleSubmit}
            className="w-full bg-accent hover:bg-accent-hover text-white rounded-md py-2.5 mt-6 transition font-medium"
          >
            {mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </div>
      </div>
    </div>
  )
}
