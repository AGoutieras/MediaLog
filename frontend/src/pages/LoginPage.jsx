import { useState } from 'react'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Navigate } from 'react-router-dom'
import API_URL from '../config.js'
import logo from '../assets/logo.svg'

function CodeInput({ value, onChange }) {
  const inputs = Array(6).fill(0)

  function handleChange(e, index) {
    const val = e.target.value.replace(/\D/g, '')
    if (!val) {
      const newCode = value.slice(0, index) + '' + value.slice(index + 1)
      onChange(newCode)
      return
    }
    const newCode = value.slice(0, index) + val[0] + value.slice(index + 1)
    onChange(newCode)
    if (val && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus()
    }
  }

  function handleKeyDown(e, index) {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus()
    }
  }

  function handlePaste(e, index) {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)
    onChange(pasted.padEnd(6, '').slice(0, 6))
    const focusIndex = Math.min(pasted.length, 5)
    document.getElementById(`code-${focusIndex}`)?.focus()
  }

  return (
    <div className="flex gap-2 justify-center mb-4">
      {inputs.map((_, i) => (
        <input
          key={i}
          id={`code-${i}`}
          type="text"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          onPaste={e => handlePaste(e, i)}
          className="w-11 h-14 bg-surface-2 border border-border-strong text-white text-center text-xl font-bold rounded-md focus:outline-none focus:border-accent"
        />
      ))}
    </div>
  )
}

/**
 * LoginPage
 * Handles both login and registration in a single component using a mode state.
 * After register, shows a 6-digit email verification modal.
 * On login, blocks if email is not verified (403) and shows an appropriate message.
 */
