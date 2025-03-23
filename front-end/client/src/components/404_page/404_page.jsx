import React from "react";
import "./404.css"; // Import the CSS file

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Oops! You're Lost in Space 🚀</h2>
        <p className="not-found-message">
          The page you're looking for has been abducted by aliens. Don't worry,
          we're sending a rescue mission!
        </p>
        <div className="alien-animation">
          <div className="alien-head"></div>
          <div className="alien-body"></div>
          <div className="alien-antenna"></div>
        </div>
        <button
          className="not-found-button"
          onClick={() => (window.location.href = "/")}
        >
          Beam Me Back Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
