function Profile() {
  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="glass-card p-8 rounded-[2rem] text-center relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 to-secondary/20"></div>

          <div className="relative z-10 -mt-12 mb-6">
            <div className="w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-r from-primary to-secondary">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=User+Name&background=random" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Prarthana PK</h2>
          <p className="text-muted-foreground mb-6">Event Organizer</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 p-4 rounded-2xl">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Events</p>
              <p className="text-xl font-bold text-white">12</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Rating</p>
              <p className="text-xl font-bold text-white">4.9</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-sm font-medium">Email</span>
              <span className="text-sm text-muted-foreground">user@example.com</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-sm font-medium">Plan</span>
              <span className="text-sm text-primary font-bold">Pro Member</span>
            </div>
          </div>

          <button className="gradient-button w-full mt-8">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
