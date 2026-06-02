import React, { useState, useEffect } from 'react';
import { Track } from '../types';
import { synthEngine, DUMMY_TRACKS } from '../utils/audio';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';

interface MusicPlayerProps {
  onTrackChange: (track: Track) => void;
  activeTrack: Track;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
}

export default function MusicPlayer({ onTrackChange, activeTrack, isPlaying, setIsPlaying }: MusicPlayerProps) {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.3);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    synthEngine.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      synthEngine.play(activeTrack, (sec) => {
        setElapsedTime(sec);
      });
    } else {
      synthEngine.pause();
    }
  }, [activeTrack, isPlaying]);

  useEffect(() => {
    return () => {
      synthEngine.stop();
    };
  }, []);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipNext = () => {
    const currentIndex = DUMMY_TRACKS.findIndex(t => t.id === activeTrack.id);
    const nextIndex = (currentIndex + 1) % DUMMY_TRACKS.length;
    onTrackChange(DUMMY_TRACKS[nextIndex]);
    setElapsedTime(0);
    setIsPlaying(true);
  };

  const handleSkipPrev = () => {
    const currentIndex = DUMMY_TRACKS.findIndex(t => t.id === activeTrack.id);
    const prevIndex = (currentIndex - 1 + DUMMY_TRACKS.length) % DUMMY_TRACKS.length;
    onTrackChange(DUMMY_TRACKS[prevIndex]);
    setElapsedTime(0);
    setIsPlaying(true);
  };

  const handleSelectTrack = (track: Track) => {
    onTrackChange(track);
    setElapsedTime(0);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col gap-6 bg-black border-2 border-[#00f0ff] p-5 shadow-[5px_5px_0px_#ff007f] relative" id="music-player">
      
      {/* Vinyl/Tape Deck Glitched Graphic Container */}
      <div className="relative flex items-center justify-center h-44 bg-[#050505] overflow-hidden border border-[#ff007f] crt-screen">
        <div className="absolute inset-0 bg-transparent" />
        
        {/* Jagged circular ring */}
        <div 
          className={`absolute w-36 h-36 rounded-full border-2 border-[#ff007f] border-double transition-all ${
            isPlaying ? 'rotate-fast' : 'opacity-40'
          }`}
          style={{
            borderColor: activeTrack.glowColor,
            boxShadow: isPlaying ? `0 0 15px ${activeTrack.glowColor}, inset 0 0 15px ${activeTrack.glowColor}` : 'none',
          }}
        />

        {/* Center label */}
        <div 
          className="relative w-20 h-20 rounded-full bg-black border-4 border-black flex items-center justify-center"
          style={{
            borderColor: activeTrack.glowColor,
          }}
        >
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
            }}
          >
            {isPlaying ? 'RUN' : 'STBY'}
          </div>
        </div>

        {/* Binary Static Indicator blocks */}
        <div className="absolute top-2 left-3 text-[9px] font-mono text-[#00f0ff] uppercase tracking-widest">
          VOLTAGE: {activeTrack.bpm}HZ • BUS: ONLINE
        </div>
      </div>

      {/* Track Title and Information Blocks */}
      <div className="text-left font-mono">
        <div className="text-[10px] uppercase font-black text-black bg-[#ff007f] px-1.5 py-0.5 inline-block select-none leading-none mb-2">
          {activeTrack.genre}
        </div>
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">{activeTrack.title}</h3>
        <p className="text-xs text-[#00f0ff] mt-0.5">&gt;&gt; BY: {activeTrack.artist}</p>
        <div className="text-[10px] text-neutral-500 mt-2 p-2 bg-[#040404] border border-neutral-900 leading-relaxed font-mono">
          {activeTrack.description}
        </div>
      </div>

      {/* Timeline tracker */}
      <div className="font-mono">
        <div className="relative w-full h-2 bg-neutral-950 border border-neutral-800">
          <div 
            className="h-full bg-[#00f0ff]"
            style={{
              width: `${(elapsedTime / activeTrack.duration) * 100}%`,
              backgroundColor: activeTrack.glowColor,
              boxShadow: `0 0 8px ${activeTrack.glowColor}`
            }}
          />
        </div>
        <div className="flex justify-between items-center text-[9px] text-[#ff007f] mt-1.5 font-bold">
          <span>{formatTime(elapsedTime)}</span>
          <span className="text-neutral-500 animate-pulse">// BUFFER_SYNCED //</span>
          <span>{formatTime(activeTrack.duration)}</span>
        </div>
      </div>

      {/* Glitched controls layout */}
      <div className="flex items-center justify-between gap-4 font-mono">
        <button
          onClick={handleSkipPrev}
          className="flex-1 py-2 px-3 bg-black border-2 border-[#00f0ff] text-[#00f0ff] text-xs font-bold shadow-[2px_2px_0px_#ff007f] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
          title="PREVIOUS SYSTEM CHANNEL"
        >
          <SkipBack size={12} />
          <span>PREV</span>
        </button>

        <button
          onClick={handleTogglePlay}
          className="flex-1 py-3 px-3 bg-black border-2 border-[#ff007f] text-[#ff007f] text-xs font-bold shadow-[2px_2px_0px_#00f0ff] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
          title="CYCLE COGNITION STATE"
        >
          {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </button>

        <button
          onClick={handleSkipNext}
          className="flex-1 py-2 px-3 bg-black border-2 border-[#00f0ff] text-[#00f0ff] text-xs font-bold shadow-[2px_2px_0px_#ff007f] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
          title="NEXT SYSTEM CHANNEL"
        >
          <span>NEXT</span>
          <SkipForward size={12} />
        </button>
      </div>

      {/* Detuned raw volume gate */}
      <div className="flex items-center gap-3 bg-[#050505] p-2.5 border border-dashed border-[#ff007f] font-mono">
        <Volume2 size={14} className="text-neutral-500" />
        <input
          type="range"
          min="0.001"
          max="0.8"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1 h-1.5 bg-neutral-900 border border-neutral-800 rounded-none appearance-none cursor-pointer"
          style={{
            accentColor: activeTrack.glowColor
          }}
        />
        <span className="text-[9px] text-[#ff007f] font-bold w-10 text-right">
          {Math.round((volume / 0.8) * 100)}%
        </span>
      </div>

      {/* Track listing selector index */}
      <div className="border-t border-neutral-900 pt-4 flex flex-col gap-2 font-mono">
        <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">STAGE_DEVICES_MOUNTED:</span>
        {DUMMY_TRACKS.map((t, idx) => {
          const isSelected = activeTrack.id === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleSelectTrack(t)}
              className={`w-full text-left p-2 border-2 transition-all flex items-center justify-between group ${
                isSelected
                  ? 'bg-black border-[#ff007f] text-[#ff007f] shadow-[3px_3px_0px_#00f0ff]'
                  : 'bg-transparent border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-neutral-950/45'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <span className={isSelected ? 'text-[#00f0ff] font-bold' : 'text-neutral-600'}>
                  [{String(idx + 1).padStart(2, '0')}]
                </span>
                <div className="truncate text-left">
                  <div className={`text-xs font-bold uppercase tracking-wider truncate ${isSelected ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
                    {t.title}
                  </div>
                  <div className="text-[9px] text-neutral-500 uppercase">{t.artist}</div>
                </div>
              </div>
              <span className="text-[10px] font-bold shrink-0">
                {formatTime(t.duration)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
