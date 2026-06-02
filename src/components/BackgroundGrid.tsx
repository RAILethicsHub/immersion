import React from 'react';

export default function BackgroundGrid() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-black static-noise crt-screen">
      {/* Glitched chromatic lens overlays */}
      <div 
        className="absolute inset-0 opacity-20" 
        style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(0, 240, 255, 0.25) 0%, rgba(255, 0, 127, 0) 50%), radial-gradient(circle at 80% 80%, rgba(255, 0, 127, 0.2) 0%, rgba(0, 0, 0, 0) 60%)'
        }}
      />
      
      {/* Laser Cyan Diagonal Scan lines block */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #00f0ff 25%, transparent 25%), 
            linear-gradient(-45deg, #00f0ff 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #00f0ff 75%), 
            linear-gradient(-45deg, transparent 75%, #00f0ff 75%)
          `,
          backgroundSize: '120px 120px',
          backgroundPosition: '0 0',
          animation: 'bg-raster-slide 20s linear infinite'
        }}
      />

      {/* Cybernetic Grid matrix lines */}
      <div 
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ff007f 1px, transparent 1px),
            linear-gradient(to bottom, #00f0ff 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />

      {/* Extreme sweeping screen horizontal bars (simulating vintage TV v-sync line tearing) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="w-full h-8 bg-gradient-to-b from-transparent via-[#00f0ff] to-transparent absolute top-0 animate-[horizontal-tear_6s_linear_infinite]" />
        <div className="w-full h-12 bg-gradient-to-b from-transparent via-[#ff007f] to-transparent absolute top-0 animate-[horizontal-tear_9s_linear_infinite_2.5s]" />
      </div>

      {/* CRT raster horizontal screen overlay */}
      <div className="absolute inset-0 crt-overlay" />

      {/* Style blocks for keyframe overrides */}
      <style>{`
        @keyframes bg-raster-slide {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 240px 240px;
          }
        }
        @keyframes horizontal-tear {
          0% {
            transform: translateY(-100px);
          }
          100% {
            transform: translateY(100vh);
          }
        }
      `}</style>
    </div>
  );
}
