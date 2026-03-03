import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VentureAdvice = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            text: "Hello! I'm your Smart Venture Advisor. I can help you with strategic planning, risk assessment, and resource optimization for your event business. What's on your mind?",
            sender: 'bot'
        }
    ]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { text: input, sender: 'user' }];
        setMessages(newMessages);
        setInput("");

        // Simulated AI response logic
        setTimeout(() => {
            let response = "That's an interesting point. Could you elaborate more on your specific goals?";

            if (input.toLowerCase().includes("budget") || input.toLowerCase().includes("cost")) {
                response = "For budget optimization, I recommend allocating 40% to venue & catering, 30% to production, and keeping 10% as a contingency fund. Have you checked our Budget Analytics tool?";
            } else if (input.toLowerCase().includes("marketing") || input.toLowerCase().includes("promotion")) {
                response = "Effective event marketing relies on multi-channel engagement. Consider leveraging social proof from past events and early-bird tiered pricing to drive initial traction.";
            } else if (input.toLowerCase().includes("risk") || input.toLowerCase().includes("safety")) {
                response = "Risk management is crucial. Ensure you have liability insurance, clear vendor contracts, and a contingency plan for weather or technical failures.";
            } else if (input.toLowerCase().includes("scale") || input.toLowerCase().includes("growth")) {
                response = "Scaling require robust systems. Focus on automating vendor communications and attendee registration before increasing your event frequency.";
            }

            setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
        }, 1000);
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 flex items-center gap-4 relative z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                    ←
                </button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Venture Advisor
                </h1>
            </div>

            {/* Chat Area */}
            <div className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-y-auto mb-20 relative z-10 custom-scrollbar">
                <div className="space-y-6">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl ${msg.sender === 'user'
                                    ? 'bg-primary text-white rounded-tr-none'
                                    : 'glass-card border-white/10 text-gray-200 rounded-tl-none'
                                } shadow-xl backdrop-blur-md`}>
                                <p className="leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/40 backdrop-blur-lg border-t border-white/10 z-20">
                <div className="max-w-4xl mx-auto flex gap-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask for strategic advice..."
                        className="flex-1 glass-input rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    />
                    <button
                        onClick={handleSend}
                        className="px-8 rounded-xl bg-gradient-to-r from-primary to-accent font-bold text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        Send 🚀
                    </button>
                </div>
            </div>

            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
        </div>
    );
};

export default VentureAdvice;
