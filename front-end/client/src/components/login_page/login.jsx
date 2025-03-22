import { useNavigate } from "react-router-dom";
import Form from "../form";

function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div>
      <Form route="/api/token/" method="login" />
      <p>
        Don't have an account?{" "}
        <button
          onClick={() => navigate("/register")}
          style={{
            color: "blue",
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Register here
        </button>
      </p>
    </div>
  );
}

export default RegisterPage;
