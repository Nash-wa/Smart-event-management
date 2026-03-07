import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Forgot Password — 3 steps:
 *  1. Enter email → receive reset OTP
 *  2. Enter OTP to verify
 *  3. Enter new password
 */
function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset' | 'done'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [email, setEmail] = useState('');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    // Handle OTP digit input
    const handleOtpDigit = (value, index) => {
        const digits = [...otpDigits];
        digits[index] = value.replace(/\D/g, '').slice(-1);
        setOtpDigits(digits);
        setOtp(digits.join(''));
        if (value && index < 5) document.getElementById(`reset-otp-${index + 1}`)?.focus();
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            document.getElementById(`reset-otp-${index - 1}`)?.focus();
        }
    };

    // ── Step 1: Send reset OTP ─────────────────────────────────────
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!email) { setError('Please enter your email address.'); return; }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            setSuccess(data.message || 'If an account exists, a code has been sent.');
            setStep('otp');
        } catch {
            setError('Cannot connect to server.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: Verify OTP ─────────────────────────────────────────
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (otp.length !== 6) { setError('Enter all 6 digits.'); return; }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/verify-reset-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otpCode: otp })
            });
            const data = await res.json();
            if (res.ok && data.valid) {
                setStep('reset');
            } else {
                setError(data.message || 'Invalid or expired code.');
            }
        } catch {
            setError('Cannot connect to server.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 3: Set new password ───────────────────────────────────
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otpCode: otp, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setStep('done');
            } else {
                setError(data.message || 'Failed to reset password.');
            }
        } catch {
            setError('Cannot connect to server.');
        } finally {
            setLoading(false);
        }
    };

    const stepNumber = { email: 1, otp: 2, reset: 3, done: 3 }[step];

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
            {/* BG blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />

            <div className="glass-card p-8 rounded-3xl w-full max-w-md relative z-10 animate-fade-in">

                {/* Progress dots */}
                {step !== 'done' && (
                    <div className="flex gap-2 justify-center mb-8">
                        {[1, 2, 3].map(n => (
                            <div
                                key={n}
                                className={`h-1 rounded-full transition-all duration-500 ${n <= stepNumber ? 'bg-primary w-10' : 'bg-white/10 w-5'}`}
                            />
                        ))}
                    </div>
                )}

                {/* ── STEP 1: Email ─────────────────────────────────── */}
                {step === 'email' && (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl mx-auto mb-4">🔑</div>
                            <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
                            <p className="text-muted-foreground text-sm">Enter your email and we'll send you a reset code.</p>
                        </div>

                        {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20"><p className="text-red-400 text-xs font-bold">⚠️ {error}</p></div>}

                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="glass-input"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                            <button type="submit" disabled={loading} className="gradient-button w-full disabled:opacity-50">
                                {loading ? '⏳ Sending...' : '📤 Send Reset Code'}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Remember your password?{' '}
                            <span onClick={() => navigate('/login')} className="text-primary cursor-pointer font-semibold hover:text-accent transition-colors">Sign In</span>
                        </p>
                    </>
                )}

                {/* ── STEP 2: OTP ───────────────────────────────────── */}
                {step === 'otp' && (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-3xl mx-auto mb-4">📬</div>
                            <h1 className="text-3xl font-bold text-white mb-2">Enter Reset Code</h1>
                            <p className="text-muted-foreground text-sm">
                                Check your inbox at <strong className="text-white">{email}</strong>
                            </p>
                        </div>

                        {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20"><p className="text-red-400 text-xs font-bold">⚠️ {error}</p></div>}
                        {success && <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20"><p className="text-green-400 text-xs font-bold">✅ {success}</p></div>}

                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div className="flex gap-3 justify-center">
                                {otpDigits.map((digit, i) => (
                                    <input
                                        key={i}
                                        id={`reset-otp-${i}`}
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
                            <button type="submit" disabled={loading || otp.length !== 6} className="gradient-button w-full disabled:opacity-50">
                                {loading ? '⏳ Verifying...' : 'Verify Code →'}
                            </button>
                        </form>

                        <div className="mt-6 text-center space-y-2">
                            <button
                                onClick={handleSendOTP}
                                disabled={loading}
                                className="text-sm text-primary hover:text-accent font-semibold underline underline-offset-2 transition-colors"
                            >
                                Resend Code
                            </button>
                            <br />
                            <button onClick={() => setStep('email')} className="text-xs text-white/30 hover:text-white transition-colors">
                                ← Change email
                            </button>
                        </div>
                    </>
                )}

                {/* ── STEP 3: New Password ───────────────────────────── */}
                {step === 'reset' && (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-3xl mx-auto mb-4">🔒</div>
                            <h1 className="text-3xl font-bold text-white mb-2">Set New Password</h1>
                            <p className="text-muted-foreground text-sm">Choose a strong password for your account.</p>
                        </div>

                        {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20"><p className="text-red-400 text-xs font-bold">⚠️ {error}</p></div>}

                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Min. 6 characters"
                                        className="glass-input pr-12"
                                        required
                                        minLength={6}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(v => !v)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors text-sm"
                                    >
                                        {showPass ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Confirm Password</label>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="Repeat your password"
                                    className={`glass-input ${confirmPassword && confirmPassword !== newPassword ? 'border-red-500/50' : ''}`}
                                    required
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                />
                                {confirmPassword && confirmPassword !== newPassword && (
                                    <p className="text-[10px] text-red-400 font-bold ml-1">Passwords do not match</p>
                                )}
                            </div>

                            <button type="submit" disabled={loading} className="gradient-button w-full mt-2 disabled:opacity-50">
                                {loading ? '⏳ Resetting...' : '✅ Reset Password'}
                            </button>
                        </form>
                    </>
                )}

                {/* ── DONE ─────────────────────────────────────────── */}
                {step === 'done' && (
                    <div className="text-center py-4">
                        <div className="w-24 h-24 rounded-full bg-green-500/10 border-4 border-green-500/30 flex items-center justify-center text-5xl mx-auto mb-6 animate-bounce">
                            🎉
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-3">Password Reset!</h1>
                        <p className="text-muted-foreground text-sm mb-8">
                            Your password has been updated successfully. You can now sign in with your new credentials.
                        </p>
                        <button onClick={() => navigate('/login')} className="gradient-button w-full">
                            Sign In Now →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;
