import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication.
 * Reads the JWT token from AuthContext, if absent, redirects to /login.
 * If authenticated, renders the child components as-is.
 */
export default function ProtectedRoute({ children }) {
    const { token } = useAuth()

    if (!token) {
        return (<Navigate to='/login' />)
    }

    return children
}