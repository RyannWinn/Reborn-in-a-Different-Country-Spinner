
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useAnimation, useMotionValue, useSpring } from 'motion/react';
import { Globe2, Users, Info, RefreshCw, Trophy, MapPin, Languages, Coins, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchCountries } from './services/countryService';
import { getCountryInsight } from './services/geminiService';
import { Country, SpinResult } from './types';
import { cn } from './lib/utils';

const WHEEL_SIZE = 600;
const INNER_RADIUS = 64;

export default function App() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [history, setHistory] = useState<SpinResult[]>([]);
  
  const controls = useAnimation();
  const rotation = useMotionValue(0);
  const springRotation = useSpring(rotation, { stiffness: 40, damping: 20 });

  const totalPopulation = useMemo(() => 
    countries.reduce((sum, c) => sum + c.population, 0), 
  [countries]);

  useEffect(() => {
    fetchCountries().then(data => {
      setCountries(data);
      setLoading(false);
    });
  }, []);

  const handleSpin = async () => {
    if (spinning || countries.length === 0) return;

    setSpinning(true);
    setResult(null);
    setInsight(null);

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

    // Calculate rotation
    // We want to land on the slice for the selected country.
    // However, visualizing 200+ slices is hard. 
    // We'll spin a random number of full rotations plus a random offset.
    const currentRotation = rotation.get();
    const extraRotations = 5 + Math.random() * 5;
    const newRotation = currentRotation + (360 * extraRotations) + Math.random() * 360;

    await controls.start({
      rotate: newRotation,
      transition: { duration: 6, ease: [0.15, 0, 0.15, 1] }
    });

    rotation.set(newRotation % 360);
    
    const probability = (selectedCountry.population / totalPopulation) * 100;
    const spinResult = { country: selectedCountry, probability };
    
    setResult(spinResult);
    setHistory(prev => [spinResult, ...prev].slice(0, 5));
    setSpinning(false);
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
    });

    const aiInsight = await getCountryInsight(selectedCountry.name);
    setInsight(aiInsight);
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
    <div className="min-h-screen bg-[#0F0F0F] font-sans text-white p-6 md:p-12 selection:bg-white selection:text-black">
      {/* Header Section */}
      <header className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-baseline mb-12 border-b-4 border-white pb-6 gap-6">
        <h1 className="text-6xl md:text-8xl font-[900] italic tracking-tighter uppercase leading-[0.8] mb-0">
          Global<br/>Chance
        </h1>
        <div className="md:text-right flex flex-col items-start md:items-end w-full md:w-auto">
          <p className="text-xs font-mono opacity-60 uppercase tracking-[0.2em] mb-1">UN Population Distribution Wheel</p>
          <p className="text-4xl md:text-6xl font-[900] font-mono tracking-tighter tabular-nums leading-none">
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
          
          {/* Wheel Section */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-12">
            <div className="relative group">
              {/* Outer Decorative Ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] rounded-full border border-white/10 animate-pulse pointer-events-none" />
              
              {/* Selector Needle */}
              <div className="absolute -top-8 left-1/2 z-30 -translate-x-1/2">
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[35px] border-t-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.3)]" />
              </div>

              {/* The Wheel */}
              <div className="relative h-[320px] w-[320px] sm:h-[500px] sm:w-[500px] md:h-[560px] md:w-[560px]">
                <motion.div
                  animate={controls}
                  className="h-full w-full rounded-full border-4 border-white bg-[#171717] overflow-hidden relative shadow-[0_0_100px_rgba(255,255,255,0.05)]"
                  style={{ rotate: rotation }}
                >
                  <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)]" />
                  
                  {/* CSS Conic Gradient Wheel Mockup for background */}
                  <div 
                    className="absolute inset-0"
                    style={{ 
                      background: `conic-gradient(
                        #FFFFFF 0% 18%,
                        #E5E5E5 18% 36%,
                        #A3A3A3 36% 40%,
                        #737373 40% 43%,
                        #525252 43% 46%,
                        #404040 46% 48%,
                        #262626 48% 50%,
                        #171717 50% 100%
                      )` 
                    }}
                  />

                  {/* Tick Marks */}
                  {[...Array(72)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-white/20 origin-[50%_280px] md:origin-[50%_280px]"
                      style={{ 
                        transform: `rotate(${i * 5}deg)`,
                        height: i % 12 === 0 ? '20px' : '10px',
                        backgroundColor: i % 12 === 0 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'
                      }}
                    />
                  ))}

                  {/* Labels */}
                  {countries.slice(0, 8).map((c, i) => {
                     const angle = (i * 45);
                     return (
                       <div 
                        key={c.cca2}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none"
                        style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
                       >
                         <div className="absolute top-12 left-1/2 -translate-x-1/2 text-[11px] font-black uppercase tracking-tighter text-black/60 mix-blend-difference">
                           {c.name}
                         </div>
                       </div>
                     )
                  })}
                </motion.div>

                {/* Center Hub */}
                <div className="absolute inset-x-0 inset-y-0 m-auto h-32 w-32 rounded-full border-4 border-white bg-[#0F0F0F] z-20 flex flex-col items-center justify-center text-center shadow-2xl">
                  <span className="text-[10px] uppercase font-bold tracking-widest leading-none mb-1 opacity-60">Probability</span>
                  <span className="text-2xl font-[900] tracking-tighter uppercase tabular-nums">1 / 8.1B</span>
                  <Globe2 className={cn("h-4 w-4 mt-2 text-white/40", spinning && "animate-spin")} />
                </div>
              </div>
            </div>

            <button
              onClick={handleSpin}
              disabled={spinning}
              className={cn(
                "w-full max-w-md bg-white text-black font-[900] uppercase text-2xl py-6 px-12 transition-all hover:bg-neutral-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-b-8 border-neutral-300 active:border-b-0 active:translate-y-[8px]",
                spinning && "grayscale"
              )}
            >
              {spinning ? "SPINNING THE ODDS..." : "SPIN THE POPULATION"}
            </button>
          </div>

          {/* Results Sidebar */}
          <div className="lg:col-span-5 space-y-10">
            {/* Dynamic Result Panel */}
            <div className={cn(
              "border-l-4 border-white pl-8 transition-all duration-700",
              result ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            )}>
              {result && (
                <div className="space-y-8">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <img src={result.country.flag} alt="" className="h-8 w-auto border border-white/20" />
                      <span className="text-xs font-mono tracking-widest uppercase opacity-40">Destination Locked</span>
                    </div>
                    <h2 className="text-6xl font-[900] italic uppercase tracking-tighter leading-none break-words">
                      {result.country.name}
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-baseline border-b-2 border-white/10 pb-2">
                        <span className="text-xs font-black uppercase tracking-widest opacity-40">Landing Probability</span>
                        <span className="text-4xl font-[900] font-mono tracking-tighter italic">{result.probability.toFixed(4)}%</span>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Population</p>
                        <p className="text-2xl font-bold font-mono tracking-tighter italic">{(result.country.population / 1e6).toFixed(1)}M</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Capital</p>
                        <p className="text-lg font-bold uppercase tracking-tighter">{result.country.capital}</p>
                      </div>
                    </div>
                  </div>

                  {insight && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/5 p-6 border-l-4 border-blue-500 mt-8"
                    >
                      <p className="text-sm leading-relaxed font-medium italic opacity-80">
                        "{insight}"
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
              {!result && !spinning && (
                <div className="space-y-6 py-12">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter border-b-2 border-white/10 pb-2">Top Weighted Stakes</h2>
                  <p className="text-sm opacity-40 leading-relaxed font-medium">
                    National segments calculated by current global demographic estimates. Selection probability scales linearly with registered population density.
                  </p>
                  <div className="space-y-6">
                    {countries.slice(0, 5).map((c) => (
                      <div key={c.cca2} className="flex justify-between items-end border-b border-white/20 pb-1">
                        <span className="text-4xl font-black uppercase tracking-tighter italic leading-none">{c.name}</span>
                        <span className="text-xl font-mono opacity-80 italic tabular-nums">{((c.population / totalPopulation) * 100).toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
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
                        <span className="text-xl font-black uppercase tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity italic">{h.country.name}</span>
                      </div>
                      <span className="text-sm font-mono opacity-40 italic">{h.probability.toFixed(2)}%</span>
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

