import { useCallback } from 'react';

// Simple sound effects using Web Audio API
const useSoundEffects = () => {
  const playSound = useCallback((type: 'correct' | 'incorrect' | 'click' | 'complete' | 'start') => {
    // Check if sound effects are enabled (you can connect this to settings later)
    const soundEnabled = localStorage.getItem('soundEffects') !== 'false';
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const createTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    switch (type) {
      case 'correct':
        // Happy ascending chord
        createTone(523.25, 0.2); // C5
        setTimeout(() => createTone(659.25, 0.2), 100); // E5
        setTimeout(() => createTone(783.99, 0.3), 200); // G5
        break;
        
      case 'incorrect':
        // Sad descending tone
        createTone(349.23, 0.3, 'sawtooth'); // F4
        setTimeout(() => createTone(293.66, 0.4, 'sawtooth'), 150); // D4
        break;
        
      case 'click':
        // Short click sound
        createTone(800, 0.1, 'square');
        break;
        
      case 'complete':
        // Victory fanfare
        createTone(523.25, 0.2); // C5
        setTimeout(() => createTone(659.25, 0.2), 100); // E5
        setTimeout(() => createTone(783.99, 0.2), 200); // G5
        setTimeout(() => createTone(1046.50, 0.4), 300); // C6
        break;
        
      case 'start':
        // Start sound
        createTone(440, 0.2); // A4
        setTimeout(() => createTone(554.37, 0.3), 100); // C#5
        break;
    }
  }, []);

  return { playSound };
};

export default useSoundEffects;