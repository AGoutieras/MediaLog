import { createContext, useContext, useState } from "react";
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

/**
 * AuthProvider Component
 * Provides JWT authentication state to the entire component tree via React Context.
 * Exposes token, user, login, and logout to any child component via useAuth().
 *
 * The user object is derived by decoding the JWT with jwt-decode rather than
 * storing a separate user object in localStorage, this avoids desync issues
 * where the token and stored user could get out of step after a profile update.
 */
export function AuthProvider({ children }) {
    // Initialize token and user from localStorage on first load
    // so auth state persists across page refreshes
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token')
        // Decode the stored token to reconstruct the user object without a separate fetch
        return token ? jwtDecode(token) : null
    })

    function login(token, user) {
        localStorage.setItem('token', token)
        setToken(token)
        // Decode the new token to update the user state immediately
        setUser(jwtDecode(token))
    }

    function logout() {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

/**
 * useAuth hook
 * Convenience hook to access auth context in any component.
 * Usage: const { token, user, login, logout } = useAuth()
 */
export function useAuth() {
    return useContext(AuthContext)
}