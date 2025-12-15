import { motion } from 'framer-motion';

export default function GuessRow({ guess, isCurrent, currentGuess, isShake, wordLength = 4 }) {
    if (guess) console.log("GuessRow Data:", guess); // Debug log

    const word = isCurrent ? currentGuess : (guess ? guess.word : '');
    const bulls = guess?.bulls || 0;
    const cows = guess?.cows || 0;
    const bullStars = guess?.bullStars || 0; // Note: App.jsx might be passing 'isBullStar' boolean, need to check how I mapped it?
    // Wait! In App.jsx Step 337, I saved: { word, bulls, cows, isBullStar, isCowStar }
    // BUT here I am reading `bullStars` and `cowStars`.
    // AND I am checking `guess.isBullStar` in the JSX in the PREVIOUS Step 340.
    // So the data is there as BOOLEAN `isBullStar` and `isCowStar`.
    // The counts are `bulls` and `cows`.

    // My previous JSX logic was:
    // {guess.isBullStar ? 'Bull ★' : 'Bull'} 
    // And count was {bulls}.

    // This looks correct data-wise.
    // Proceeding with INLINE rendering.

    // Generate tiles based on wordLenght
    const tiles = Array(wordLength).fill(null).map((_, i) => word[i] || '');

    return (
        <motion.div
            className={`flex items-center justify-center my-2 sm:my-3 w-full px-4 ${isShake ? 'animate-shake text-red-400' : ''}`}
            animate={isShake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
            {/* Main Container for Tiles + Score */}
            <div className="flex items-center gap-3 sm:gap-4">

                {/* Word Tiles */}
                <div className="flex gap-1.5 sm:gap-2">
                    {tiles.map((letter, i) => (
                        <motion.div
                            key={i}
                            initial={false}
                            animate={guess ? { rotateX: 360, transition: { delay: i * 0.1, duration: 0.6, type: "spring" } } : { scale: letter ? 1.05 : 1 }}
                            className={`
                  w-10 h-12 sm:w-14 sm:h-16 md:w-16 md:h-20
                  flex items-center justify-center 
                  text-xl sm:text-2xl md:text-3xl font-bold rounded-lg sm:rounded-xl border-2
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

                {/* Score indicators (Static Layout - No Absolute) */}
                <div className="flex flex-col justify-center gap-2 min-w-[70px] sm:min-w-[90px] font-bold">
                    {!isCurrent && guess && (
                        <>
                            {/* Bull Badge */}
                            {(bulls > 0 || guess.isBullStar) && (
                                <div className={`
                                    flex items-center px-1.5 py-1 rounded-md border w-full justify-between
                                    ${guess.isBullStar
                                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                                        : 'bg-green-500/20 border-green-500/40 text-green-400'}
                                `}>
                                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold mr-1">
                                        {guess.isBullStar ? 'BULL★' : 'BULL'}
                                    </span>
                                    <span className="text-xs sm:text-sm text-white">{bulls}</span>
                                </div>
                            )}

                            {/* Cow Badge */}
                            {(cows > 0 || guess.isCowStar) && (
                                <div className={`
                                    flex items-center px-1.5 py-1 rounded-md border w-full justify-between
                                    ${guess.isCowStar
                                        ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                                        : 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500'}
                                `}>
                                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold mr-1">
                                        {guess.isCowStar ? 'COW★' : 'COW'}
                                    </span>
                                    <span className="text-xs sm:text-sm text-white">{cows}</span>
                                </div>
                            )}

                            {/* Fallback for 0-0 */}
                            {bulls === 0 && cows === 0 && !guess.isBullStar && !guess.isCowStar && (
                                <div className="flex items-center px-1.5 py-1 rounded-md border bg-slate-700/50 border-white/10 text-slate-400 w-full justify-center">
                                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold">MISS</span>
                                </div>
                            )}
                        </>
                    )}
                    {/* Spacer to prevent layout shift when typing?? 
                         No, we only show badges for past guesses. 
                         For current guess, this div is empty, so tiles centered?
                         Actually, if this div collapses, tiles shift center. 
                         If we want perfect alignment, we can keep width. 
                         But typically standard games allow shift. 
                         Let's keep it collapsing for current guess to keep focus on typing.
                     */}
                </div>
            </div>
        </motion.div>
    );
}
