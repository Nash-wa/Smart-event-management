import { useNavigate } from "react-router-dom";
import "../css/register.css";

function Register() {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    // ✅ Basic validation
    if (!name || !email || !password) {
      alert("All fields are required");
      return;
    }

    // ✅ Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert("Enter a valid email address");
      return;
    }

    // ✅ If all validations pass
    navigate("/dashboard");
  };

  return (
    <div className="register-container">
      <h2>Create Account</h2>

      <form onSubmit={handleRegister}>
        <input name="name" type="text" placeholder="Username" />
        <input name="email" type="email" placeholder="Email" />
        <input name="password" type="password" placeholder="Password" />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
