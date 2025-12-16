import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

import Header from './components/Header';
import GameBoard from './components/GameBoard';
import Keyboard from './components/Keyboard';
import Modal from './components/Modal';
import DictionaryModal from './components/DictionaryModal';
import SettingsModal from './components/SettingsModal';
import StatsModal from './components/StatsModal';
import { getRandomWord, validateWordOnline, addCustomWord } from './utils/dictionary';
import { calculateBullsAndCows, isValidInput } from './utils/gameLogic';
import { GAME_MODES } from './utils/constants';
import { getStats, updateStats } from './utils/stats';

import { Play, Trophy, Clock, Star, AlertCircle, ArrowLeft, Settings, BarChart2, Flag, CircleHelp } from 'lucide-react';
import InteractiveParticleTypography from './components/InteractiveParticleTypography';
import TutorialModal from './components/TutorialModal';
import AnimatedShaderBackground from './components/ui/AnimatedShaderBackground';
import { ContainerScroll } from './components/ui/ContainerScrollAnimation';

// Simple Tooltip Component
const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex items-center justify-center p-0 m-0"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onTouchStart={() => setShow(true)} // Handle mobile touch
      onTouchEnd={() => setTimeout(() => setShow(false), 1500)} // Auto hide after tap
    >
      {children}
      {show && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap px-3 py-1.5 bg-black/90 border border-white/20 text-white text-xs rounded-lg shadow-xl animate-fade-in pointer-events-none">
          {text}
          {/* Arrow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-b-black/90" />
        </div>
      )}
    </div>
  );
};

export default function App() {
  console.log("App component rendering...");
  const [secret, setSecret] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');

  // Game State
  const [gameStatus, setGameStatus] = useState('menu'); // menu, playing, won, lost
  const [gameMode, setGameMode] = useState(GAME_MODES.CLASSIC);
  const [difficulty, setDifficulty] = useState('easy'); // 'easy' | 'hard'
  const [isValidating, setIsValidating] = useState(false); // New state for loading spinner
  const [score, setScore] = useState(1000);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const [isShake, setIsShake] = useState(false);
  const [isDictOpen, setIsDictOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [usedLetters, setUsedLetters] = useState({});

  // Memo/Scratchpad State
  const [isMemoMode, setIsMemoMode] = useState(false);
  const [memoLetters, setMemoLetters] = useState({}); // { 'A': true, ... }

  // Tutorial State
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState(getStats(gameMode)); // Initialize with default mode or current? constant is fine
  const [lastGameStats, setLastGameStats] = useState(null);

  // Effect to update stats state when mode changes (so UI shows correct stats on load if we wanted, 
  // but currently StatsModal pulls from props. We should sync this)
  useEffect(() => {
    setStats(getStats(gameMode));
  }, [gameMode]);

  const timerRef = useRef(null);

  // --- Timer Logic ---
  useEffect(() => {
    if (gameStatus === 'playing') {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
        setScore(prev => Math.max(0, prev - 2)); // -2 points per second
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameStatus]);

  // First Visit Check
  useEffect(() => {
    const visited = localStorage.getItem('cows-bulls-visited');
    if (!visited) {
      setTimeout(() => setIsTutorialOpen(true), 1000);
      localStorage.setItem('cows-bulls-visited', 'true');
    }
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const startNewGame = (mode = gameMode) => {
    const word = getRandomWord(mode);
    console.log("Debug Secret:", word);

    setGameMode(mode);
    setSecret(word || 'GAME');
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setUsedLetters({});
    setToastMsg('');
    setScore(1000);
    setTimerSeconds(0);
  };

  const handleReturnToMenu = () => {
    setGameStatus('menu');
  };

  const handleGameEnd = (isWin, guessCount) => {
    const timeFormatted = formatTime(timerSeconds);
    const finalScore = score;
    const timePerGuess = guessCount > 0 ? (timerSeconds / guessCount).toFixed(1) : '0.0';

    const newStats = updateStats(isWin, guessCount, gameMode);
    setStats(newStats);
    setLastGameStats({
      isWin,
      guessCount,
      timeFormatted,
      timePerGuess,
      timePerGuess,
      score: finalScore,
      secretWord: secret
    });

    setTimeout(() => setIsStatsOpen(true), 1500);
  };

  const handleReveal = () => {
    if (gameStatus !== 'playing') return;
    showToast(`The word was: ${secret}`);
    setGameStatus('lost');
    setCurrentGuess(secret);
    handleGameEnd(false, guesses.length);
  };

  const handleChar = useCallback((char) => {
    if (gameStatus !== 'playing') return;
    const maxLen = (gameMode === GAME_MODES.CLASSIC) ? 4 : 5;

    if (currentGuess.length < maxLen) {
      setCurrentGuess(prev => prev + char);
    }
  }, [gameStatus, currentGuess, gameMode]);

  // Handle Memo Toggle
  const handleMemoToggle = useCallback((char) => {
    setMemoLetters(prev => {
      const next = { ...prev };
      if (next[char]) delete next[char];
      else next[char] = true;
      return next;
    });
  }, []);

  // Update physical keyboard to respect memo mode? 
  // Probably best to keep physical keyboard as ALWAYS typing for simplicity,
  // OR allow physical keyboard to trigger memo if mode is ON.
  // Let's allow physical keys to respect the mode switch.

  const handleDelete = useCallback(() => {
    if (gameStatus !== 'playing') return;
    setCurrentGuess(prev => prev.slice(0, -1));
  }, [gameStatus]);

  const handleEnter = useCallback(async () => {
    if (gameStatus !== 'playing') return;
    if (isValidating) return; // Prevent double submit

    // 0. Duplicate Check
    const isDuplicate = guesses.some(g => g.word === currentGuess);
    if (isDuplicate) {
      setIsShake(true);
      showToast("You already guessed that");
      setTimeout(() => setIsShake(false), 500);
      return;
    }

    const maxLen = (gameMode === GAME_MODES.CLASSIC) ? 4 : 5;

    // Length check
    if (currentGuess.length !== maxLen) {
      setIsShake(true);
      showToast(`Word must be ${maxLen} letters`);
      setTimeout(() => setIsShake(false), 500);
      return;
    }

    // 1. Sync Format Check (Skip Dictionary Check here)
    // This checks for things like repeats in classic mode, or invalid characters.
    if (!isValidInput(currentGuess, gameMode, true)) {
      // Failed formating (e.g. repeats in classic mode)
      const upper = currentGuess.toUpperCase();
      const maxRepeatsStrict = (gameMode === GAME_MODES.MASTER);
      const isogramRequired = !maxRepeatsStrict;

      const counts = {};
      let maxCount = 0;
      for (const char of upper) {
        counts[char] = (counts[char] || 0) + 1;
        maxCount = Math.max(maxCount, counts[char]);
      }

      if (isogramRequired && maxCount > 1) {
        showToast("Words must have unique letters");
      } else if (maxRepeatsStrict && maxCount > 2) {
        showToast("Invalid: Max 2 of same letter");
      } else {
        showToast("Invalid characters");
      }

      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
      return;
    }

    // 2. Sync Dictionary Check (Is it in our known lists?)
    let isvalidWord = isValidInput(currentGuess, gameMode, false); // Check WITH dictionary

    // 3. If Not in Local Dictionary -> Check Online
    if (!isvalidWord) {
      setIsValidating(true); // Start loading state
      const isOnlineValid = await validateWordOnline(currentGuess);
      setIsValidating(false);

      if (isOnlineValid) {
        // It is valid! Add to our local dictionary so we know it next time
        addCustomWord(currentGuess);
        isvalidWord = true;
        showToast("Word Found Online! Added to Dictionary.");
      } else {
        // Truly invalid
        showToast("Not in word list");
        setIsShake(true);
        setTimeout(() => setIsShake(false), 500);
        return;
      }
    }

    // Proceed with game logic since it passed all checks
    // Helper for bulls/cows
    console.log('Comparing:', currentGuess, 'against Secret:', secret);
    const { bulls, cows, isBullStar, isCowStar } = calculateBullsAndCows(currentGuess, secret);

    const newGuess = { word: currentGuess, bulls, cows, isBullStar, isCowStar };
    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);

    // Score Updates: -50 per guess
    // Score Updates: -50 per guess
    const newScore = Math.max(0, score - 50);
    setScore(newScore);

    // Game Over Logic (Loss by Score)
    if (newScore <= 0 && bulls !== maxLen) {
      setGameStatus('lost');
      showToast(`Game Over! The word was ${secret}`);
      handleGameEnd(false, newGuesses.length);
      // Important: we still show the result of this guess
    }

    // Update Used Letters logic
    // We update this regardless of difficulty state here, 
    // but the Keyboard component decides whether to SHOW it based on difficulty prop.
    // Update Used Letters logic
    const secretUpper = secret.toUpperCase();

    setUsedLetters(prev => {
      const next = { ...prev };

      // Simplified Logic: For ALL modes, only gray out letters if the ENTIRE guess is a bust (0 Bulls, 0 Cows)
      if (bulls === 0 && cows === 0) {
        currentGuess.split('').forEach(c => {
          next[c] = 'absent';
        });
      }

      return next;
    });

    setCurrentGuess('');

    if (bulls === maxLen) {
      setGameStatus('won');
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#fbbf24']
      });
      showToast(`🎉 ${maxLen} BULLS! 🎉`);
      handleGameEnd(true, newGuesses.length);
    }
  }, [gameStatus, currentGuess, secret, guesses, gameMode, isValidating]);

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toUpperCase();
      // Allow 'ENTER' (uppercase from prev line), 'Enter' (raw), or keyCode 13 for physical return keys
      if (key === 'ENTER' || e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        handleEnter();
      }
      else if (key === 'BACKSPACE') {
        e.preventDefault();
        handleDelete();
      }
      else if (/^[A-Z]$/.test(key)) {
        if (isMemoMode) {
          handleMemoToggle(key);
        } else {
          handleChar(key);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleEnter, handleDelete, handleChar, isMemoMode, handleMemoToggle]);

  // --- Render Helpers ---

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getModeName = (m) => {
    switch (m) {
      case GAME_MODES.CLASSIC: return "Classic (4-Letter)";
      case GAME_MODES.CHALLENGE: return "Challenge (5-Letter)";
      case GAME_MODES.MASTER: return "Master (Repeats)";
      default: return "";
    }
  };

  // --- Views ---

  // NOTE: Removed bg-gradient-to-br to let ThreeJS background show through
  const renderHome = () => (
    <div className="flex flex-col items-center justify-start min-h-[100dvh] w-full text-white overflow-y-auto relative z-10 no-scrollbar">

      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl md:text-8xl font-bold text-white mb-4 tracking-tighter">
              COWS <span className="text-white/40">&</span> BULLS
            </h1>
            <p className="text-white/60 text-lg md:text-xl font-medium mb-8">
              The Ultimate Strategy Word Game
            </p>
          </>
        }
      >
        {/* Content Inside the 3D Card */}
        <div className="flex flex-col items-center justify-center h-full w-full bg-slate-900/50 backdrop-blur-sm p-4 md:p-8">
          <h3 className="text-white/50 text-sm font-bold uppercase tracking-widest mb-6">Select Game Mode</h3>

          <div className="grid gap-4 w-full max-w-md">
            {/* Mode A */}
            <button
              onClick={() => startNewGame(GAME_MODES.CLASSIC)}
              className="group relative overflow-hidden p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-[1.02] text-left"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Star size={40} />
              </div>
              <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">Classic</h3>
              <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-white/60">
                <span className="px-1.5 py-0.5 rounded bg-white/10">4 LETTERS</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10">NO REPEATS</span>
              </div>
            </button>

            {/* Mode B */}
            <button
              onClick={() => startNewGame(GAME_MODES.CHALLENGE)}
              className="group relative overflow-hidden p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-[1.02] text-left"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy size={40} />
              </div>
              <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">Challenge</h3>
              <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-white/60">
                <span className="px-1.5 py-0.5 rounded bg-white/10">5 LETTERS</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10">NO REPEATS</span>
              </div>
            </button>

            {/* Mode C */}
            <button
              onClick={() => startNewGame(GAME_MODES.MASTER)}
              className="group relative overflow-hidden p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-[1.02] text-left"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-500">Master</h3>
              <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-white/60">
                <span className="px-1.5 py-0.5 rounded bg-white/10">5 LETTERS</span>
                <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-200">REPEATS ALLOWED</span>
              </div>
            </button>
          </div>

          <div className="mt-8 flex gap-4">
            <Tooltip text="Manage Dictionary">
              <button onClick={() => setIsDictOpen(true)} className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1">Dictionary</button>
            </Tooltip>
            <Tooltip text="View Stats">
              <button onClick={() => setIsStatsOpen(true)} className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1">Stats</button>
            </Tooltip>
            <Tooltip text="Settings">
              <button onClick={() => setIsSettingsOpen(true)} className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1">Settings</button>
            </Tooltip>
          </div>
        </div>
      </ContainerScroll>

    </div>
  );

  const renderGame = () => (
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      {/* Custom Header for Game */}
      <header className="flex flex-col gap-2 px-4 py-3 bg-white/5 border-b border-white/5 shadow-md z-20 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <Tooltip text="Go Home">
            <button onClick={handleReturnToMenu} className="p-3 -ml-2 rounded-full hover:bg-white/10 text-white/70 transition-colors">
              <ArrowLeft size={24} />
            </button>
          </Tooltip>

          <h2 className="text-sm font-bold tracking-wider text-white/90 uppercase">{getModeName(gameMode)}</h2>

          <div className="flex items-center">
            <Tooltip text="Settings">
              <button onClick={() => setIsSettingsOpen(true)} className="p-1.5 rounded-full hover:bg-white/10 text-white/70 transition-colors">
                <Settings size={20} />
              </button>
            </Tooltip>

            {/* Surrender Button - More Obvious */}
            <Tooltip text="Give Up / Show Word">
              <button
                onClick={handleReveal}
                className="flex items-center gap-1.5 px-3 py-1.5 ml-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-all active:scale-95"
              >
                <Flag size={16} />
                <span className="text-xs font-bold uppercase hidden sm:inline">Give Up</span>
              </button>
            </Tooltip>

            <Tooltip text="How to Play">
              <button onClick={() => setIsTutorialOpen(true)} className="p-1.5 rounded-full hover:bg-white/10 text-white/70 transition-colors">
                <CircleHelp size={20} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Score Bar */}
        <div className="flex items-center justify-between bg-black/20 rounded-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary-400" />
            <span className="font-mono text-sm font-bold text-white">{formatTime(timerSeconds)}</span>
          </div>
          <div className="flex items-center gap-2">
            {isValidating && <div className="animate-spin h-3 w-3 border-2 border-primary-500 border-t-transparent rounded-full mr-2"></div>}
            <span className="font-mono text-sm font-bold text-white tracking-widest">{score}</span>
            <span className="text-xs uppercase text-white/40 font-bold">PTS</span>
          </div>
        </div>
      </header>

      <GameBoard
        guesses={guesses}
        currentGuess={currentGuess}
        isShake={isShake}
        gameStatus={gameStatus}
        wordLength={(gameMode === GAME_MODES.CLASSIC) ? 4 : 5}
      />

      <Keyboard
        onChar={handleChar}
        onDelete={handleDelete}
        onEnter={handleEnter}
        usedLetters={usedLetters}
        gameMode={gameMode}
        difficulty={difficulty}
        isMemoMode={isMemoMode}
        setIsMemoMode={setIsMemoMode}
        memoLetters={memoLetters}
        onMemoToggle={handleMemoToggle}
      />
    </div>
  );

  return (
    <>
      <AnimatedShaderBackground />

      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${toastMsg ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}`}>
        <div className="bg-slate-800/90 text-white px-6 py-3 rounded-full shadow-2xl border border-white/10 backdrop-blur-md font-medium text-sm sm:text-base flex items-center gap-2">
          <span>⚠️</span> {toastMsg}
        </div>
      </div>

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
          gameMode={difficulty} // We reuse the prop name 'gameMode' in SettingsModal for now to avoid editing SettingsModal too much or we match it
          setGameMode={setDifficulty} // This wires Difficulty state to the UI toggles
          onClose={() => setIsSettingsOpen(false)}
        />
      </Modal>

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        lastGameStats={lastGameStats}
        onPlayAgain={() => {
          setIsStatsOpen(false);
          startNewGame(gameMode);
        }}
        onMenu={() => {
          setIsStatsOpen(false);
          handleReturnToMenu();
        }}
      />

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        gameMode={gameMode}
      />

      {gameStatus === 'menu' ? renderHome() : renderGame()}
    </>
  );
}
