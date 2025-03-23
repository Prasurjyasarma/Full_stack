import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // Base URL for all API requests
});

// ==========================
// REQUEST INTERCEPTOR
// ==========================
// This interceptor runs before every request and adds the authentication token
api.interceptors.request.use(
  (config) => {
    // Retrieve the access token from local storage
    const token = localStorage.getItem(ACCESS_TOKEN);

    // If a token exists, add it to the request headers
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config; // Return the updated request config
  },
  (error) => Promise.reject(error) // Handle request errors
);

// ==========================
// RESPONSE INTERCEPTOR
// ==========================
// This interceptor handles API responses and checks for authentication errors
api.interceptors.response.use(
  (response) => response, // Simply return the response if successful
  async (error) => {
    const originalRequest = error.config; // Store the failed request

    // If the response status is 401 (Unauthorized) and the request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark this request as retried

      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN); // Get refresh token from local storage

        // If there is no refresh token, redirect to the login page
        if (!refreshToken) {
          console.warn("No refresh token found. Redirecting to login.");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Attempt to refresh the access token using the refresh token
        const res = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/", // Django's token refresh endpoint
          {
            refresh: refreshToken, // Send the refresh token in the request body
          }
        );

        // If the refresh request is successful, update the new access token
        if (res.status === 200) {
          const newAccessToken = res.data.access; // Extract new access token

          // Store the new access token in local storage
          localStorage.setItem(ACCESS_TOKEN, newAccessToken);

          // Update Axios instance to use the new token
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;

          // Update the original request with the new token and retry it
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error(
          "Token refresh failed:",
          refreshError.response?.data || refreshError
        );

        // If token refresh fails, clear stored tokens and redirect to login
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        window.location.href = "/login"; // Redirect to login page

        return Promise.reject(refreshError);
      }
    }

    // Return the original error if it is not a 401 error or the refresh attempt failed
    return Promise.reject(error);
  }
);

export default api;
