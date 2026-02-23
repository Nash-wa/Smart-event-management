import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Budget() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newExpense, setNewExpense] = useState({ label: '', amount: '' });

    useEffect(() => {
        if (!eventId) {
            setLoading(false);
            return;
        }

        const fetchEventData = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const res = await fetch(`http://localhost:5000/api/events/${eventId}`, {
                    headers: {
                        'Authorization': `Bearer ${userInfo?.token}`
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    setEvent(data);
                }
            } catch (error) {
                console.error("Failed to fetch event budget", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEventData();
    }, [eventId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
            </div>
        );
    }

    if (!eventId || !event) {
        return (
            <div className="min-h-screen p-8 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">No Event Selected</h2>
                <p className="text-muted-foreground mb-6">Please go to My Events and select an event to view its budget.</p>
                <button onClick={() => navigate("/my-events")} className="gradient-button px-6 py-2">
                    Go to My Events
                </button>
            </div>
        );
    }


    const addExpense = async () => {
        if (!newExpense.label || !newExpense.amount) return;

        const manualExpenses = event.manualExpenses || [];
        const updatedManualExpenses = [...manualExpenses, { ...newExpense, amount: Number(newExpense.amount) }];
        const updatedEvent = { ...event, manualExpenses: updatedManualExpenses };

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const res = await fetch(`http://localhost:5000/api/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo?.token}`
                },
                body: JSON.stringify(updatedEvent)
            });
            if (res.ok) {
                setEvent(updatedEvent);
                setNewExpense({ label: '', amount: '' });
            }
        } catch (error) {
            console.error("Failed to add manual expense", error);
        }
    };

    const deleteExpense = async (index) => {
        const updatedManualExpenses = event.manualExpenses.filter((_, i) => i !== index);
        const updatedEvent = { ...event, manualExpenses: updatedManualExpenses };

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const res = await fetch(`http://localhost:5000/api/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo?.token}`
                },
                body: JSON.stringify(updatedEvent)
            });
            if (res.ok) {
                setEvent(updatedEvent);
            }
        } catch (error) {
            console.error("Failed to delete expense", error);
        }
    };

    const totalBudget = event.budget || 0;
    const vendors = event.selectedVendors ? Object.values(event.selectedVendors) : [];
    const vendorExpenses = vendors.reduce((sum, v) => sum + (v.price || 0), 0);
    const manualExpensesTotal = (event.manualExpenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalExpenses = vendorExpenses + manualExpensesTotal;
    const remaining = totalBudget - totalExpenses;
    const expensePercentage = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;


    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent">
                            Budget Overview
                        </h2>
                        <p className="text-muted-foreground">Financial tracking for <span className="text-white font-bold">{event.name}</span></p>
                    </div>
                    <button onClick={() => navigate(`/event-plan/${eventId}`)} className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-xs">
                        Back to Plan
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl">💰</div>
                        <h3 className="text-muted-foreground text-sm font-medium mb-1">Allocated Budget</h3>
                        <p className="text-3xl font-bold text-white">₹{totalBudget.toLocaleString()}</p>
                        <div className="mt-4 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-full"></div>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl">📉</div>
                        <h3 className="text-muted-foreground text-sm font-medium mb-1">Used Funds</h3>
                        <p className="text-3xl font-bold text-red-400">₹{totalExpenses.toLocaleString()}</p>
                        <div className="mt-4 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500" style={{ width: `${Math.min(expensePercentage, 100)}%` }}></div>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl">💳</div>
                        <h3 className="text-muted-foreground text-sm font-medium mb-1">Net Balance</h3>
                        <p className="text-3xl font-bold text-blue-400">₹{remaining.toLocaleString()}</p>
                        <div className="mt-4 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${Math.max(0, 100 - expensePercentage)}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* VENDOR SERVICES */}
                    <div className="glass-card p-6 rounded-3xl">
                        <h3 className="text-lg font-semibold mb-4 text-white/90">Service Commitments</h3>
                        <div className="space-y-4">
                            {vendors.length > 0 ? vendors.map((vendor, idx) => (
                                <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg border border-white/5 group-hover:border-white/20 transition-all">
                                            📦
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-white">{vendor.name}</p>
                                            <p className="text-xs text-muted-foreground uppercase tracking-widest">{vendor.category || 'Service'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-mono font-bold text-red-400">₹{(vendor.price || 0).toLocaleString()}</span>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Verified</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-muted-foreground italic text-sm">
                                    No vendor contracts active.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MANUAL EXPENSES */}
                    <div className="glass-card p-6 rounded-3xl">
                        <h3 className="text-lg font-semibold mb-4 text-white/90">Additional Expenses</h3>

                        <div className="flex gap-2 mb-6">
                            <input
                                type="text"
                                placeholder="Expense label..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-blue-500 outline-none"
                                value={newExpense.label}
                                onChange={(e) => setNewExpense({ ...newExpense, label: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Amount..."
                                className="w-32 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-blue-500 outline-none"
                                value={newExpense.amount}
                                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                            />
                            <button
                                onClick={addExpense}
                                className="px-4 py-2 bg-blue-500 text-white font-bold rounded-xl text-sm hover:bg-blue-600 transition-all"
                            >
                                Add
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {(event.manualExpenses || []).map((exp, idx) => (
                                <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm border border-white/5">
                                            💸
                                        </div>
                                        <p className="font-medium text-sm text-white">{exp.label}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono font-bold text-red-400">₹{(exp.amount || 0).toLocaleString()}</span>
                                        <button
                                            onClick={() => deleteExpense(idx)}
                                            className="text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(!event.manualExpenses || event.manualExpenses.length === 0) && (
                                <div className="text-center py-10 text-muted-foreground italic text-sm">
                                    No manual expenses recorded.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Budget;
