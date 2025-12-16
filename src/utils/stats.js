const STATS_KEY = 'cows-bulls-stats';

const DEFAULT_STATS = {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guesses: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0 }, // Distribution
    winPercentage: 0,
};

// Helper to get key for mode
const getStatsKey = (mode) => `${STATS_KEY}-${mode}`;

export const getStats = (mode = 'classic') => {
    const key = getStatsKey(mode);
    const stored = localStorage.getItem(key);
    try {
        return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(DEFAULT_STATS));
    } catch (error) {
        console.error('Failed to parse stats from local storage, resetting.', error);
        return JSON.parse(JSON.stringify(DEFAULT_STATS));
    }
};

export const updateStats = (isWin, guessCount, mode = 'classic') => {
    const stats = getStats(mode);

    stats.gamesPlayed += 1;

    if (isWin) {
        stats.gamesWon += 1;
        stats.currentStreak += 1;
        stats.maxStreak = Math.max(stats.currentStreak, stats.maxStreak);

        const key = guessCount > 20 ? '20+' : guessCount;
        stats.guesses[key] = (stats.guesses[key] || 0) + 1;
    } else {
        stats.currentStreak = 0;
        stats.guesses['fail'] = (stats.guesses['fail'] || 0) + 1;
    }

    stats.winPercentage = Math.round((stats.gamesWon / stats.gamesPlayed) * 100);

    const key = getStatsKey(mode);
    localStorage.setItem(key, JSON.stringify(stats));
    return stats;
};
