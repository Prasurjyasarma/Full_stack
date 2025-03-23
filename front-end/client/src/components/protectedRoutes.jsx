import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect, useCallback } from "react";

/**
 * ProtectedRoute component to guard routes based on user authentication.
 * Ensures that only authenticated users can access protected pages.
 *
 * - Checks if the access token is present and valid.
 * - If the token is expired, attempts to refresh it using the refresh token.
 * - If authentication fails, redirects the user to the login page.
 */
function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  /**
   * Attempts to refresh the access token using the refresh token.
   * If successful, updates the access token in local storage.
   * If unsuccessful, sets the authorization state to false.
   */
  const refreshToken = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    if (!refreshToken) {
      setIsAuthorized(false);
      return;
    }
    try {
      const res = await api.post("api/token/refresh/", {
        refresh: refreshToken,
      });
      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      setIsAuthorized(false);
    }
  }, []);

  /**
   * Checks the validity of the access token.
   * - If no token is found, sets authorization to false.
   * - If the token is expired, attempts to refresh it.
   * - Otherwise, sets authorization to true.
   */
  const auth = useCallback(async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setIsAuthorized(false);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      const tokenExpiration = decoded.exp;
      const now = Date.now() / 1000; // Convert milliseconds to seconds

      if (tokenExpiration < now) {
        await refreshToken();
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      setIsAuthorized(false);
    }
  }, [refreshToken]);

  /**
   * Runs authentication check when the component mounts.
   */
  useEffect(() => {
    auth().catch(() => setIsAuthorized(false));
  }, [auth]);

  /**
   * Displays a loading state while checking authentication.
   * If the user is authorized, renders the protected content.
   * Otherwise, redirects to the login page.
   */
  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
