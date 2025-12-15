import { motion } from 'framer-motion';

export default function GuessRow({ guess, isCurrent, currentGuess, isShake }) {
    // If it's the current guess row, we show what the user is typing
    // If it's a past guess, we show the full word and score

    const word = isCurrent ? currentGuess : (guess ? guess.word : '');
    const bulls = guess?.bulls;
    const cows = guess?.cows;

    // Always show 4 tiles
    const tiles = Array(4).fill(null).map((_, i) => word[i] || '');

    return (
        <motion.div
            className={`relative flex items-center justify-center gap-3 my-3 sm:my-4 ${isShake ? 'animate-shake text-red-400' : ''}`}
            animate={isShake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
            {/* Word Tiles */}
            <div className="flex gap-2 md:gap-3">
                {tiles.map((letter, i) => (
                    <motion.div
                        key={i}
                        initial={false}
                        animate={guess ? { rotateX: 360, transition: { delay: i * 0.1, duration: 0.6, type: "spring" } } : { scale: letter ? 1.05 : 1 }}
                        className={`
              w-12 h-14 sm:w-16 sm:h-20 
              flex items-center justify-center 
              text-2xl sm:text-3xl font-bold rounded-xl border-2
              transition-all duration-200
              ${letter
                                ? 'border-primary-500 bg-primary-500/10 text-white shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]'
                                : 'border-white/10 bg-white/5 text-white/30'}
              ${isCurrent && i === currentGuess.length ? 'border-primary-500/60 ring-2 ring-primary-500/20' : ''} 
            `}
                    >
                        {letter}
                    </motion.div>
                ))}
            </div>

            {/* Score indicators (Only for submitted guesses) */}
            {!isCurrent && guess && (
                <div
                    className="absolute left-[calc(50%+7rem)] sm:left-[calc(50%+9rem)] flex flex-col gap-1.5 min-w-[3.5rem] z-10"
                >
                    <div className="flex items-center justify-between gap-2 bg-green-500/20 px-2 py-1 rounded-md border border-green-500/30 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-green-400 tracking-wider">Bull</span>
                        <span className="text-sm font-bold text-white">{bulls}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 bg-yellow-500/20 px-2 py-1 rounded-md border border-yellow-500/30 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider">Cow</span>
                        <span className="text-sm font-bold text-white">{cows}</span>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
