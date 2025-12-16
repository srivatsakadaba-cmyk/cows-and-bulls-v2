import { motion } from 'framer-motion';
import { X, Share2, Clock } from 'lucide-react';

export default function StatsModal({ isOpen, onClose, stats, lastGameStats, onPlayAgain, onMenu }) {
    if (!isOpen || !stats) return null;

    const maxFrequency = Math.max(...Object.values(stats.guesses));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Statistics</h2>
                    <button onClick={onClose} className="p-1 text-white/50 hover:text-white transition-colors"><X size={24} /></button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-8">
                    <StatItem label="Played" value={stats.gamesPlayed} />
                    <StatItem label="Win %" value={stats.winPercentage} />
                    <StatItem label="Streak" value={stats.currentStreak} />
                    <StatItem label="Max Streak" value={stats.maxStreak} />
                </div>

                {lastGameStats && (
                    <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/5">
                        <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider flex items-center gap-2">
                            <Clock size={14} /> Last Game
                        </h3>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <div className="text-white/50">Status</div>
                            <div className={`font-bold ${lastGameStats.isWin ? 'text-green-400' : 'text-red-400'}`}>
                                {lastGameStats.isWin ? 'WON' : 'GAVE UP'}
                            </div>

                            <div className="text-white/50">Score</div>
                            <div className="font-bold text-amber-400">{lastGameStats.score ?? '-'} PTS</div>

                            <div className="text-white/50">Time</div>
                            <div className="font-mono text-white">{lastGameStats.timeFormatted}</div>

                            <div className="text-white/50">Avg Time/Guess</div>
                            <div className="font-mono text-white">{lastGameStats.timePerGuess}s</div>
                        </div>

                        {/* Reveal Word on Loss */}
                        {!lastGameStats.isWin && lastGameStats.secretWord && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex flex-col items-center">
                                <span className="text-xs text-red-300 font-bold uppercase mb-1">The Word Was</span>
                                <span className="text-2xl font-black text-white tracking-widest">{lastGameStats.secretWord}</span>
                            </div>
                        )}
                    </div>
                )}

                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-widest">Guess Distribution</h3>
                <div className="flex flex-col gap-2 mb-6">
                    {Object.entries(stats.guesses).map(([key, count]) => {
                        // Fix string comparison bug: Number(key) > 10
                        if (key === 'fail' || (count === 0 && Number(key) > 10)) return null; // Skip empty high numbers
                        const isCurrent = lastGameStats?.guessCount === Number(key) && lastGameStats?.isWin;
                        return (
                            <div key={key} className="flex items-center gap-2">
                                <span className="w-4 text-xs font-mono text-white/50">{key}</span>
                                <div className="flex-1 h-6 bg-white/5 rounded-sm overflow-hidden flex items-center">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(count / maxFrequency) * 100}%` }}
                                        className={`h-full ${isCurrent ? 'bg-green-500' : 'bg-slate-600'} min-w-[1rem] flex items-center justify-end px-1.5`}
                                    >
                                        <span className="text-xs font-bold text-white">{count}</span>
                                    </motion.div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-3 pt-2 border-t border-white/10 mt-6">
                    {onMenu && (
                        <button
                            onClick={onMenu}
                            className="flex-1 py-3 px-4 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white transition-all text-sm uppercase tracking-wide"
                        >
                            Main Menu
                        </button>
                    )}

                    {onPlayAgain && lastGameStats && (
                        <button
                            onClick={onPlayAgain}
                            className="flex-1 py-3 px-4 rounded-xl font-bold bg-primary-600 hover:bg-primary-500 text-white shadow-lg transition-all text-sm uppercase tracking-wide"
                        >
                            Play Again
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

function StatItem({ label, value }) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{value}</span>
            <span className="text-[10px] text-white/50 uppercase text-center mt-1">{label}</span>
        </div>
    );
}
