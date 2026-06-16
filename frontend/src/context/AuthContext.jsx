import { createContext, useContext, useState } from "react";
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token')
        return token ? jwtDecode(token) : null
    })

    function login(token, user) {
        localStorage.setItem('token', token)
        setToken(token)
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

export function useAuth() {
    return useContext(AuthContext)
}