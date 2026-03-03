import React, { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your Smart Event assistant. How can I help you today?", isBot: true }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = { text: input, isBot: false };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Mock bot response logic
        setTimeout(() => {
            let botText = "I'm here to help you customize your event communication. What specific details would you like to refine?";
            const lowerInput = input.toLowerCase();

            if (lowerInput.includes('event')) {
                botText = "I can help you build an event timeline or suggest themes. Just choose 'Create Event' in your dashboard to start!";
            } else if (lowerInput.includes('vendor')) {
                botText = "Our vendors are specialists in communication. You can check their social handles in the Services section.";
            } else if (lowerInput.includes('ar')) {
                botText = "The AR Explorer is great for showing customers the venue. It makes communication visually stunning!";
            } else if (lowerInput.includes('budget')) {
                botText = "Budget clarity is key to good customer relations. Our analytics tool calculates everything for you.";
            } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
                botText = "Hi there! Ready to make your next event extraordinary?";
            }

            setMessages(prev => [...prev, { text: botText, isBot: true }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end pointer-events-none">
            <div className="pointer-events-auto flex flex-col items-end">
                {isOpen && (
                    <div className="glass-card w-[350px] h-[500px] mb-4 flex flex-col overflow-hidden animate-fade-in-up shadow-2xl border-white/20">
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-primary/20 to-accent/20 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-sm shadow-glow">🤖</div>
                                <div>
                                    <h3 className="text-sm font-bold text-white leading-none">Smart Assistant</h3>
                                    <span className="text-[10px] text-gray-400">Online & Ready</span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">✕</button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.isBot
                                            ? 'bg-white/10 text-white rounded-tl-none border border-white/5'
                                            : 'bg-primary text-white rounded-tr-none'
                                        } shadow-lg backdrop-blur-md`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-black/40 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary transition-all text-white placeholder-gray-500"
                                />
                                <button
                                    onClick={handleSend}
                                    className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-white shadow-glow"
                                >
                                    🚀
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-glow transition-all duration-300 hover:scale-110 active:scale-90 ${isOpen ? 'bg-accent/80 backdrop-blur-md rotate-90' : 'bg-primary'
                        }`}
                >
                    {isOpen ? <span className="text-2xl text-white">✕</span> : <span className="text-3xl">🤖</span>}
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
