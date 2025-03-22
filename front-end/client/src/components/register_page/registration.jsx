import Form from "../form";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const navigate = useNavigate(); // Define navigate function

  return (
    <div>
      <Form route="/api/user/register/" method="register" />
      <p>
        Already have an account?{" "}
        <button
          onClick={() => navigate("/login")}
          style={{
            color: "blue",
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Login here
        </button>
      </p>
    </div>
  );
}

export default RegisterPage;
