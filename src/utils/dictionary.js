// A starting dictionary of 4-letter isograms
const DEFAULT_WORDS = [
    "WORD", "GAME", "PLAY", "TIME", "LIFE", "LOVE", "HOPE", "BLUE",
    "PINK", "STAR", "MOON", "FISH", "BIRD", "LION", "WOLF", "ZERO",
    "FIVE", "FOUR", "NINE", "JUNE", "JULY", "WORK", "WALK", "TALK",
    "READ", "SING", "SONG", "KING", "RING", "WING", "WIND", "RAIN",
    "SNOW", "COLD", "WARM", "FIRE", "EARL", "PEAR", "BEAR", "TEAR",
    "WEAR", "GEAR", "HEAR", "NEAR", "FEAR", "DEAR", "YEAR", "LAKE",
    "POND", "DUCK", "FROG", "GOAT", "BOAT", "COAT", "ROAD", "TOAD"
];

// Helper to filter valid isograms just in case
const filterIsograms = (words) => {
    return words.filter(w => {
        if (!w) return false;
        const s = new Set(w.toUpperCase().split(''));
        return w.length === 4 && s.size === 4;
    });
};

const STORAGE_KEY = 'cows-bulls-custom-dictionary';

export const getDictionary = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const customWords = stored ? JSON.parse(stored) : [];
    // Combine defaults and custom (uniqueing them is good practice but we'll assume distinct additions for now)
    const combined = [...new Set([...filterIsograms(DEFAULT_WORDS), ...customWords])];
    return combined;
};

export const addCustomWord = (word) => {
    const upperWord = word.toUpperCase();
    const existing = getDictionary();

    if (existing.includes(upperWord)) return false; // Duplicate

    const stored = localStorage.getItem(STORAGE_KEY);
    const customWords = stored ? JSON.parse(stored) : [];

    customWords.push(upperWord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customWords));
    return true;
};

export const getRandomWord = () => {
    const dict = getDictionary();
    return dict[Math.floor(Math.random() * dict.length)];
};