export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { login, token } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState({})
  const [success, setSuccess] = useState('')
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStep, setForgotStep] = useState(1)
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')

  useEffect(() => {
    document.title = 'MediaLog - Login'
  }, [])

  async function handleSubmit() {
    setError({})
    setSuccess('')

    // Client-side validation
    if (mode === 'register' && password !== confirmPassword) {
      setError({ confirmPassword: 'Passwords do not match' })
      return
    }
    if (mode === 'register' && username.length < 3) {
      setError({ username: 'Username must be at least 3 characters' })
      return
    }
    if (!email.includes('@')) {
      setError({ email: 'Invalid email' })
      return
    }
    if (password.length < 6) {
      setError({ password: 'Password must be at least 6 characters' })
      return
    }

    try {
      const url = mode === 'login' ? '/auth/login' : '/auth/register'
      const body =
        mode === 'login' ? { email, password } : { email, password, username }

      const response = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.message === 'Email already in use.') {
          setError({ email: data.message })
        } else if (data.message === 'Username already in use') {
          setError({ username: data.message })
        } else if (response.status === 403) {
          setError({ general: data.message })
        } else {
          setError({ general: data.message || 'An error occurred' })
        }
        return
      }

      if (mode === 'register') {
        setPendingEmail(email)
        setShowVerifyModal(true)
        return
      }

      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError({ general: 'Network error, please try again' })
    }
  }

  async function handleVerify() {
    setVerifyError('')
    try {
      const res = await fetch(
        `${API_URL}/auth/verify-email?token=${verifyCode}`
      )
      const data = await res.json()
      if (!res.ok) {
        setVerifyError(data.message || 'Invalid code')
        return
      }
      setShowVerifyModal(false)
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setVerifyError('Network error, please try again')
    }
  }

  if (token) {
    return <Navigate to="/dashboard" />
  }

  const inputClass = hasError =>
    `w-full bg-surface-2 border rounded-md px-3 py-2.5 text-white focus:outline-none mt-1 transition-shadow ${
      hasError
        ? 'border-red-500'
        : 'border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_rgba(108,64,196,0.25)]'
    }`

  async function handleForgotPassword() {
    if (!forgotEmail.includes('@')) {
      setForgotError('Invalid email')
      return
    }
    setForgotError('')
    try {
      await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      setForgotStep(2)
    } catch (err) {
      setForgotError('Network error, please try again')
    }
  }

  async function handleResetPassword() {
    if (newPassword !== newPasswordConfirm) {
      setForgotError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters')
      return
    }
    setForgotError('')
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetCode, password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setForgotError(data.message || 'An error occurred')
        return
      }
      setForgotSuccess('Password updated! You can now log in.')
      setTimeout(() => {
        setShowForgotModal(false)
        setForgotStep(1)
        setForgotSuccess('')
      }, 2000)
    } catch (err) {
      setForgotError('Network error, please try again')
    }
  }

  return (
    <div className="min-h-screen flex justify-center pt-32 px-4">
      <div className="bg-surface border border-border-strong rounded-xl p-20 w-150 h-fit text-white shadow-[0_34px_70px_-18px_rgba(0,0,0,0.78)]">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="MediaLog" className="h-20" />
        </div>

        {/* Tab switcher */}
        <div className="relative flex w-full border-b border-border-strong mb-6">
          <button
            onClick={() => {
              setMode('login')
              setError({})
              setSuccess('')
            }}
            className={
              mode === 'login'
                ? 'flex-1 text-accent-soft pb-3 font-medium'
                : 'flex-1 text-text-muted pb-3'
            }
          >
            Log in
          </button>
          <button
            onClick={() => {
              setMode('register')
              setError({})
              setSuccess('')
            }}
            className={
              mode === 'register'
                ? 'flex-1 text-accent-soft pb-3 font-medium'
                : 'flex-1 text-text-muted pb-3'
            }
          >
            Register
          </button>
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
          {mode === 'register' && (
            <div className="mt-4">
              <label className="text-text-muted text-sm">Username</label>
              <input
                type="text"
                value={username}
                autoComplete="off"
                onChange={e => setUsername(e.target.value)}
                className={inputClass(error.username)}
              />
              {error.username && (
                <p className="text-red-400 text-xs mt-1">{error.username}</p>
              )}
            </div>
          )}

          <div className="mt-4">
            <label className="text-text-muted text-sm">Email</label>
            <input
              type="email"
              value={email}
              autoComplete="off"
              onChange={e => setEmail(e.target.value)}
              className={inputClass(error.email)}
            />
            {error.email && (
              <p className="text-red-400 text-xs mt-1">{error.email}</p>
            )}
          </div>

          <div className="mt-4">
            <label className="text-text-muted text-sm">Password</label>
            <input
              type="password"
              value={password}
              autoComplete="off"
              onChange={e => setPassword(e.target.value)}
              className={inputClass(error.password)}
            />
            {error.password && (
              <p className="text-red-400 text-xs mt-1">{error.password}</p>
            )}
            {mode === 'login' && (
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true)
                    setForgotStep(1)
                    setForgotError('')
                  }}
                  className="text-accent-soft text-xs hover:text-white"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {mode === 'register' && (
            <div className="mt-4">
              <label className="text-text-muted text-sm">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                autoComplete="off"
                onChange={e => setConfirmPassword(e.target.value)}
                className={inputClass(error.confirmPassword)}
              />
              {error.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {error.confirmPassword}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          {error.general && (
            <p className="text-red-400 text-sm mt-4">{error.general}</p>
          )}
          {success && (
            <p className="text-success text-sm mt-4 text-center">{success}</p>
          )}
          <button
            onClick={handleSubmit}
            className="w-full bg-accent hover:bg-accent-hover text-white rounded-md py-2.5 mt-6 transition font-medium"
          >
            {mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </div>
      </div>

      {/* Email verification modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-surface border border-border-strong rounded-xl p-8 w-full max-w-sm shadow-[0_34px_70px_-18px_rgba(0,0,0,0.78)]">
            <h2 className="text-white font-semibold text-lg mb-2">
              Verify your email
            </h2>
            <p className="text-text-muted text-sm mb-6">
              We sent a 6-digit code to{' '}
              <span className="text-white">{pendingEmail}</span>. Enter it
              below.
            </p>
            <CodeInput value={verifyCode} onChange={setVerifyCode} />
            {verifyError && (
              <p className="text-red-400 text-xs mb-3">{verifyError}</p>
            )}
            <button
              onClick={handleVerify}
              disabled={verifyCode.length !== 6}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md py-2.5 transition font-medium"
            >
              Verify
            </button>
          </div>
        </div>
      )}
      {showForgotModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-surface border border-border-strong rounded-xl p-8 w-full max-w-sm shadow-[0_34px_70px_-18px_rgba(0,0,0,0.78)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-semibold text-lg">
                {forgotStep === 1
                  ? 'Forgot password?'
                  : forgotStep === 2
                    ? 'Enter your code'
                    : 'New password'}
              </h2>
              <button
                onClick={() => {
                  setShowForgotModal(false)
                  setForgotStep(1)
                  setForgotError('')
                  setForgotSuccess('')
                }}
                className="text-text-muted hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {forgotSuccess ? (
              <p className="text-success text-sm text-center">
                {forgotSuccess}
              </p>
            ) : forgotStep === 1 ? (
              <>
                <p className="text-text-muted text-sm mb-4">
                  Enter your email and we'll send you a reset code.
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-surface-2 border border-border-strong text-white rounded-md px-3 py-2.5 focus:outline-none focus:border-accent mb-4"
                />
                {forgotError && (
                  <p className="text-red-400 text-xs mb-3">{forgotError}</p>
                )}
                <button
                  onClick={handleForgotPassword}
                  className="w-full bg-accent hover:bg-accent-hover text-white rounded-md py-2.5 transition font-medium"
                >
                  Send reset code
                </button>
              </>
            ) : forgotStep === 2 ? (
              <>
                <p className="text-text-muted text-sm mb-4">
                  Enter the 6-digit code sent to{' '}
                  <span className="text-white">{forgotEmail}</span>.
                </p>
                <CodeInput value={resetCode} onChange={setResetCode} />
                {forgotError && (
                  <p className="text-red-400 text-xs mb-3">{forgotError}</p>
                )}
                <button
                  onClick={() => {
                    if (resetCode.length === 6) setForgotStep(3)
                  }}
                  disabled={resetCode.length !== 6}
                  className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md py-2.5 transition font-medium"
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <p className="text-text-muted text-sm mb-4">
                  Choose a new password.
                </p>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full bg-surface-2 border border-border-strong text-white rounded-md px-3 py-2.5 focus:outline-none focus:border-accent mb-3"
                />
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={e => setNewPasswordConfirm(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-surface-2 border border-border-strong text-white rounded-md px-3 py-2.5 focus:outline-none focus:border-accent mb-4"
                />
                {forgotError && (
                  <p className="text-red-400 text-xs mb-3">{forgotError}</p>
                )}
                <button
                  onClick={handleResetPassword}
                  className="w-full bg-accent hover:bg-accent-hover text-white rounded-md py-2.5 transition font-medium"
                >
                  Reset password
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
