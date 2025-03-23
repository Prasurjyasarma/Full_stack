import Form from "../form";

function LoginPage() {
  return (
    <Form
      route="/api/token/"
      method="login"
      linkText="Register here"
      linkPath="/register"
    />
  );
}

export default LoginPage;
