import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const allowedDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'hotmail.com', 'protonmail.com'];

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [role, setRole] = useState('user');
  const [emailError, setEmailError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  // Domain validation
  const validateEmail = (email) => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (email && domain && !allowedDomains.includes(domain)) {
      setEmailError('Please use Gmail, Outlook, Yahoo, iCloud or similar.');
    } else {
      setEmailError('');
    }
  };

  // Handle OTP digit input
  const handleOtpDigit = (value, index) => {
    const digits = [...otpDigits];
    digits[index] = value.replace(/\D/g, '').slice(-1);
    setOtpDigits(digits);
    setOtp(digits.join(''));
    // Auto-focus next
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // ── Step 1: Register → send OTP ───────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (emailError) { setError(emailError); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });
      const data = await res.json();
      if (res.ok) {
        setStep('otp');
        setSuccess(`Verification code sent to ${formData.email}`);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Submit OTP ─────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) { setError('Enter all 6 digits of the OTP.'); return; }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otpCode: otp })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        setSuccess('Account verified! Redirecting...');
        setTimeout(() => {
          if (data.role === 'admin') navigate('/admin-dashboard');
          else if (data.role === 'vendor') navigate('/vendor-dashboard');
          else navigate('/dashboard');
        }, 1000);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────
  const handleResend = async () => {
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });
      const data = await res.json();
      if (res.ok) setSuccess('New OTP sent to your email.');
      else setError(data.message || 'Could not resend OTP.');
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse delay-1000 pointer-events-none" />

      <div className="glass-card p-8 rounded-3xl w-full max-w-md relative z-10 animate-fade-in">

        {step === 'form' ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent mb-2">
                Create Account
              </h1>
              <p className="text-muted-foreground text-sm">Your email will be verified via OTP</p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-xs font-bold">⚠️ {error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Ex. John Doe"
                  className="glass-input"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">Email Address</label>
                <input
                  type="email"
                  placeholder="john@gmail.com"
                  className={`glass-input ${emailError ? 'border-red-500/50' : ''}`}
                  required
                  value={formData.email}
                  onChange={e => {
                    setFormData({ ...formData, email: e.target.value });
                    validateEmail(e.target.value);
                  }}
                />
                {emailError && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider ml-1">{emailError}</p>}
                <p className="text-[10px] text-white/30 ml-1">Gmail, Outlook, Yahoo, iCloud etc. only</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  className="glass-input"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              {/* Vendor toggle */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
                <div>
                  <span className="text-sm font-semibold">Join as Vendor?</span>
                  <p className="text-xs text-muted-foreground">List your services for event organizers</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRole(r => r === 'vendor' ? 'user' : 'vendor')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${role === 'vendor' ? 'bg-accent' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${role === 'vendor' ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !!emailError}
                className="gradient-button w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Sending OTP...' : 'Register & Verify Email'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <span onClick={() => navigate('/login')} className="text-accent hover:text-white cursor-pointer font-semibold transition-colors">
                Sign In
              </span>
            </p>
          </>
        ) : (
          <>
            {/* OTP Step */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-4xl mx-auto mb-4">📧</div>
              <h1 className="text-3xl font-bold text-white mb-2">Check Your Email</h1>
              <p className="text-muted-foreground text-sm">
                We sent a 6-digit code to<br />
                <strong className="text-white">{formData.email}</strong>
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-xs font-bold">⚠️ {error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-green-400 text-xs font-bold">✅ {success}</p>
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* 6-box OTP input */}
              <div className="flex gap-3 justify-center">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpDigit(e.target.value, i)}
                    onKeyDown={e => handleOtpKeyDown(e, i)}
                    className="w-12 h-14 text-center text-2xl font-black rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary focus:bg-primary/10 outline-none transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="gradient-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Verifying...' : '✅ Verify & Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?{' '}
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="text-primary hover:text-accent font-semibold transition-colors underline underline-offset-2"
                >
                  Resend OTP
                </button>
              </p>
              <button
                onClick={() => { setStep('form'); setError(''); setSuccess(''); setOtpDigits(['', '', '', '', '', '']); setOtp(''); }}
                className="text-xs text-white/30 hover:text-white transition-colors"
              >
                ← Change email address
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;
