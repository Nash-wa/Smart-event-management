function Budget() {
    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent">
                    Budget Overview
                </h2>
                <p className="text-muted-foreground mb-8">Track your event expenses and funding.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl" role="img" aria-label="money bag">💰</div>
                        <h3 className="text-muted-foreground text-sm font-medium mb-1">Total Budget</h3>
                        <p className="text-3xl font-bold text-white">₹50,000</p>
                        <div className="mt-4 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-full"></div>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl" role="img" aria-label="chart decreasing">📉</div>
                        <h3 className="text-muted-foreground text-sm font-medium mb-1">Expenses</h3>
                        <p className="text-3xl font-bold text-red-400">₹12,500</p>
                        <div className="mt-4 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 w-[25%]"></div>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl" role="img" aria-label="credit card">💳</div>
                        <h3 className="text-muted-foreground text-sm font-medium mb-1">Remaining</h3>
                        <p className="text-3xl font-bold text-blue-400">₹37,500</p>
                        <div className="mt-4 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[75%]"></div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 glass-card p-6 rounded-3xl">
                    <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                    <div className="space-y-4">
                        {[
                            { id: 1, title: "Venue Booking", sub: "High Tech Auditorium", amount: "-₹5,000", icon: "📉" },
                            { id: 2, title: "Catering Advance", sub: "Fresh Foods Ltd", amount: "-₹2,500", icon: "🍔" },
                            { id: 3, title: "Decoration", sub: "Event Decorators", amount: "-₹5,000", icon: "🎨" }
                        ].map((transaction) => (
                            <div key={transaction.id} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 text-lg">
                                        {transaction.icon}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{transaction.title}</p>
                                        <p className="text-xs text-muted-foreground">{transaction.sub}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-red-400">{transaction.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Budget;
