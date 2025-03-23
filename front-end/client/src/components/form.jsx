import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "./form.css";

/**
 * Loading spinner component that displays when form is submitting
 */
function LoadingIndicator() {
  return <div className="loading-spinner"></div>;
}

/**
 * Reusable form component for login and registration
 *
 * @param {Object} props Component props
 * @param {string} props.route API endpoint route for form submission
 * @param {string} props.method Either "login" or "register" to determine form behavior
 * @param {string} props.linkText Text to display for the alternative form link (optional)
 * @param {string} props.linkPath Path to navigate to when link is clicked (optional)
 */
function Form({ route, method, linkText, linkPath }) {
  // Form state hooks
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // State for error messages
  const [fieldErrors, setFieldErrors] = useState({}); // State for field-specific errors
  const navigate = useNavigate();

  // Determine form title based on method
  const name = method === "login" ? "Login" : "Register";

  // Store the error message in sessionStorage to persist across reloads
  useEffect(() => {
    // Check if there's an error message in sessionStorage on component mount
    const storedError = sessionStorage.getItem("formError");
    const storedFieldErrors = sessionStorage.getItem("formFieldErrors");

    if (storedError) {
      setError(storedError);
      sessionStorage.removeItem("formError");
    }

    if (storedFieldErrors) {
      setFieldErrors(JSON.parse(storedFieldErrors));
      sessionStorage.removeItem("formFieldErrors");
    }
  }, []);

  /**
   * Handles form submission
   * For login: Stores tokens in localStorage and navigates to home
   * For register: Navigates to login page after successful registration
   */
  const handleSubmit = async (e) => {
    // Prevent default form submission behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Clear any existing errors
    setError(null);
    setFieldErrors({});
    sessionStorage.removeItem("formError");
    sessionStorage.removeItem("formFieldErrors");

    // Show loading state
    setLoading(true);

    try {
      // Prepare user data based on form type
      const userData =
        method === "login"
          ? { username, password }
          : { username, password, email, first_name: firstName };

      const res = await api.post(route, userData);

      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/"); // Redirect to home page after login
      } else {
        navigate("/login"); // Redirect to login page after registration
      }
    } catch (error) {
      // Store the error information that will persist even if page reloads
      let errorMessage = null;
      let fieldErrorsObject = {};

      // Handle different types of errors
      if (error.response) {
        const { status, data } = error.response;

        // Handle authentication errors (wrong credentials)
        if (method === "login" && status === 401) {
          errorMessage = "Invalid username or password. Please try again.";
        }
        // Handle field validation errors
        else if (status === 400) {
          // Check if the response contains field-specific errors
          if (typeof data === "object" && data !== null) {
            // Handle username already exists error
            if (data.username && data.username.includes("already exists")) {
              fieldErrorsObject.username =
                "This username is already taken. Please choose another one.";
            }
            // Handle other field errors
            else {
              Object.keys(data).forEach((key) => {
                if (Array.isArray(data[key])) {
                  fieldErrorsObject[key] = data[key][0];
                } else {
                  fieldErrorsObject[key] = data[key];
                }
              });
            }
          } else {
            // General error for 400 responses
            errorMessage =
              data.detail ||
              "There was a problem with your submission. Please check your inputs.";
          }
        } else {
          // Generic error message for other error codes
          errorMessage = data.detail || "An error occurred. Please try again.";
        }
      } else {
        // Network errors or other unexpected errors
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      // Set and store errors
      if (errorMessage) {
        setError(errorMessage);
        sessionStorage.setItem("formError", errorMessage);
      }

      if (Object.keys(fieldErrorsObject).length > 0) {
        setFieldErrors(fieldErrorsObject);
        sessionStorage.setItem(
          "formFieldErrors",
          JSON.stringify(fieldErrorsObject)
        );
      }
    } finally {
      setLoading(false);
    }

    // Return false to ensure the form doesn't submit naturally
    return false;
  };

  // Helper function to check if a field has an error
  const hasFieldError = (fieldName) => {
    return fieldErrors[fieldName] !== undefined;
  };

  // Create a wrapper function for navigation to prevent form submission
  const handleNavigate = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <div className="full-screen-wrapper">
      <div className="form-wrapper">
        <div className="form-container">
          <h1 className="form-title">{name}</h1>

          {/* Add onSubmit handler to prevent default submission */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
              return false;
            }}
            noValidate
          >
            {/* Username Input */}
            <div className="input-group">
              <input
                className={`form-input ${
                  hasFieldError("username") ? "input-error" : ""
                }`}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
              {hasFieldError("username") && (
                <p className="field-error-message">{fieldErrors.username}</p>
              )}
            </div>

            {/* Email Input (for registration only) */}
            {method === "register" && (
              <div className="input-group">
                <input
                  className={`form-input ${
                    hasFieldError("email") ? "input-error" : ""
                  }`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
                {hasFieldError("email") && (
                  <p className="field-error-message">{fieldErrors.email}</p>
                )}
              </div>
            )}

            {/* First Name Input (for registration only) */}
            {method === "register" && (
              <div className="input-group">
                <input
                  className={`form-input ${
                    hasFieldError("first_name") ? "input-error" : ""
                  }`}
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                />
                {hasFieldError("first_name") && (
                  <p className="field-error-message">
                    {fieldErrors.first_name}
                  </p>
                )}
              </div>
            )}

            {/* Password Input */}
            <div className="input-group">
              <input
                className={`form-input ${
                  hasFieldError("password") ? "input-error" : ""
                }`}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              {hasFieldError("password") && (
                <p className="field-error-message">{fieldErrors.password}</p>
              )}
            </div>

            {/* General Error Message */}
            {error && <p className="error-message">{error}</p>}

            {/* Loading Spinner */}
            {loading && <LoadingIndicator />}

            {/* Submit Button - Changed to button type with click handler instead of submit */}
            <button
              className="form-button"
              type="button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Processing..." : name}
            </button>
          </form>

          {/* Navigation Link */}
          {linkText && linkPath && (
            <div className="auth-nav-container">
              {method === "login"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                onClick={(e) => handleNavigate(e, linkPath)}
                className="auth-nav-link"
                type="button"
              >
                {linkText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Form;
