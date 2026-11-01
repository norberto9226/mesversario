import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Sliders, Sparkles, Disc } from 'lucide-react';
import { romanticAudio, SongInfo } from '../utils/audioSynthesizer';

interface AudioPlayerControlProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export const AudioPlayerControl: React.FC<AudioPlayerControlProps> = ({ isPlaying, onToggle }) => {
  const [volume, setVolume] = useState(romanticAudio.getVolume());
  const [currentSong, setCurrentSong] = useState<SongInfo>(romanticAudio.getCurrentSong());
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const unsubscribe = romanticAudio.onSongChange((song) => {
      setCurrentSong(song);
    });
    return unsubscribe;
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    romanticAudio.setVolume(val);
  };

  const handleSelectSong = (songId: string) => {
    romanticAudio.setSong(songId);
    if (!isPlaying) {
      onToggle();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Expanded Controls Popover */}
      {showPanel && (
        <div className="mb-3 p-4 w-72 rounded-2xl bg-[#1b0826]/95 backdrop-blur-xl border border-rose-400/30 shadow-2xl text-white animate-fade-in font-sans text-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-rose-400/20">
            <span className="font-serif-title font-semibold text-rose-200 flex items-center gap-1.5">
              <Music className="w-4 h-4 text-rose-400" />
              <span>Música de Fondo</span>
            </span>
            <span className="text-[10px] text-rose-300/60 uppercase">En vivo</span>
          </div>

          {/* Volume slider */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-rose-200/80">
              <span className="flex items-center gap-1">
                {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>Volumen</span>
              </span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-rose-500 bg-black/40 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Song Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-rose-300/80 font-medium">Melodía romántica:</label>
            <div className="flex flex-col gap-1.5">
              {romanticAudio.songs.map((s) => {
                const isActive = currentSong.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSong(s.id)}
                    className={`p-2 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                        : 'bg-black/30 hover:bg-black/50 text-rose-200/80 hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="text-[11px] font-medium leading-tight">{s.title}</p>
                      <p className="text-[9px] text-rose-200/70">{s.subtitle}</p>
                    </div>
                    {isActive && <Sparkles className="w-3.5 h-3.5 text-amber-200 shrink-0 ml-1.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main floating pill */}
      <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md p-1.5 rounded-full border border-rose-400/30 shadow-xl shadow-rose-950/50">
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-3 py-2 rounded-full font-medium text-xs transition-all duration-300 cursor-pointer ${
            isPlaying
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/30'
              : 'bg-white/10 text-rose-200 hover:bg-white/20'
          }`}
          title={isPlaying ? 'Pausar música romántica' : 'Reproducir música romántica'}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 shrink-0" />
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-full bg-white animate-pulse" />
                <span className="w-0.5 h-2 bg-white animate-bounce" />
                <span className="w-0.5 h-3 bg-white animate-pulse delay-75" />
                <span className="w-0.5 h-1.5 bg-white animate-bounce delay-150" />
              </div>
              <span className="hidden sm:inline">Música de Amor</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Poner Música</span>
            </>
          )}
        </button>

        <button
          onClick={() => setShowPanel(!showPanel)}
          className="p-2 rounded-full hover:bg-white/10 text-rose-300 hover:text-white transition-colors cursor-pointer"
          title="Ajustar audio"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
