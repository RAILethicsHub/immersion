/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Track } from './types';
import { DUMMY_TRACKS } from './utils/audio';
import BackgroundGrid from './components/BackgroundGrid';
import AudioVisualizer from './components/AudioVisualizer';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { Terminal, ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeTrack, setActiveTrack] = useState<Track>(DUMMY_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  return (
    <div className="relative min-h-screen text-neutral-100 flex flex-col justify-between font-sans selection:bg-[#ff007f] selection:text-black static-noise">
      {/* Background with CRT Raster and Scanlines */}
      <BackgroundGrid />

      {/* Main Terminal Frame Layout */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col justify-center gap-6">
        
        {/* Machine Headboard Header (Extreme Glitch / High Contrast Cyberpunk) */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 border-b-2 border-dashed border-[#ff007f] pb-5">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 bg-black border-2 border-[#00f0ff] flex items-center justify-center shadow-[3px_3px_0px_#ff007f] transition-all"
            >
              <Terminal size={22} className="text-[#00f0ff] animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-black tracking-widest text-[#00f0ff] glitch-tear" style={{ textShadow: '2px 2px #ff007f' }}>
                SNAKE://SYNTH_CON_0x8
              </h1>
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest leading-none mt-1">
                SYSTEM REGISTER STATUS: OPERATIONAL // MEM: FINE // BITRATE: 12BIT_DAC_L_R
              </p>
            </div>
          </div>

          {/* Active Terminal Bus Node Badge */}
          <div className="flex items-center gap-3 bg-black border-2 border-[#00f0ff] px-4 py-1.5 shadow-[2px_2px_0px_#ff007f] select-none">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff007f] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff007f]" />
            </span>
            <span className="text-[10px] font-mono text-white tracking-widest uppercase">
              MOUNTED: {activeTrack.id}
            </span>
          </div>
        </header>

        {/* Cryptic Manual Overlay Banner */}
        <div className="bg-black border-2 border-[#ff007f] p-4 text-xs text-neutral-400 max-w-4xl mx-auto shadow-[3px_3px_0px_#00f0ff] backdrop-blur-md relative overflow-hidden">
          {/* Neon warning stripe top boundary */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00f0ff] via-[#ff007f] to-[#00f0ff]" />
          
          <div className="flex items-start gap-3 mt-1 font-mono">
            <ShieldAlert size={16} className="text-[#ff007f] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-[#00f0ff]">&gt;&gt; MACHINE_REGISTER:</span> PLAY THE SNAKE MODULE LOCATED IN THE LEFT ARCADE BAY BY FOCUSING KEYS <span className="text-[#ff007f] uppercase font-bold">[ARROW_KEYS / WASD]</span>. USE <span className="text-[#ff007f] uppercase font-bold">[SPACE_BAR]</span> AS VOLTAGE RE-ROUTE PAUSE INTERCEPTOR. AUDIO FREQUENCIES WILL BE AUTOMATICALLY CHANNELIZED OUT FROM THE CORRESPONDING REGISTER STAGES SHOWN AT THE MIXER ON THE RIGHT DESK.
            </div>
          </div>
        </div>

        {/* Binary Panel Split columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-4">
          
          {/* Main Visual Arcade Canvas Col */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center gap-2 px-1">
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#ff007f]">&gt;&gt; BAY_A: ARCADE_MATRIX_UNIT //</span>
            </div>
            
            <SnakeGame 
              activeThemeColor={activeTrack.glowColor} 
              glowColor={activeTrack.glowColor} 
            />
          </div>

          {/* Side Analog Sound Mixer Desktop Panel Col */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 px-1">
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#00f0ff]">&gt;&gt; BAY_B: SIGNAL_SYNTH_MIXER //</span>
            </div>

            {/* Sharp responsive frequency analyzer */}
            <AudioVisualizer 
              glowColor={activeTrack.glowColor} 
              isPlaying={isPlaying} 
            />

            {/* Synthetic music console */}
            <MusicPlayer 
              onTrackChange={setActiveTrack}
              activeTrack={activeTrack}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
            />
          </div>

        </div>

      </main>

      {/* Terminal Line footer */}
      <footer className="relative z-10 border-t-2 border-dashed border-[#ff007f] py-4 text-center text-[10px] font-mono text-neutral-600 tracking-widest mt-8 flex flex-col gap-1 select-none">
        <div>SYS_LOCALE: 0x7E3FF • RETRO-HARDWARE INTEGRATOR V3.23 • NO EXTRA MEMORIES PERSISTED</div>
        <div className="text-[8px] opacity-75 text-[#ff007f]">// WARNING: HIGH VOLTAGE RASTER SCAN //</div>
      </footer>
    </div>
  );
}
