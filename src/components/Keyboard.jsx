import { Delete } from 'lucide-react';

const KEYBOARD_ROWS = [
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ZXCVBNM"
];

export default function Keyboard({ onChar, onDelete, onEnter, usedLetters, gameMode, difficulty }) {
    return (
        <div className="w-full max-w-2xl mx-auto p-2 pb-safe-area-bottom">
            <div className="flex flex-col gap-2">
                {KEYBOARD_ROWS.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-1.5 touch-manipulation">
                        {/* Logic to handle layout shift for Z row */}
                        {rowIndex === 2 && (
                            <button
                                onClick={onEnter}
                                className="flex-1 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-bold rounded-lg h-12 md:h-14 text-xs tracking-wider shadow-lg transition-all active:scale-95 flex items-center justify-center max-w-[4rem]"
                            >
                                ENTER
                            </button>
                        )}

                        {row.split('').map((char) => {
                            const status = usedLetters[char]; // 'absent' | undefined
                            let bgColor = 'bg-white/10 hover:bg-white/20 active:bg-white/25';

                            // Only apply visual "gray out" if difficulty is EASY
                            if (status === 'absent' && difficulty === 'easy') {
                                bgColor = 'bg-slate-800/80 text-white/20 border border-white/5';
                            }

                            return (
                                <button
                                    key={char}
                                    onClick={() => onChar(char)}
                                    className={`
                    ${bgColor} 
                    text-white font-medium rounded-lg 
                    h-12 md:h-14 w-8 md:w-11 text-lg transition-all active:scale-95
                    shadow-md select-none
                  `}
                                >
                                    {char}
                                </button>
                            );
                        })}

                        {rowIndex === 2 && (
                            <button
                                onClick={onDelete}
                                className="flex-1 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white/80 rounded-lg h-12 md:h-14 flex items-center justify-center max-w-[4rem] transition-all active:scale-95"
                            >
                                <Delete size={20} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
