import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        // Redirect based on role
        if (data.role === 'admin') navigate("/admin-dashboard");
        else if (data.role === 'vendor') navigate("/vendor-dashboard");
        else navigate("/dashboard");
      } else {
        if (response.status === 401 && data.message.includes("verify")) {
          navigate("/verify-otp", { state: { email } });
        } else {
          alert(data.message || "Login failed");
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Error connecting to server");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      <div className="glass-card p-8 rounded-3xl w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">Sign in to manage your events</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              className="glass-input"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              className="glass-input"
              required
            />
          </div>

          <button type="submit" className="gradient-button w-full mt-4">
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-primary hover:text-accent cursor-pointer font-semibold transition-colors"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
