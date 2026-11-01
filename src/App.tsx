import React, { useState } from 'react';
import { DateUnlockScreen } from './components/DateUnlockScreen';
import { HeartTreeCanvas } from './components/HeartTreeCanvas';
import { romanticAudio } from './utils/audioSynthesizer';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleUnlock = () => {
    setIsUnlocked(true);
    romanticAudio.start();
  };

  if (!isUnlocked) {
    return <DateUnlockScreen onUnlock={handleUnlock} />;
  }

  return (
    <div className="min-h-screen bg-white text-stone-800 flex flex-col relative selection:bg-rose-500 selection:text-white">
      {/* Main Experience: Árbol de Corazones y Carta Integrada en el Fondo del Canva */}
      <main className="flex-1 flex flex-col">
        <HeartTreeCanvas />
      </main>
    </div>
  );
}
