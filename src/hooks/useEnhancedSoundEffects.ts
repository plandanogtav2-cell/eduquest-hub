import { useCallback } from 'react';

interface SoundEffects {
  correct: string;
  incorrect: string;
  success: string;
  click: string;
  pickup: string;
  drop: string;
  reveal: string;
  hint: string;
  timeup: string;
  reset: string;
}

const useSoundEffects = () => {
  // Web Audio API sound generation
  const createTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }, []);

  const createChord = useCallback((frequencies: number[], duration: number, type: OscillatorType = 'sine', volume: number = 0.05) => {
    frequencies.forEach(freq => createTone(freq, duration, type, volume));
  }, [createTone]);

  const playSound = useCallback((soundType: keyof SoundEffects) => {
    switch (soundType) {
      case 'correct':
        // Happy ascending chord
        createChord([523.25, 659.25, 783.99], 0.5, 'sine', 0.1);
        break;
      
      case 'success':
        // Victory fanfare
        setTimeout(() => createTone(523.25, 0.2, 'sine', 0.1), 0);
        setTimeout(() => createTone(659.25, 0.2, 'sine', 0.1), 100);
        setTimeout(() => createTone(783.99, 0.2, 'sine', 0.1), 200);
        setTimeout(() => createChord([523.25, 659.25, 783.99, 1046.50], 0.6, 'sine', 0.12), 300);
        break;
      
      case 'incorrect':
        // Descending disappointed sound
        createTone(400, 0.3, 'sawtooth', 0.08);
        setTimeout(() => createTone(300, 0.4, 'sawtooth', 0.08), 150);
        break;
      
      case 'click':
        // Short click
        createTone(800, 0.1, 'square', 0.05);
        break;
      
      case 'pickup':
        // Rising pickup sound
        createTone(400, 0.15, 'sine', 0.06);
        setTimeout(() => createTone(600, 0.1, 'sine', 0.06), 50);
        break;
      
      case 'drop':
        // Dropping sound
        createTone(600, 0.1, 'sine', 0.06);
        setTimeout(() => createTone(400, 0.15, 'sine', 0.06), 50);
        break;
      
      case 'reveal':
        // Mystery reveal sound
        createTone(220, 0.1, 'sine', 0.05);
        setTimeout(() => createTone(330, 0.1, 'sine', 0.05), 100);
        setTimeout(() => createTone(440, 0.2, 'sine', 0.07), 200);
        break;
      
      case 'hint':
        // Helpful hint chime
        createChord([523.25, 783.99], 0.3, 'sine', 0.06);
        break;
      
      case 'timeup':
        // Urgent time's up sound
        for (let i = 0; i < 3; i++) {
          setTimeout(() => createTone(880, 0.2, 'square', 0.1), i * 250);
        }
        break;
      
      case 'reset':
        // Gentle reset sound
        createTone(440, 0.2, 'sine', 0.05);
        setTimeout(() => createTone(330, 0.2, 'sine', 0.05), 100);
        break;
      
      default:
        createTone(440, 0.1, 'sine', 0.05);
    }
  }, [createTone, createChord]);

  return { playSound };
};

export default useSoundEffects;