import { GAME_MODES } from './constants';

// 4-letter isograms
const WORDS_4_ISO = [
    "WORD", "GAME", "PLAY", "TIME", "LIFE", "LOVE", "HOPE", "BLUE",
    "PINK", "STAR", "MOON", "FISH", "BIRD", "LION", "WOLF", "ZERO",
    "FIVE", "FOUR", "NINE", "JUNE", "JULY", "WORK", "WALK", "TALK",
    "READ", "SING", "SONG", "KING", "RING", "WING", "WIND", "RAIN",
    "SNOW", "COLD", "WARM", "FIRE", "EARL", "PEAR", "BEAR", "TEAR",
    "WEAR", "GEAR", "HEAR", "NEAR", "FEAR", "DEAR", "YEAR", "LAKE",
    "POND", "DUCK", "FROG", "GOAT", "BOAT", "COAT", "ROAD", "TOAD"
];

// 5-letter isograms
const WORDS_5_ISO = [
    "TABLE", "CHAIR", "PLANT", "EARTH", "WATER", "SPACE", "GHOST",
    "STORM", "POWER", "MAGIC", "DREAM", "LIGHT", "BREAK", "BLOCK",
    "BRICK", "TRACK", "TRUCK", "TRAIN", "PLANE", "SHIRT", "SKIRT",
    "PANTS", "SHOES", "SOCKS", "WATCH", "CLOCK", "PHONE", "MOUSE",
    "FRUIT", "GRAPE", "MELON", "LEMON", "PEACH", "BREAD", "TOAST",
    "PIZZA", "PASTA", "SALAD", "STEAK", "LUNCH", "DINNER", "SNACK",
    "MONEY", "PRICE", "VALUE", "POINT", "SCORE", "LEVEL", "STAGE"
];

// 5-letter repeats (Isograms are also valid technically in Master mode, but we want to feature repeats)
const WORDS_5_MASTER = [
    "APPLE", "BERRY", "SHEEP", "QUEEN", "MAMMA", "PUPPY", "BUBBA",
    "TITHE", "EAGLE", "VIVID", "ROBOT", "SPOON", "FLOOR", "GLASS",
    "GRASS", "CLASS", "SHELL", "SMALL", "SMELL", "SPELL", "STILL",
    "WHERE", "THERE", "EVERY", "NEVER", "SEVEN", "THREE", "GREEN",
    "HAPPY", "SORRY", "FUNNY", "SUNNY", "CARRY", "MARRY", "HURRY",
    "DADDY", "MOMMY", "NANNY", "POPPY", "JELLY", "HOLLY", "BELLY"
];


const STORAGE_KEY = 'cows-bulls-custom-dictionary';

export const getDictionary = (mode = GAME_MODES.CLASSIC) => {
    let baseList = [];
    if (mode === GAME_MODES.CLASSIC) baseList = WORDS_4_ISO;
    else if (mode === GAME_MODES.CHALLENGE) baseList = WORDS_5_ISO;
    else if (mode === GAME_MODES.MASTER) baseList = [...WORDS_5_ISO, ...WORDS_5_MASTER];

    const stored = localStorage.getItem(STORAGE_KEY);
    let customWords = [];
    try {
        customWords = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to parse custom dictionary, resetting.', error);
        customWords = [];
    }

    // Filter custom words based on mode 
    // (This is a simplified check. A robust app would enforce length/isogram on add)
    const validCustom = customWords.filter(w => {
        const len = (mode === GAME_MODES.CLASSIC) ? 4 : 5;
        return w.length === len;
    });

    return [...new Set([...baseList, ...validCustom])];
};

export const addCustomWord = (word) => {
    const upperWord = word.toUpperCase();
    // In a real app we might validate 'word' against all modes or store with metadata
    // For now we just store it raw

    const stored = localStorage.getItem(STORAGE_KEY);
    let customWords = [];
    try {
        customWords = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to parse custom dictionary, resetting.', error);
        customWords = [];
    }

    if (customWords.includes(upperWord)) return false;

    customWords.push(upperWord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customWords));
    return true;
};

export const getRandomWord = (mode = GAME_MODES.CLASSIC) => {
    const dict = getDictionary(mode);
    return dict[Math.floor(Math.random() * dict.length)];
};

export const validateWordOnline = async (word) => {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!response.ok) return false;
        const data = await response.json();
        return Array.isArray(data) && data.length > 0;
    } catch (error) {
        console.error("Dictionary API Error:", error);
        // Fallback: If API fails (offline), we can't verify, so we default to false (strict) 
        // or true (lenient). Sticking to false for safety.
        return false;
    }
};
