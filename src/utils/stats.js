const STATS_KEY = 'cows-bulls-stats';

const DEFAULT_STATS = {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guesses: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0 }, // Distribution
    winPercentage: 0,
};

export const getStats = () => {
    const stored = localStorage.getItem(STATS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_STATS;
};

export const updateStats = (isWin, guessCount) => {
    const stats = getStats();

    stats.gamesPlayed += 1;

    if (isWin) {
        stats.gamesWon += 1;
        stats.currentStreak += 1;
        stats.maxStreak = Math.max(stats.currentStreak, stats.maxStreak);

        // Cap guess count for distribution key if it exceeds common expectations? 
        // We'll just store exact or 'fail' if lost (though this function is called with guessCount)
        const key = guessCount > 20 ? '20+' : guessCount;
        stats.guesses[key] = (stats.guesses[key] || 0) + 1;
    } else {
        stats.currentStreak = 0;
        stats.guesses['fail'] = (stats.guesses['fail'] || 0) + 1;
    }

    stats.winPercentage = Math.round((stats.gamesWon / stats.gamesPlayed) * 100);

    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    return stats;
};
