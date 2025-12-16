import { useEffect, useRef } from 'react';
import GuessRow from './GuessRow';

export default function GameBoard({ guesses, currentGuess, isShake, gameStatus, wordLength = 4 }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [guesses, currentGuess]);

    return (
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 w-full max-w-lg mx-auto py-2">
            <div className="flex flex-col min-h-full justify-center pb-4">
                {/* Helper text for empty state */}
                {guesses.length === 0 && gameStatus === 'playing' && (
                    <div className="flex flex-col items-center justify-center opacity-20 text-center pointer-events-none mb-8">
                        <p className="text-4xl mb-2">🐮 🐮</p>
                        <p className="text-sm font-medium uppercase tracking-widest">Start Guessing</p>
                    </div>
                )}

                {guesses.map((g, i) => (
                    <GuessRow key={i} guess={g} wordLength={wordLength} />
                ))}

                {gameStatus === 'playing' && (
                    <GuessRow
                        isCurrent={true}
                        currentGuess={currentGuess}
                        isShake={isShake}
                        wordLength={wordLength}
                    />
                )}

                {/* Spacer for auto-scroll */}
                <div ref={bottomRef} className="h-2" />
            </div>
        </div>
    );
}
