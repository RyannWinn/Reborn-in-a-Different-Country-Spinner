
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';

interface SoulFlightProps {
  onWin: () => void;
  onLose: () => void;
}

export default function SoulFlight({ onWin, onLose }: SoulFlightProps) {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [birdY, setBirdY] = useState(200);
  const [pipes, setPipes] = useState<{ x: number; topHeight: number }[]>([]);
  
  const gameRef = useRef<HTMLDivElement>(null);
  const birdYRef = useRef(200);
  const velocityRef = useRef(0);
  const pipesRef = useRef<{ x: number; topHeight: number }[]>([]);
  const scoreRef = useRef(0);
  const hasStarted = useRef(false);
  
  const GRAVITY = 0.6;
  const JUMP = -8;
  const PIPE_SPEED = 4;
  const PIPE_WIDTH = 60;
  const GAP_HEIGHT = 160;
  const BIRD_SIZE = 24;

  const jump = () => {
    if (gameOver) return;
    if (!hasStarted.current) hasStarted.current = true;
    velocityRef.current = JUMP;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') jump();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver]);

  // Signal parents only when game state is resolved
  useEffect(() => {
    if (gameOver) {
      // Small delay so user sees the crash
      const timer = setTimeout(() => {
        if (scoreRef.current >= 10) {
          onWin();
        } else {
          onLose();
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [gameOver, onWin, onLose]);

  // Game Loop
  useEffect(() => {
    let frameId: number;

    const update = () => {
      if (gameOver) return;
      if (!hasStarted.current) {
        frameId = requestAnimationFrame(update);
        return;
      }

      const height = gameRef.current?.clientHeight || 500;
      const width = gameRef.current?.clientWidth || 400;

      // Update Bird
      velocityRef.current += GRAVITY;
      birdYRef.current += velocityRef.current;

      // Bound Check
      if (birdYRef.current < 0 || birdYRef.current > height - BIRD_SIZE) {
        setGameOver(true);
        return;
      }

      // Update Pipes
      let currentPipes = [...pipesRef.current].map(p => ({ ...p, x: p.x - PIPE_SPEED }));
      
      // Spawning
      if (currentPipes.length === 0 || currentPipes[currentPipes.length - 1].x < width - 250) {
        currentPipes.push({
          x: width,
          topHeight: Math.random() * (height - GAP_HEIGHT - 100) + 50,
        });
      }

      // Scoring
      if (currentPipes.length > 0 && currentPipes[0].x < -PIPE_WIDTH) {
        currentPipes.shift();
        scoreRef.current += 1;
        setScore(scoreRef.current);
        if (scoreRef.current >= 10) {
          setGameOver(true);
          return;
        }
      }

      // Collision Check
      const birdRect = { 
        left: 50, 
        right: 50 + BIRD_SIZE, 
        top: birdYRef.current, 
        bottom: birdYRef.current + BIRD_SIZE 
      };

      for (const pipe of currentPipes) {
        const topRect = { left: pipe.x, right: pipe.x + PIPE_WIDTH, top: 0, bottom: pipe.topHeight };
        const bottomRect = { left: pipe.x, right: pipe.x + PIPE_WIDTH, top: pipe.topHeight + GAP_HEIGHT, bottom: height };

        const intersect = (r1: any, r2: any) => !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);

        if (intersect(birdRect, topRect) || intersect(birdRect, bottomRect)) {
          setGameOver(true);
          return;
        }
      }

      // Sync to State for Render
      pipesRef.current = currentPipes;
      setPipes(currentPipes);
      setBirdY(birdYRef.current);

      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [gameOver]);

  return (
    <div 
      ref={gameRef}
      className="relative w-full max-w-md h-[500px] bg-slate-900 border-4 border-vibrant-primary/30 rounded-lg overflow-hidden cursor-pointer"
      onClick={jump}
    >
      {/* Target Score Display */}
      <div className="absolute top-4 left-0 right-0 text-center z-10 pointer-events-none">
        <div className="text-xs font-mono uppercase tracking-[0.3em] opacity-40">Goal: 10 Souls</div>
        <div className="text-5xl font-black italic tracking-tighter text-vibrant-primary drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">
          {score}
        </div>
      </div>

      {/* Soul (Bird) */}
      <motion.div
        className="absolute left-[50px] w-6 h-6 bg-white rounded-full shadow-[0_0_15px_white]"
        style={{ top: birdY }}
      />
      <motion.div
         className="absolute left-[50px] w-6 h-6 bg-vibrant-primary/30 rounded-full blur-md"
         style={{ top: birdY }}
      />

      {/* Pipes */}
      {pipes.map((pipe, i) => (
        <React.Fragment key={i}>
          <div 
            className="absolute bg-vibrant-accent/20 border-x-2 border-vibrant-accent/50"
            style={{ left: pipe.x, top: 0, width: PIPE_WIDTH, height: pipe.topHeight }}
          />
          <div 
            className="absolute bg-vibrant-accent/20 border-x-2 border-vibrant-accent/50"
            style={{ left: pipe.x, top: pipe.topHeight + GAP_HEIGHT, width: PIPE_WIDTH, height: 500 }}
          />
        </React.Fragment>
      ))}

      {!gameOver && score === 0 && (
         <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20 pointer-events-none">
            <div className="text-center">
                <p className="text-sm font-black uppercase tracking-[0.2em] mb-2">The Trial of Flight</p>
                <p className="text-[10px] font-mono opacity-60">Tap or Space to Jump</p>
            </div>
         </div>
      )}
    </div>
  );
}
