import { VALID_GUESSES_4, VALID_GUESSES_5 } from './validGuesses';
import { getDictionary } from './dictionary'; // Checking internal dictionary too
import { GAME_MODES } from './constants';
export { GAME_MODES }; // Re-export for compatibility

export const isValidInput = (word, mode = GAME_MODES.CLASSIC, skipDictionary = false) => {
    if (!word) return false;

    const len = mode === GAME_MODES.CLASSIC ? 4 : 5;
    if (word.length !== len) return false;

    // Check only letters
    if (!/^[a-zA-Z]+$/.test(word)) return false;

    const upperWord = word.toUpperCase();
    const uniqueChars = new Set(upperWord.split(''));

    // 1. DICTIONARY CHECK (New)
    // We check against our large "Valid Guesses" list AND the internal dictionary.
    // If a word is in the internal dictionary (like specific answers), it's definitely valid.
    if (!skipDictionary) {
        const validList = (len === 4) ? VALID_GUESSES_4 : VALID_GUESSES_5;
        const internalDict = getDictionary(mode);

        // We can assume internalDict words are valid.
        const isKnownWord = validList.includes(upperWord) || internalDict.includes(upperWord);

        if (!isKnownWord) {
            // We return a special error string?
            // For now, the consumer expects boolean.
            // We can throw or just return false.
            // Ideally we should return a reason.
            // But to keep signature simple, we return false.
            // Wait, the consumer (App.jsx) gives specific toasts based on unique checks.
            // It blindly says "Invalid characters" or "Unique letters".
            // It needs to know if it's a Dictionary error.
            // I will attach a property to the boolean? No.
            // I'll make this return a complex object or handle it in App.jsx.
            // Let's stick to boolean here and let App.jsx handle the "Why failed" if we can't change signature easily.
            // Actually, I can change the signature or use a separate function.
            // Let's modify App.jsx to use a separate check or assume "False + Correct Format" = "Not in Dictionary".
            return false;
        }
    }


    // 2. CONSTRAINT CHECK
    // Master mode allows repeats, others must be isograms
    if (mode === GAME_MODES.MASTER) {
        // Validation: 
        // 1. Max 2 occurrences per letter
        // 2. Only ONE letter can be repeated (appear > 1 time)

        const counts = {};
        let repeatingCharCount = 0; // Usage of "repeating letter"

        for (const char of upperWord) {
            counts[char] = (counts[char] || 0) + 1;
        }

        for (const char in counts) {
            if (counts[char] > 2) return false; // Rule 1: Max 2 of same letter
            if (counts[char] > 1) {
                repeatingCharCount++;
            }
        }

        if (repeatingCharCount > 1) return false; // Rule 2: Only 1 letter typically repeats
        // Wait, did the user want EXACTLY 1 repeat? Or "Only 1 letter can appear more than once"?
        // "Only 1 letter can appear more than once" implies <= 1 repeating letter. 
        // So Isograms are technically valid too (0 letters repeating). 
        // I will assume Isograms are valid unless we specifically want to force repeats.

        return true;
    } else {
        // Isogram check
        return uniqueChars.size === len;
    }
};

export const calculateBullsAndCows = (guess, secret) => {
    const guessUpper = guess.toUpperCase();
    const secretUpper = secret.toUpperCase();
    const n = guessUpper.length;

    let bulls = 0;
    let cows = 0;
    let bullStarActive = false;
    let cowStarActive = false;

    const secretCounts = {}; // Original frequencies

    // 1. Map Secret Frequencies
    for (const char of secretUpper) {
        secretCounts[char] = (secretCounts[char] || 0) + 1;
    }

    // Clone for decrementing available counts
    const secretRemaining = { ...secretCounts };
    const isBull = new Array(n).fill(false);

    // 2. Identify Bulls & Check Bull Star Flag
    for (let i = 0; i < n; i++) {
        if (guessUpper[i] === secretUpper[i]) {
            bulls++;
            isBull[i] = true;

            // Check Star: If secretFreq > 1, set flag
            if (secretCounts[guessUpper[i]] > 1) {
                bullStarActive = true;
            }

            // Decrement available count
            secretRemaining[guessUpper[i]]--;
        }
    }

    // 3. Identify Cows & Check Cow Star Flag
    for (let i = 0; i < n; i++) {
        if (!isBull[i]) {
            const char = guessUpper[i];
            if (secretRemaining[char] > 0) {
                cows++;

                // Check Star: If secretFreq > 1, set flag
                if (secretCounts[char] > 1) {
                    cowStarActive = true;
                }

                secretRemaining[char]--;
            }
        }
    }

    return { bulls, cows, isBullStar: bullStarActive, isCowStar: cowStarActive };
};
