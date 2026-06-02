import React, { useEffect, useRef } from 'react';
import { synthEngine } from '../utils/audio';

interface AudioVisualizerProps {
  glowColor?: string;
  isPlaying: boolean;
}

export default function AudioVisualizer({ glowColor = '#ff007f', isPlaying }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = synthEngine.getAnalyser();
    const bufferLength = analyser ? analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth ? canvas.parentElement.clientWidth * 2 : 600;
      canvas.height = 100;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Audio animation frame drawer
    const renderVisuals = () => {
      animationRef.current = requestAnimationFrame(renderVisuals);

      const width = canvas.width;
      const height = canvas.height;

      // Darker, harsher screen draw to show CRT pixels
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Draw faint background matrix
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Harsh pixelated idle frequency wave
        const t = Date.now() * 0.009;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.max(
            5,
            Math.floor((Math.sin(i * 0.45 + t) * 40 + Math.cos(i * 0.82 - t * 1.2) * 20 + 60))
          );
        }
      }

      const barCount = 18;
      const spacing = 10;
      const totalSpacing = (barCount - 1) * spacing;
      const barWidth = Math.floor((width - totalSpacing) / barCount);

      for (let i = 0; i < barCount; i++) {
        const freqIndex = Math.floor((i / barCount) * bufferLength * 0.75);
        let amplitude = dataArray[freqIndex] || 0;

        // Custom step factor to simulate pixel-block steps
        const stepSize = 10;
        const rawHeight = (amplitude / 255) * height * 1.1;
        const barHeight = Math.max(stepSize, Math.floor(rawHeight / stepSize) * stepSize);

        const x = i * (barWidth + spacing);
        const y = height - barHeight;

        // Draw RGB splitting dual colors! (Jarring Cyan / Magenta split shadow)
        ctx.fillStyle = 'rgba(255, 0, 127, 0.45)'; // Magenta secondary
        ctx.fillRect(x - 3, y, barWidth, barHeight);

        ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';  // Cyan primary
        ctx.fillRect(x + 2, y, barWidth, barHeight);

        // Core overlay
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, barWidth, Math.min(barHeight, 4));

        // Draw dotted indicator blocks
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        for (let yy = y; yy < height; yy += stepSize) {
          ctx.beginPath();
          ctx.moveTo(x, yy);
          ctx.lineTo(x + barWidth, yy);
          ctx.stroke();
        }
      }

      // Random lightning glitch line on heavy bass beats
      if (isPlaying && Math.random() < 0.03) {
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, Math.random() * height);
        ctx.lineTo(width, Math.random() * height);
        ctx.stroke();
      }
    };

    renderVisuals();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [glowColor, isPlaying]);

  return (
    <div className="w-full h-24 bg-black border border-dashed border-[#ff007f] p-1 overflow-hidden relative" style={{ boxShadow: 'inset 0 0 10px rgba(255,0,127,0.4)' }}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
