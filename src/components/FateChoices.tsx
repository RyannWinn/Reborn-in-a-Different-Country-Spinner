
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

interface Question {
  question: string;
  options: { text: string; effect: number }[];
}

interface FateChoicesProps {
  questions: Question[];
  onComplete: (age: number) => void;
}

export default function FateChoices({ questions, onComplete }: FateChoicesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalEffect, setTotalEffect] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [displayAge, setDisplayAge] = useState(0);

  const handleOption = (effect: number) => {
    const nextEffect = totalEffect + effect;
    setTotalEffect(nextEffect);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      const baseAge = 65;
      const finalAge = Math.max(1, Math.min(100, baseAge + nextEffect * 2));
      setCompleted(true);
      
      // Animate age reveal
      let start = 0;
      const duration = 2000;
      const startTime = performance.now();
      
      const animateAge = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentAge = Math.floor(progress * finalAge);
        
        setDisplayAge(currentAge);
        
        if (progress < 1) {
          requestAnimationFrame(animateAge);
        } else {
          onComplete(finalAge);
        }
      };
      
      requestAnimationFrame(animateAge);
    }
  };

  const current = questions[currentIndex];

  if (!current && !completed) return null;

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-vibrant-primary">Choice {currentIndex + 1} / {questions.length}</span>
              <div className="flex gap-1">
                {[...Array(questions.length)].map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1 w-4 rounded-full transition-colors",
                      i <= currentIndex ? "bg-vibrant-primary" : "bg-white/10"
                    )} 
                  />
                ))}
              </div>
            </div>

            <h3 className="text-2xl font-bold italic tracking-tight leading-snug">
              {current.question}
            </h3>

            <div className="grid gap-4 pt-4">
              {current.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleOption(option.effect)}
                  className="group relative w-full text-left p-6 border border-white/10 hover:border-vibrant-primary/50 transition-all bg-white/5 hover:bg-white/10 rounded-xl flex justify-between items-center"
                >
                  <span className="font-medium opacity-80 group-hover:opacity-100">{option.text}</span>
                  <ChevronRight className="h-5 w-5 text-vibrant-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 space-y-6"
          >
            <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full bg-vibrant-primary/10 border-2 border-vibrant-primary mb-4 overflow-hidden">
               <motion.div 
                 initial={{ y: 50, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="text-4xl font-black italic tracking-tighter text-vibrant-primary"
               >
                 {displayAge}
               </motion.div>
               <div className="absolute inset-0 bg-vibrant-primary/5 animate-pulse" />
            </div>
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">Fate Determined</h3>
            <p className="text-[10px] font-mono text-vibrant-primary uppercase tracking-[0.4em] mb-2">Final Lifespan: {displayAge} Years</p>
            <p className="text-[10px] opacity-40 uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
              Based on your choices in this cycle, your life trajectory has been finalized.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
