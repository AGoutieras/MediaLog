import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SearchPage from './pages/SearchPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import ProfilePage from './pages/ProfilePage'

/**
 * PrivateLayout
 * Wraps authenticated pages with the Navbar.
 * Kept separate from ProtectedRoute so the layout and auth concerns stay distinct.
 */
function PrivateLayout({ children }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  )
}

/**
 * App
 * Root component - defines the client-side routing with React Router.
 * Protected routes are wrapped in ProtectedRoute (redirects to /login if no token)
 * and PrivateLayout (adds the Navbar).
 * The root path / redirects to /dashboard for convenience.
 */
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes, require a valid JWT token */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PrivateLayout>
                  <DashboardPage />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <PrivateLayout>
                  <SearchPage />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PrivateLayout>
                  <ProfilePage />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
