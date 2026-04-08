import React from "react";
import { useNavigate } from "react-router-dom";
import heroAesthetic from "../assets/hero_aesthetic.png";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-background relative overflow-hidden selection:bg-accent/20">
      
      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full z-[100] px-4 md:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass-card px-8 py-3 rounded-full border-white/40 shadow-lux backdrop-blur-3xl bg-white/70">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg transform rotate-6 border border-white/20">
              <span className="text-white font-black text-xl italic">b</span>
            </div>
            <span className="font-black text-2xl tracking-tighter text-primary lowercase">bendo</span>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate("/login")}
              className="text-xs font-black text-primary uppercase tracking-widest hover:text-accent transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate("/register")}
              className="px-6 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Join Now
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Cinematic Backdrop: Luxury Aesthetic Space */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroAesthetic} 
            className="w-full h-full object-cover brightness-[0.85] blur-2xl scale-110"
            alt="Hero Background"
          />
          {/* Subtle gradient to ensure text stands out against the light theme */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background/40"></div>
        </div>

        <div className="relative z-10 text-center max-w-5xl space-y-10 mt-16 animate-fade-in group">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-3xl border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-hero-main shadow-sm">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span> your ultimate event planner
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-hero-main drop-shadow-2xl">
            Plan Local. <br />
            <span className="text-hero-accent underline decoration-accent/30 underline-offset-8">Scale Smart.</span>
          </h1>

          <p className="text-lg md:text-xl text-hero-sub font-medium max-w-2xl mx-auto leading-relaxed shadow-sm">
            Elevate your events with cinematic AI precision and professional scaling tools designed for the modern visionary.
          </p>

        </div>

      </section>
    </div>
  );
}

export default Home;
