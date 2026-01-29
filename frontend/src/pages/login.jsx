import { useNavigate } from "react-router-dom";
import "../css/login.css";

function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); // ❗ stop page reload

    // later: validate username & password with backend
    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          required
        />

        <input
          type="password"
          placeholder="Password"
          required
        />

        <button type="submit">Login</button>
      </form>

      <p>
        Don’t have an account?{" "}
        <span onClick={() => navigate("/register")} className="link">
          Register
        </span>
      </p>
    </div>
  );
}

export default Login;
