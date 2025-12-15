import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

import Header from './components/Header';
import GameBoard from './components/GameBoard';
import Keyboard from './components/Keyboard';
import Modal from './components/Modal';
import DictionaryModal from './components/DictionaryModal';
import SettingsModal from './components/SettingsModal';
import StatsModal from './components/StatsModal'; // Import
import { getRandomWord, getDictionary } from './utils/dictionary';
import { calculateBullsAndCows, isValidInput } from './utils/gameLogic';
import { getStats, updateStats } from './utils/stats'; // Import

export default function App() {
  const [secret, setSecret] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
  const [isShake, setIsShake] = useState(false);
  const [isDictOpen, setIsDictOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false); // New
  const [gameMode, setGameMode] = useState(() => localStorage.getItem('gameMode') || 'easy');
  const [toastMsg, setToastMsg] = useState('');
  const [usedLetters, setUsedLetters] = useState({}); // { char: 'absent' }

  // Stats & Timer
  const [stats, setStats] = useState(getStats());
  const [lastGameStats, setLastGameStats] = useState(null);
  const startTimeRef = useRef(Date.now());

  // Sound effects (optional but adds polish - simple placeholders for now)

  useEffect(() => {
    localStorage.setItem('gameMode', gameMode);
  }, [gameMode]);

  useEffect(() => {
    startNewGame();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const startNewGame = () => {
    const word = getRandomWord();
    // Pre-load logic if dict is empty logic handled in util
    console.log("Debug Secret:", word);
    setSecret(word || 'GAME'); // Fallback
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setUsedLetters({});
    setToastMsg('');
    startTimeRef.current = Date.now(); // Reset timer
  };

  const handleGameEnd = (isWin, guessCount) => {
    const endTime = Date.now();
    const durationSec = Math.floor((endTime - startTimeRef.current) / 1000);
    const minutes = Math.floor(durationSec / 60);
    const seconds = durationSec % 60;
    const timeFormatted = `${minutes}m ${seconds}s`;

    // Avoid division by zero
    const timePerGuess = guessCount > 0 ? (durationSec / guessCount).toFixed(1) : '0.0';

    const newStats = updateStats(isWin, guessCount);
    setStats(newStats);
    setLastGameStats({
      isWin,
      guessCount,
      timeFormatted,
      timePerGuess
    });

    // Delay modal slightly for effect
    setTimeout(() => setIsStatsOpen(true), 1500);
  };

  const handleReveal = () => {
    if (gameStatus !== 'playing') return;
    showToast(`The word was: ${secret}`);
    setGameStatus('lost');
    // Optionally fill the input or show it visually
    setCurrentGuess(secret);

    // Count this as a loss
    handleGameEnd(false, guesses.length);
  };

  const handleChar = useCallback((char) => {
    if (gameStatus !== 'playing') return;
    if (currentGuess.length < 4) {
      setCurrentGuess(prev => prev + char);
    }
  }, [gameStatus, currentGuess]);

  const handleDelete = useCallback(() => {
    if (gameStatus !== 'playing') return;
    setCurrentGuess(prev => prev.slice(0, -1));
  }, [gameStatus]);

  const handleEnter = useCallback(() => {
    if (gameStatus !== 'playing') return;

    // Length check
    if (currentGuess.length !== 4) {
      setIsShake(true);
      showToast("Word must be 4 letters");
      setTimeout(() => setIsShake(false), 500);
      return;
    }

    // Isogram check & Validity
    if (!isValidInput(currentGuess)) {
      // Determine specific error message
      const unique = new Set(currentGuess).size;
      if (unique !== 4) showToast("Words must have unique letters");
      else showToast("Invalid characters");

      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
      return;
    }

    const { bulls, cows } = calculateBullsAndCows(currentGuess, secret);

    const newGuess = { word: currentGuess, bulls, cows };
    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);

    // Elimination Logic: If 0 Bulls AND 0 Cows, these letters are likely safe to remove
    if (bulls === 0 && cows === 0) {
      setUsedLetters(prev => {
        const next = { ...prev };
        currentGuess.split('').forEach(c => next[c] = 'absent');
        return next;
      });
    }

    setCurrentGuess('');

    if (bulls === 4) {
      setGameStatus('won');
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#fbbf24']
      });
      showToast("🎉 You Found It! 🎉");

      // Handle Stats
      handleGameEnd(true, newGuesses.length);
    }
  }, [gameStatus, currentGuess, secret, guesses]); // Added guesses to dependency

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toUpperCase();
      if (key === 'ENTER') {
        e.preventDefault();
        handleEnter();
      }
      else if (key === 'BACKSPACE') {
        e.preventDefault();
        handleDelete();
      }
      else if (/^[A-Z]$/.test(key)) {
        handleChar(key);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleEnter, handleDelete, handleChar]);

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      {/* Toast Overlay */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${toastMsg ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}`}>
        <div className="bg-slate-800/90 text-white px-6 py-3 rounded-full shadow-2xl border border-white/10 backdrop-blur-md font-medium text-sm sm:text-base flex items-center gap-2">
          <span>⚠️</span> {toastMsg}
        </div>
      </div>

      <Header
        onReset={startNewGame}
        onOpenDictionary={() => setIsDictOpen(true)}
        onReveal={handleReveal}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      <GameBoard
        guesses={guesses}
        currentGuess={currentGuess}
        isShake={isShake}
        gameStatus={gameStatus}
      />

      <Keyboard
        onChar={handleChar}
        onDelete={handleDelete}
        onEnter={handleEnter}
        usedLetters={usedLetters}
        gameMode={gameMode}
      />

      <Modal
        isOpen={isDictOpen}
        onClose={() => setIsDictOpen(false)}
        title="Add to Dictionary"
      >
        <DictionaryModal
          onClose={() => setIsDictOpen(false)}
          onWordAdded={() => {
            showToast("Word added to local dictionary");
          }}
        />
      </Modal>

      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Settings"
      >
        <SettingsModal
          gameMode={gameMode}
          setGameMode={setGameMode}
          onClose={() => setIsSettingsOpen(false)}
        />
      </Modal>

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        lastGameStats={lastGameStats}
      />
    </div>
  );
}
