import { Route, Routes, Navigate } from "react-router-dom";
import MainPage from "./components/main_page/main_page";
import TaskCardHistory from "./components/history_page/history";
import Dashboard from "./components/dash_board/dash_board";
import ProtectedRoute from "./components/protectedRoutes";
import LoginPage from "./components/login_page/login";
import RegisterPage from "./components/register_page/registration";
import "./App.css";

// Logout Component: Clears localStorage and redirects to login
function Logout() {
  localStorage.removeItem("ACCESS_TOKEN");
  localStorage.removeItem("REFRESH_TOKEN");
  return <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/logout" element={<Logout />} /> {/* Add this route */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <TaskCardHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
