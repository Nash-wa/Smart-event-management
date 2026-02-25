import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    if (!email || !password) { setError('Please fill in all fields.'); return; }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        if (data.role === 'admin') navigate('/admin-dashboard');
        else if (data.role === 'vendor') navigate('/vendor-dashboard');
        else navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-1000" />

      <div className="glass-card p-8 rounded-3xl w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">Sign in to manage your events</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-xs font-bold">⚠️ {error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
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
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium">Password</label>
              <span
                onClick={() => navigate('/forgot-password')}
                className="text-xs text-primary hover:text-accent cursor-pointer font-semibold transition-colors"
              >
                Forgot Password?
              </span>
            </div>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              className="glass-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gradient-button w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/register')}
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
