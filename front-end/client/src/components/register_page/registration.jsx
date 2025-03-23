import Form from "../form";

function RegisterPage() {
  return (
    <div>
      <Form
        route="/api/user/register/"
        method="register"
        linkText="Login here"
        linkPath="/login"
      />
    </div>
  );
}

export default RegisterPage;
