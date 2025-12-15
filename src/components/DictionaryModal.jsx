import { useState } from 'react';
import { isValidInput } from '../utils/gameLogic';
import { addCustomWord } from '../utils/dictionary';

export default function DictionaryModal({ onClose, onWordAdded }) {
    const [newWord, setNewWord] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Logic repeated here slightly for specific input feedback but can reuse generic
        if (newWord.length !== 4) {
            setError('Word must be 4 letters');
            return;
        }

        // Check isogram
        if (new Set(newWord.toUpperCase()).size !== 4) {
            setError('Word must be an Isogram (unique letters)');
            return;
        }

        if (!/^[a-zA-Z]+$/.test(newWord)) {
            setError('Only letters allowed');
            return;
        }

        const added = addCustomWord(newWord);
        if (added) {
            setSuccess(`"${newWord.toUpperCase()}" added!`);
            setNewWord('');
            if (onWordAdded) onWordAdded();
            setTimeout(onClose, 1000);
        } else {
            setError('Word already exists in dictionary');
        }
    };

    return (
        <div>
            <p className="text-white/70 mb-4 text-sm leading-relaxed">
                Add a new 4-letter secret word to the game's vocabulary.
                It must have <span className="text-primary-400">unique letters</span>.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    value={newWord}
                    onChange={(e) => {
                        const val = e.target.value.toUpperCase().slice(0, 4);
                        if (/^[A-Z]*$/.test(val)) setNewWord(val);
                    }}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-white focus:outline-none focus:border-primary-500 transition-colors uppercase placeholder:tracking-normal placeholder:text-sm placeholder:font-normal placeholder:text-white/20"
                    placeholder="WORD"
                />

                {error && <p className="text-red-400 text-sm text-center animate-shake">{error}</p>}
                {success && <p className="text-green-400 text-sm text-center font-medium">{success}</p>}

                <button
                    type="submit"
                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-primary-600/20"
                >
                    Add Word
                </button>
            </form>
        </div>
    );
}
