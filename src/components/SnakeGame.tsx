import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Position, Direction, GameSpeed } from '../types';
import { synthEngine } from '../utils/audio';
import { Play, Pause, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const GRID_SIZE = 20;

const SPEED_MAP: Record<GameSpeed, number> = {
  SLOW: 160,
  MEDIUM: 100,
  FAST: 70,
  HYPER: 40,
};

interface SnakeGameProps {
  activeThemeColor: string;
  glowColor: string;
}

export default function SnakeGame({ activeThemeColor, glowColor }: SnakeGameProps) {
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('snake_high_score') || '0');
    } catch {
      return 0;
    }
  });

  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [speed, setSpeed] = useState<GameSpeed>('MEDIUM');
  
  const snakeRef = useRef<Position[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const directionRef = useRef<Direction>('UP');
  const foodRef = useRef<Position>({ x: 5, y: 5 });
  const gameLoopId = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateRandomFood = useCallback((snake: Position[]): Position => {
    while (true) {
      const rx = Math.floor(Math.random() * GRID_SIZE);
      const ry = Math.floor(Math.random() * GRID_SIZE);
      const collision = snake.some(item => item.x === rx && item.y === ry);
      if (!collision) {
        return { x: rx, y: ry };
      }
    }
  }, []);

  useEffect(() => {
    foodRef.current = generateRandomFood(snakeRef.current);
  }, [generateRandomFood]);

  const handleResetGame = useCallback(() => {
    if (gameLoopId.current) clearInterval(gameLoopId.current);
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    directionRef.current = 'UP';
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    foodRef.current = generateRandomFood(snakeRef.current);
  }, [generateRandomFood]);

  const handleTogglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const changeDirection = useCallback((newDir: Direction) => {
    const currentDir = directionRef.current;
    if (newDir === 'UP' && currentDir === 'DOWN') return;
    if (newDir === 'DOWN' && currentDir === 'UP') return;
    if (newDir === 'LEFT' && currentDir === 'RIGHT') return;
    if (newDir === 'RIGHT' && currentDir === 'LEFT') return;
    directionRef.current = newDir;
  }, []);

  // Keyboard hooks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let absorbed = false;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          changeDirection('UP');
          absorbed = true;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          changeDirection('DOWN');
          absorbed = true;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          changeDirection('LEFT');
          absorbed = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          changeDirection('RIGHT');
          absorbed = true;
          break;
        case ' ':
          handleTogglePause();
          absorbed = true;
          break;
        default:
          break;
      }
      if (absorbed) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [changeDirection, handleTogglePause]);

  const triggerGameOver = useCallback(() => {
    setIsGameOver(true);
    setIsPaused(true);
    synthEngine.triggerCrashFX();
    
    setHighScore(prev => {
      if (score > prev) {
        try {
          localStorage.setItem('snake_high_score', String(score));
        } catch {}
        return score;
      }
      return prev;
    });

    if (gameLoopId.current) {
      clearInterval(gameLoopId.current);
    }
  }, [score]);

  const gameStep = useCallback(() => {
    if (isPaused || isGameOver) return;

    const snake = [...snakeRef.current];
    const head = { ...snake[0] };
    const dir = directionRef.current;

    switch (dir) {
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
    }

    // Boundary check
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      triggerGameOver();
      return;
    }

    // Self-collision checking
    const selfCollision = snake.some((seg, idx) => idx > 0 && seg.x === head.x && seg.y === head.y);
    if (selfCollision) {
      triggerGameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore(prev => prev + 10);
      synthEngine.triggerAppleFX();
      foodRef.current = generateRandomFood(snake);
    } else {
      snake.pop();
    }

    snakeRef.current = snake;
  }, [isPaused, isGameOver, generateRandomFood, triggerGameOver]);

  useEffect(() => {
    if (gameLoopId.current) clearInterval(gameLoopId.current);
    if (!isPaused && !isGameOver) {
      gameLoopId.current = setInterval(gameStep, SPEED_MAP[speed]);
    }
    return () => {
      if (gameLoopId.current) clearInterval(gameLoopId.current);
    };
  }, [speed, isPaused, isGameOver, gameStep]);

  // Paint pixel arrays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: any;

    const drawGrid = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cellW = width / GRID_SIZE;
      const cellH = height / GRID_SIZE;

      ctx.clearRect(0, 0, width, height);

      // Raw Matrix grid scan backing
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID_SIZE; i++) {
        // Horizontal
        ctx.beginPath();
        ctx.moveTo(0, i * cellH);
        ctx.lineTo(width, i * cellH);
        ctx.stroke();

        // Vertical
        ctx.beginPath();
        ctx.moveTo(i * cellW, 0);
        ctx.lineTo(i * cellW, height);
        ctx.stroke();
      }

      // Draw Retro Pixelated Cross Food
      const food = foodRef.current;
      const fx = food.x * cellW + 2;
      const fy = food.y * cellH + 2;
      const fw = cellW - 4;
      const fh = cellH - 4;

      // Dynamic rapid chromatic flickering for glitch look
      const flickerSeed = Math.random() < 0.25;
      ctx.fillStyle = flickerSeed ? '#00f0ff' : '#ff007f';
      ctx.fillRect(fx, fy, fw, fh);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(fx + 2, fy + 2, fw - 4, fh - 4);

      // Draw Hard Sided Byte Blocks Snake
      const snake = snakeRef.current;
      snake.forEach((segment, idx) => {
        const x = segment.x * cellW + 1;
        const y = segment.y * cellH + 1;
        const w = cellW - 2;
        const h = cellH - 2;

        if (idx === 0) {
          // Snake head is solid bright White/Cyan glitch
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = '#00f0ff';
          ctx.strokeRect(x, y, w, h);

          // Draw neon eyes
          ctx.fillStyle = '#ff007f';
          ctx.fillRect(x + 2, y + 2, 3, 3);
          ctx.fillRect(x + w - 5, y + 2, 3, 3);
        } else {
          // Symmetrical alternating binary colors
          ctx.fillStyle = idx % 2 === 0 ? '#ff007f' : '#00f0ff';
          ctx.fillRect(x, y, w, h);
          
          // Outer black outline for raw terminal rendering
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, w, h);
        }
      });

      // Glitched overlays
      if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, width, height);

        // Simulated Glitch art grid lines displacement
        ctx.strokeStyle = '#ff007f';
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, width - 20, height - 20);

        ctx.fillStyle = '#ff007f';
        // Large pixel terminal text
        ctx.font = '36px "VT323", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('FATAL_CRASH_ERROR', width / 2, height / 2 - 25);

        ctx.fillStyle = '#00f0ff';
        ctx.font = '16px "Share Tech Mono", monospace';
        ctx.fillText('SYS_CODE: 0x00F8A39B2_CORE_PANIC', width / 2, height / 2 + 10);

        ctx.fillStyle = '#ffffff';
        ctx.fillText('>> TRIGGER RESTORE_ARRAY TO REBOOT <<', width / 2, height / 2 + 45);

        // Random horizontal artifact block
        if (Math.random() < 0.4) {
          ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.fillRect(0, Math.random() * height, width, 15);
        }
      } else if (isPaused) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#00f0ff';
        ctx.font = '32px "VT323", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CORE: SYSTEM_SUSPENDED', width / 2, height / 2 - 15);

        ctx.fillStyle = '#ff007f';
        ctx.font = '14px "Share Tech Mono", monospace';
        ctx.fillText('> KEY_STROKE_INPUT: [SPACE] OR MOUNT_GAME <', width / 2, height / 2 + 20);

        // Ambient raster horizontal line
        ctx.strokeStyle = 'rgba(255, 0, 127, 0.4)';
        ctx.beginPath();
        const lineY = (Date.now() * 0.1) % height;
        ctx.moveTo(0, lineY);
        ctx.lineTo(width, lineY);
        ctx.stroke();
      }

      animId = requestAnimationFrame(drawGrid);
    };

    drawGrid();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isGameOver, isPaused]);

  return (
    <div className="flex flex-col gap-6" id="snake-container">
      {/* HUD Header Bar (Extreme Hex Telemetries) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Current Score Block */}
        <div className="bg-black border-2 border-[#ff007f] p-3 shadow-[3px_3px_0px_#00f0ff] flex flex-col gap-0.5">
          <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">REG://BUF_VAL_0x</span>
          <div className="text-3xl font-display font-black text-[#ff007f] tracking-widest">
            {String(score).padStart(4, '0')}
          </div>
        </div>

        {/* High Score Block */}
        <div className="bg-black border-2 border-[#00f0ff] p-3 shadow-[-3px_-3px_0px_#ff007f] flex flex-col gap-0.5">
          <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">SYS://MAX_MEM_REG</span>
          <div className="text-3xl font-display font-black text-[#00f0ff] tracking-widest">
            {String(highScore).padStart(4, '0')}
          </div>
        </div>
      </div>

      {/* Main CRT Arcade Canvas Window */}
      <div className="relative aspect-square w-full max-w-[420px] mx-auto bg-black p-1.5 border-4 border-double border-[#00f0ff] shadow-[5px_5px_0px_rgba(255,0,127,0.7)]">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={400} 
          className="w-full h-full bg-[#030303] block focus:outline-none crt-screen"
        />
        {/* Corner alignment crosshairs */}
        <div className="absolute top-1 left-1 text-[8px] font-mono text-[#ff007f]">+01</div>
        <div className="absolute top-1 right-1 text-[8px] font-mono text-[#ff007f]">01+</div>
        <div className="absolute bottom-1 left-1 text-[8px] font-mono text-[#ff007f]">+99</div>
        <div className="absolute bottom-1 right-1 text-[8px] font-mono text-[#ff007f]">99+</div>
      </div>

      {/* Control Mechanics */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Speed selectors */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0a0a0a] p-1.5 border border-dashed border-[#ff007f]">
          {(['SLOW', 'MEDIUM', 'FAST', 'HYPER'] as GameSpeed[]).map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`text-[9px] font-mono px-2 py-1 transition-all ${
                speed === s
                  ? 'bg-[#ff007f] text-black font-extrabold uppercase'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Start / Pause / Reset keys */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePause}
            disabled={isGameOver}
            className={`flex-1 md:flex-none py-2 px-5 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 border-2 ${
              isPaused 
                ? 'bg-black text-[#00f0ff] border-[#00f0ff] shadow-[2.5px_2.5px_0px_#ff007f] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none' 
                : 'bg-black text-white border-neutral-800'
            }`}
          >
            {isPaused ? 'UNHALT' : 'HALT_SYS'}
          </button>
          
          <button
            onClick={handleResetGame}
            className="p-2.5 bg-black border-2 border-[#ff007f] shadow-[2.5px_2.5px_0px_#00f0ff] text-[#ff007f] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            title="RESTORE MEMORY BANKS"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Hex Touch Keyboard Gamepad for mobile previews */}
      <div className="flex flex-col items-center gap-1 max-w-[120px] mx-auto pt-2 sm:hidden">
        <button
          onClick={() => changeDirection('UP')}
          className="w-12 h-12 bg-black text-[#00f0ff] font-extrabold border-2 border-[#00f0ff] flex items-center justify-center active:bg-neutral-900 select-none"
        >
          W
        </button>
        <div className="flex gap-1.5">
          <button
            onClick={() => changeDirection('LEFT')}
            className="w-12 h-12 bg-black text-[#00f0ff] font-extrabold border-2 border-[#00f0ff] flex items-center justify-center active:bg-neutral-900 select-none"
          >
            A
          </button>
          <div className="w-12 h-12" />
          <button
            onClick={() => changeDirection('RIGHT')}
            className="w-12 h-12 bg-black text-[#00f0ff] font-extrabold border-2 border-[#00f0ff] flex items-center justify-center active:bg-neutral-900 select-none"
          >
            D
          </button>
        </div>
        <button
          onClick={() => changeDirection('DOWN')}
          className="w-12 h-12 bg-black text-[#00f0ff] font-extrabold border-2 border-[#00f0ff] flex items-center justify-center active:bg-neutral-900 select-none"
        >
          S
        </button>
      </div>
    </div>
  );
}
