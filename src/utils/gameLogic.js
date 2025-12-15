export const isValidInput = (word) => {
    if (!word) return false;
    // Check length
    if (word.length !== 4) return false;
    // Check only letters
    if (!/^[a-zA-Z]+$/.test(word)) return false;
    // Check isogram (unique chars)
    const uniqueChars = new Set(word.split(''));
    if (uniqueChars.size !== 4) return false;

    return true;
};

export const calculateBullsAndCows = (guess, secret) => {
    const guessUpper = guess.toUpperCase();
    const secretUpper = secret.toUpperCase();

    let bulls = 0;
    let cows = 0;

    for (let i = 0; i < 4; i++) {
        if (guessUpper[i] === secretUpper[i]) {
            bulls++;
        } else if (secretUpper.includes(guessUpper[i])) {
            cows++;
        }
    }

    return { bulls, cows };
};
