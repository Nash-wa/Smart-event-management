function Participants() {
  const participants = [
    { id: 1, name: "Alice Johnson", role: "Speaker", status: "Confirmed" },
    { id: 2, name: "Bob Smith", role: "Attendee", status: "Pending" },
    { id: 3, name: "Charlie Davis", role: "Organizer", status: "Confirmed" },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Participants
        </h2>
        <p className="text-muted-foreground mb-8">Manage and track your event attendees.</p>

        <div className="glass-card p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Guest List</h3>
            <button className="gradient-button py-2 px-6 text-sm">
              + Add Participant
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground text-sm">
                  <th className="pb-3 pl-2">Name</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {participants.length > 0 ? (
                  participants.map((person) => (
                    <tr key={person.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-2 font-medium">{person.name}</td>
                      <td className="py-4 text-sm text-muted-foreground">{person.role}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${person.status === "Confirmed"
                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                            : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                          }`}>
                          {person.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-muted-foreground">
                      No participants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Participants;
