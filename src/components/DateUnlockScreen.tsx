import React, { useState } from 'react';
import { Heart, KeyRound, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { romanticAudio } from '../utils/audioSynthesizer';
import couplePhoto from '../assets/images/romantic_couple_photo_1793403470148.jpg';

interface DateUnlockScreenProps {
  onUnlock: () => void;
}

export const DateUnlockScreen: React.FC<DateUnlockScreenProps> = ({ onUnlock }) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const triggerHeartConfetti = () => {
    // Canvas confetti with heart and romantic colors
    const colors = ['#f43f5e', '#fb7185', '#fda4af', '#f472b6', '#ec4899', '#ffd700'];

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors,
      shapes: ['circle'],
      scalar: 1.2
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      });
    }, 200);
  };

  const handleValidate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanDay = day.trim().padStart(2, '0');
    const cleanMonth = month.trim().padStart(2, '0');
    const cleanYear = year.trim();

    const isDayCorrect = cleanDay === '03' || cleanDay === '3';
    const isMonthCorrect = cleanMonth === '10';
    const isYearCorrect = cleanYear === '2026';

    if (isDayCorrect && isMonthCorrect && isYearCorrect) {
      setIsSuccess(true);
      setErrorMessage('');
      romanticAudio.playChime();
      romanticAudio.start();
      triggerHeartConfetti();

      setTimeout(() => {
        onUnlock();
      }, 1400);
    } else {
      setIsShaking(true);
      setErrorMessage('Esa no es la fecha exacta, mi amor... Intenta recordar el día de nuestro compromiso 💕');
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-[#12061b] via-[#240b28] to-[#0c0414]">
      {/* Ambient background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Floating mini hearts in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute text-rose-500/20 animate-float"
            style={{
              top: `${(i * 19) % 95}%`,
              left: `${(i * 23) % 92}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${3.5 + (i % 4)}s`,
              transform: `scale(${0.6 + (i % 3) * 0.3})`
            }}
          >
            ♥
          </div>
        ))}
      </div>

      {/* Card container */}
      <div
        className={`relative z-10 w-full max-w-md p-6 sm:p-8 md:p-10 rounded-3xl backdrop-blur-xl bg-white/[0.04] border border-rose-300/20 shadow-2xl shadow-rose-950/40 text-center transition-transform duration-300 ${
          isShaking ? 'translate-x-[-10px] animate-bounce' : ''
        } ${isSuccess ? 'scale-105 border-rose-400/50 shadow-rose-500/30' : ''}`}
      >
        {/* Glowing badge icon with couple photo */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 p-[3px] shadow-lg shadow-rose-500/40 animate-pulse-glow">
            <div className="w-full h-full rounded-full bg-[#1e0a26] flex items-center justify-center overflow-hidden">
              <img
                src={couplePhoto}
                alt="Foto de pareja"
                className="w-full h-full object-cover rounded-full select-none"
              />
            </div>
          </div>
        </div>

        {/* Header Text */}
        <div className="mb-6">
          <p className="text-xs sm:text-sm text-rose-200/80 leading-relaxed font-sans max-w-xs mx-auto">
            Para celebrar nuestro primer mes juntos, ingresa la fecha exacta de nuestro compromiso:
          </p>
        </div>

        {/* Date Input Form */}
        <form onSubmit={handleValidate} className="space-y-6">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
            {/* Day */}
            <div className="flex flex-col items-center">
              <label className="text-[10px] sm:text-[11px] text-rose-300/70 uppercase tracking-widest font-medium mb-1">
                Día
              </label>
              <input
                type="text"
                maxLength={2}
                placeholder="03"
                value={day}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setDay(val);
                  if (val.length === 2) {
                    const next = document.getElementById('input-month');
                    next?.focus();
                  }
                }}
                className="w-14 h-13 sm:w-16 sm:h-14 md:w-20 md:h-16 text-center text-lg sm:text-xl md:text-2xl font-bold font-serif-title text-white bg-black/40 border border-rose-400/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300 transition-all placeholder:text-white/20 shadow-inner"
              />
            </div>

            <span className="text-xl sm:text-2xl text-rose-400/60 font-light mt-4 sm:mt-5">/</span>

            {/* Month */}
            <div className="flex flex-col items-center">
              <label className="text-[10px] sm:text-[11px] text-rose-300/70 uppercase tracking-widest font-medium mb-1">
                Mes
              </label>
              <input
                id="input-month"
                type="text"
                maxLength={2}
                placeholder="10"
                value={month}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setMonth(val);
                  if (val.length === 2) {
                    const next = document.getElementById('input-year');
                    next?.focus();
                  }
                }}
                className="w-14 h-13 sm:w-16 sm:h-14 md:w-20 md:h-16 text-center text-lg sm:text-xl md:text-2xl font-bold font-serif-title text-white bg-black/40 border border-rose-400/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300 transition-all placeholder:text-white/20 shadow-inner"
              />
            </div>

            <span className="text-xl sm:text-2xl text-rose-400/60 font-light mt-4 sm:mt-5">/</span>

            {/* Year */}
            <div className="flex flex-col items-center">
              <label className="text-[10px] sm:text-[11px] text-rose-300/70 uppercase tracking-widest font-medium mb-1">
                Año
              </label>
              <input
                id="input-year"
                type="text"
                maxLength={4}
                placeholder="2026"
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))}
                className="w-18 h-13 sm:w-20 sm:h-14 md:w-24 md:h-16 text-center text-lg sm:text-xl md:text-2xl font-bold font-serif-title text-white bg-black/40 border border-rose-400/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300 transition-all placeholder:text-white/20 shadow-inner"
              />
            </div>
          </div>

          {/* Feedback message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-fade-in flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSuccess}
            className="w-full group relative py-3.5 px-6 rounded-2xl font-medium text-white shadow-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 shadow-rose-600/30 border border-rose-400/40"
          >
            <span className="flex items-center justify-center gap-2 text-base font-serif-title tracking-wider">
              <KeyRound className="w-4 h-4 group-hover:rotate-45 transition-transform" />
              <span>Desbloquear Nuestro Mes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
