
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useAnimation, useMotionValue, useSpring } from 'motion/react';
import { Globe2, Users, Info, RefreshCw, Trophy, MapPin, Languages, Coins, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import SoulFlight from './components/SoulFlight';
import FateChoices from './components/FateChoices';
import { fetchCountries } from './services/countryService';
import { getCountryInsight, generateFateQuestions } from './services/geminiService';
import { Country, SpinResult } from './types';
import { cn } from './lib/utils';

const WHEEL_SIZE = 600;
const INNER_RADIUS = 64;

export default function App() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'ascension' | 'result' | 'game' | 'locked' | 'fate'>('landing');
  const [result, setResult] = useState<SpinResult | null>(null);
  const [history, setHistory] = useState<SpinResult[]>([]);
  const [rebirthCount, setRebirthCount] = useState(0);
  const [fateQuestions, setFateQuestions] = useState<any[]>([]);
  const [deathAge, setDeathAge] = useState<number | null>(null);
  const [fateLoading, setFateLoading] = useState(false);
  const [hasPlayedGame, setHasPlayedGame] = useState(false);
  
  const totalPopulation = useMemo(() => 
    countries.reduce((sum, c) => sum + c.population, 0), 
  [countries]);

  useEffect(() => {
    fetchCountries().then(data => {
      setCountries(data);
      setLoading(false);
    });
  }, []);

  const handleRebirth = async () => {
    if (view === 'ascension' || countries.length === 0) return;

    setView('ascension');
    setResult(null);

    try {
      // Weighted random selection
      const random = Math.random() * totalPopulation;
      let cumulative = 0;
      let selectedCountry = countries[0];
      
      for (const country of countries) {
        cumulative += country.population;
        if (random <= cumulative) {
          selectedCountry = country;
          break;
        }
      }

      // Start fetching data early while animating
      const insightPromise = getCountryInsight(selectedCountry.name);
      
      // Minimum animation time for dramatic effect
      const animationPromise = new Promise(resolve => setTimeout(resolve, 5000));
      
      const [aiInsight] = await Promise.all([insightPromise, animationPromise]);
      
      const probability = (selectedCountry.population / totalPopulation) * 100;
      
      const spinResult: SpinResult = { 
        country: selectedCountry, 
        probability,
        city: aiInsight.city,
        survivalProbability: aiInsight.survivalProbability,
        socialClass: aiInsight.socialClass,
        insight: aiInsight.insight
      };
      
      setResult(spinResult);
      setHistory(prev => [spinResult, ...prev].slice(0, 5));
      setRebirthCount(prev => prev + 1);
      
      // Pre-load fate questions
      setFateLoading(true);
      generateFateQuestions(selectedCountry.name, aiInsight.city, aiInsight.socialClass).then(qs => {
        setFateQuestions(qs);
        setFateLoading(false);
      });

      setView('result');
      
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.3 },
        colors: ['#00F0FF', '#FF00E5', '#7000FF', '#FFFFFF']
      });
    } catch (error) {
      console.error("Rebirth Error:", error);
      setView('landing');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 font-sans text-slate-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Globe2 className="h-12 w-12 text-blue-500" />
        </motion.div>
        <p className="mt-4 animate-pulse text-sm font-medium tracking-widest uppercase text-slate-400">
          Gathering Global Data...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg font-sans text-white p-6 md:p-12 selection:bg-vibrant-primary selection:text-black transition-colors duration-500 overflow-x-hidden">
      {/* Background Particles */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
      {/* Ascension Animation Layer */}
      {view === 'ascension' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] sky-gradient flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Moving Clouds/Stars */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white/10 rounded-full blur-xl"
              style={{
                width: Math.random() * 300 + 100,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 120}%`,
              }}
              animate={{
                top: '-20%',
                opacity: [0, 0.3, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "linear"
              }}
            />
          ))}

          {/* The Soul */}
          <motion.div
            initial={{ y: 200, scale: 0.5, opacity: 0 }}
            animate={{ 
              y: [-100, -800], 
              scale: [1, 2, 0.5],
              opacity: [0, 1, 1, 0],
              filter: ['blur(0px)', 'blur(8px)', 'blur(16px)']
            }}
            transition={{ duration: 5, ease: "easeInOut" }}
            className="relative"
          >
            <div className="w-16 h-16 bg-white rounded-full shadow-[0_0_80px_rgba(255,255,255,1),0_0_120px_rgba(0,240,255,0.8)] mix-blend-screen" />
            <div className="absolute inset-0 bg-vibrant-primary rounded-full blur-2xl opacity-50 animate-pulse" />
          </motion.div>

          {/* Text Overlays */}
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 4, times: [0, 0.5, 1] }}
            className="mt-24 text-center"
          >
            <h2 className="text-4xl font-black uppercase italic tracking-widest text-vibrant-primary drop-shadow-[0_0_20px_rgba(0,240,255,0.5)]">
              Soul Ascending
            </h2>
            <p className="mt-4 text-xs font-mono uppercase tracking-[0.4em] opacity-60">Preparing for Reincarnation</p>
          </motion.div>
        </motion.div>
      )}

      {/* Mini Game Layer */}
      {view === 'game' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6"
        >
          <div className="max-w-md w-full space-y-8 text-center mb-8">
            <h2 className="text-4xl font-[900] italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-vibrant-primary to-vibrant-secondary">Trial of the Flight</h2>
            <p className="text-sm opacity-60 leading-relaxed uppercase tracking-widest font-bold">
              Reach <span className="text-white">10 Souls</span> to bypass your destiny. 
              <br/>Fail once, and your soul is bound forever.
            </p>
          </div>
          <SoulFlight 
            onWin={handleRebirth} 
            onLose={() => {
              setHasPlayedGame(true);
              setView('locked');
            }} 
          />
        </motion.div>
      )}

      {/* Fate Choices Layer */}
      {view === 'fate' && result && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#7000FF44_0%,_transparent_70%)] opacity-30" />
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-12 text-center">Life Decision Nodes</h2>
          <FateChoices 
            questions={fateQuestions} 
            onComplete={(age) => {
              setDeathAge(age);
              setTimeout(() => setView('result'), 2500);
            }} 
          />
        </motion.div>
      )}

      {/* Locked Screen Layer */}
      {view === 'locked' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="absolute inset-0 bg-red-900/10 pointer-events-none" />
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mb-8 border-4 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)]"
          >
            <div className="w-8 h-8 bg-black rounded-full" />
          </motion.div>
          <h2 className="text-6xl font-black uppercase italic tracking-tighter text-red-600 mb-4">Soul Bound</h2>
          <p className="max-w-md text-sm font-mono uppercase tracking-widest opacity-60 mb-8">
            The trial has been failed. Your current life is finalized.
            <br/>Dimensional transfer is now inaccessible.
          </p>
          
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setView('result')}
              className="px-8 py-4 border border-white/20 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all"
            >
              Review Final Destiny
            </button>
            <div className="text-[10px] uppercase font-bold tracking-[0.4em] opacity-30 animate-pulse mt-4">
              Refresh page to reset soul cycle (Hard Reset)
            </div>
          </div>
        </motion.div>
      )}

      {/* Header Section */}
      <header className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-baseline mb-12 border-b-4 border-vibrant-primary/30 pb-6 gap-6 relative">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-vibrant-accent/20 blur-[120px] rounded-full pointer-events-none" />
        <h1 className="text-6xl md:text-8xl font-[900] italic tracking-tighter uppercase leading-[0.8] mb-0 text-transparent bg-clip-text bg-gradient-to-r from-vibrant-primary via-white to-vibrant-secondary">
          Rebirth
        </h1>
        <div className="md:text-right flex flex-col items-start md:items-end w-full md:w-auto relative z-10">
          <p className="text-xs font-mono text-vibrant-primary opacity-80 uppercase tracking-[0.2em] mb-1">Global Soul Reincarnation Simulator</p>
          <p className="text-4xl md:text-6xl font-[900] font-mono tracking-tighter tabular-nums leading-none drop-shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            {(totalPopulation / 1e9).toFixed(2)}B
          </p>
          <div className="flex items-center gap-2 mt-2 opacity-40">
            <Globe2 className="h-4 w-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Real-time weighting enabled</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-12 items-start">
          
          {/* Interaction Area */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center min-h-[60vh] space-y-12 relative">
            {view === 'landing' || view === 'result' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center space-y-12 w-full"
              >
                {/* Visual Anchor */}
                <div className="relative">
                  <div className="absolute inset-0 bg-vibrant-primary/20 blur-[100px] rounded-full" />
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Globe2 className="h-48 w-48 text-vibrant-primary/30 stroke-[0.5]" />
                  </motion.div>
                </div>

                <div className="text-center space-y-4 max-w-lg">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Your current cycle ends here.</h2>
                  <p className="text-sm font-medium opacity-40 uppercase tracking-widest leading-loose">
                    Are you ready to surrender your earthly identity and embrace the infinite probability of the next world?
                  </p>
                </div>

                {rebirthCount === 0 ? (
                  <button
                    onClick={handleRebirth}
                    className="group relative px-12 py-8 bg-transparent overflow-hidden"
                  >
                    {/* Neon Border */}
                    <div className="absolute inset-0 border-2 border-vibrant-primary rounded-sm opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 border border-vibrant-secondary rounded-sm translate-x-1 translate-y-1 opacity-20" />
                    
                    {/* Glow Background */}
                    <div className="absolute inset-0 bg-vibrant-primary/0 group-hover:bg-vibrant-primary/10 transition-colors" />
                    
                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-vibrant-primary" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-vibrant-primary" />

                    <span className="relative z-10 flex items-center gap-4 text-3xl font-black uppercase italic tracking-[0.2em] group-hover:tracking-[0.3em] transition-all duration-500">
                      <RefreshCw className="h-6 w-6 text-vibrant-primary group-hover:rotate-180 transition-transform duration-700" />
                      Rebirth
                    </span>
                  </button>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center p-8 border border-white/10 bg-white/5 backdrop-blur-sm space-y-4"
                  >
                    <div className="text-vibrant-primary animate-pulse">
                      <Trophy className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-xs font-mono uppercase tracking-[0.3em] text-vibrant-primary">Trajectory Initiated</p>
                    <p className="text-[10px] uppercase font-bold opacity-40 leading-relaxed">
                      Primary rebirth cycle completed. <br/>
                      The soul is now tethered to its new vessel.
                    </p>
                  </motion.div>
                )}

                <div className="flex gap-12 mt-12 opacity-20">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2">Soul Frequency</p>
                    <p className="text-2xl font-black italic tracking-tighter">STABLE</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2">Vessel Link</p>
                    <p className="text-2xl font-black italic tracking-tighter">SECURE</p>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>

          {/* Results Sidebar */}
          <div className="lg:col-span-5 space-y-10">
            {/* Dynamic Result Panel */}
            <div className={cn(
              "border-l-4 border-vibrant-primary pl-8 transition-all duration-700 relative overflow-hidden min-h-[400px]",
              result ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            )}>
              {/* Dynamic Background Image */}
              {result && (
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20 transition-opacity duration-1000">
                  <img 
                    src={`https://images.unsplash.com/featured/?city,${result.city},${result.country.name}`} 
                    alt="" 
                    className="w-full h-full object-cover blur-md scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/80 to-transparent" />
                </div>
              )}

              <div className="absolute -top-12 -right-12 w-32 h-32 bg-vibrant-secondary/20 blur-[60px] rounded-full pointer-events-none" />
              {result && (
                <div className="space-y-8 relative z-10">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <img src={result.country.flag} alt="" className="h-8 w-auto border border-vibrant-primary/20 shadow-[0_0_10px_rgba(0,240,255,0.2)]" />
                      <span className="text-xs font-mono tracking-widest uppercase text-vibrant-primary drop-shadow-[0_0_5px_rgba(0,240,255,0.4)]">Rebirth Location Locked</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-[900] italic uppercase tracking-tighter leading-[0.9] break-words text-transparent bg-clip-text bg-gradient-to-br from-white to-vibrant-primary">
                      {result.city},<br/>{result.country.name}
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-baseline border-b-2 border-white/10 pb-2">
                        <span className="text-xs font-black uppercase tracking-widest opacity-40">Survival Probability</span>
                        <span className={cn(
                          "text-4xl font-[900] font-mono tracking-tighter italic drop-shadow-[0_0_15px_rgba(255,0,229,0.4)]",
                          parseInt(result.survivalProbability || '0') < 40 ? "text-red-500" : 
                          parseInt(result.survivalProbability || '0') < 70 ? "text-yellow-400" : "text-green-400"
                        )}>
                          {result.survivalProbability}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-vibrant-primary">Social Class</p>
                        <p className={cn(
                          "text-2xl font-bold font-mono tracking-tighter italic whitespace-nowrap",
                          result.socialClass === "High" ? "text-vibrant-primary" : 
                          result.socialClass === "Low" ? "text-red-500" : "text-yellow-400"
                        )}>
                          {result.socialClass || "Unknown"}
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-vibrant-secondary">Final Lifespan</p>
                        <p className="text-xl font-bold font-mono tracking-tighter italic whitespace-nowrap text-white">
                          {deathAge ? `${deathAge} Years` : "PENDING..."}
                        </p>
                      </div>
                    </div>

                    {/* Rankings & Cons */}
                    <div className="grid gap-6 pt-4">
                      {result.rankings && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">National Standing</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {result.rankings.map((r, i) => (
                              <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-xs font-medium opacity-60">{r.category}</span>
                                <span className="text-xs font-black text-vibrant-primary italic uppercase tracking-tighter">{r.rank}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.cons && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">System Challenges (Cons)</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.cons.map((con, i) => (
                              <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-bold text-red-400 uppercase tracking-widest">
                                {con}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {result.insight && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-vibrant-accent/10 p-6 border-l-4 border-vibrant-accent mt-8 backdrop-blur-sm shadow-[0_0_20px_rgba(112,0,255,0.1)]"
                    >
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-3 text-vibrant-primary">Soul Narrative</h4>
                      <p className="text-sm leading-relaxed font-medium italic opacity-90 text-white/90">
                        "{result.insight}"
                      </p>
                    </motion.div>
                  )}

                  {/* Post-Result Action */}
                  <div className="pt-8 space-y-4">
                    {!deathAge && view !== 'locked' && (
                      <button
                        onClick={() => setView('fate')}
                        disabled={fateLoading}
                        className="w-full py-4 border-2 border-white/20 text-white font-black uppercase italic tracking-widest hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                      >
                        {fateLoading ? "Simulating Life Path..." : "Embark on Life (Determine Lifespan)"}
                      </button>
                    )}

                    {rebirthCount === 1 && view !== 'locked' && !hasPlayedGame ? (
                      <button
                        onClick={() => setView('game')}
                        className="w-full py-4 border-2 border-vibrant-secondary text-vibrant-secondary font-black uppercase italic tracking-widest hover:bg-vibrant-secondary/10 transition-colors shadow-[0_0_20px_rgba(255,0,229,0.1)]"
                      >
                        Challenge Destiny (One Extra Life)
                      </button>
                    ) : (
                      <div className="text-center p-6 bg-white/5 border border-white/10">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Trajectory Finalized</p>
                        <p className="text-xs italic mt-2 opacity-60">
                          {view === 'locked' || hasPlayedGame ? "Dimensional transfer failed. Destiny is bound." : "Dimensional limits reached. Refresh to reset soul cycle."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!result && view !== 'ascension' && view !== 'game' && view !== 'locked' && (
                <div className="space-y-6 py-12">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter border-b-2 border-white/10 pb-2">Destiny Awaits</h2>
                  <p className="text-sm opacity-40 leading-relaxed font-medium">
                    The Great Soul Wheel has stopped. You are currently in an intermediate state between dimensions. Press Rebirth to begin your primary ascension.
                  </p>
                </div>
              )}
            </div>

            {/* History Table */}
            <div className="pt-12 border-t border-white/10">
              <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Historical Trajectory</h3>
              <div className="space-y-3">
                {history.length > 0 ? (
                  history.map((h, i) => (
                    <div key={`${h.country.cca2}-${i}`} className="flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono text-white/20">0{history.length - i}</span>
                        <span className="text-xl font-black uppercase tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity italic">{h.city || h.country.name}</span>
                      </div>
                      <span className="text-sm font-mono opacity-40 italic">{h.country.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-20">Awaiting initial trajectory...</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="mx-auto max-w-7xl mt-24 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono tracking-widest opacity-40 uppercase gap-4">
        <div className="flex gap-8">
          <div>Ref: UN-DESA-2024 / V1.0</div>
          <div className="hidden sm:block">Coordinate: 0.0000° N, 0.0000° E</div>
        </div>
        <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>Session Status: Active / PX-992-ALPHA</span>
        </div>
      </footer>
    </div>
  );
}

