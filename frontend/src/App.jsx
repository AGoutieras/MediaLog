import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

function PrivateLayout({ children }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="bg-zinc-950 min-h-screen">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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
          <Route path="/" element={<Navigate to="/search" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
