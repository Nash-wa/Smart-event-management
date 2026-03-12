import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!email) {
            navigate("/register");
        }
    }, [email, navigate]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value) {
            element.nextSibling.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            setError("Please enter the full 6-digit code");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otpCode })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('userInfo', JSON.stringify(data));
                // Redirect based on role
                if (data.role === 'admin') navigate("/admin-dashboard");
                else if (data.role === 'vendor') navigate("/vendor-dashboard");
                else navigate("/dashboard");
            } else {
                setError(data.message || "Verification failed");
            }
        } catch {
            setError("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

            <div className="glass-card p-8 rounded-3xl w-full max-w-md relative z-10 animate-fade-in text-center">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent mb-2">
                        Verify Identity
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Enter the 6-digit code sent to <br />
                        <span className="text-white font-bold">{email}</span>
                    </p>
                    <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">
                        Check your server console for the code
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-8">
                    <div className="flex justify-center gap-2">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:border-accent outline-none transition-all"
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onFocus={(e) => e.target.select()}
                            />
                        ))}
                    </div>

                    {error && (
                        <p className="text-xs text-red-400 font-bold uppercase tracking-wider">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="gradient-button w-full h-14"
                    >
                        {loading ? "Verifying..." : "Confirm Verification"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="text-xs text-gray-400 hover:text-white uppercase tracking-widest transition-colors"
                    >
                        Use a different email
                    </button>
                </form>
            </div>
        </div>
    );
}

export default VerifyOtp;
