import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");

  const handleRegister = async (e) => {
    e.preventDefault();

    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    if (!name || !email || !password) {
      alert("All fields are required");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        // Redirect based on role
        if (data.role === 'admin') navigate("/admin-dashboard");
        else if (data.role === 'vendor') navigate("/vendor-dashboard");
        else navigate("/dashboard");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to server");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      <div className="glass-card p-8 rounded-3xl w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground">Join us to start planning events</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Full Name</label>
            <input
              name="name"
              type="text"
              placeholder="Ex. John Doe"
              className="glass-input"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="john@example.com"
              className="glass-input"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Create a strong password"
              className="glass-input"
            />
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center mb-4">
            <div>
              <span className="text-sm font-semibold">Join as Vendor?</span>
              <p className="text-xs text-muted-foreground">List your services for users</p>
            </div>
            <button
              type="button"
              onClick={() => setRole(role === 'vendor' ? 'user' : 'vendor')}
              className={`w-12 h-6 rounded-full transition-colors relative ${role === 'vendor' ? 'bg-accent' : 'bg-gray-600'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${role === 'vendor' ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          <button type="submit" className="gradient-button w-full mt-4">
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-accent hover:text-white cursor-pointer font-semibold transition-colors"
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
