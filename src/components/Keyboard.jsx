import { Delete, Pencil } from 'lucide-react';

const KEYBOARD_ROWS = [
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ZXCVBNM"
];

export default function Keyboard({
    onChar,
    onDelete,
    onEnter,
    usedLetters,
    gameMode,
    difficulty,
    isMemoMode,
    setIsMemoMode,
    memoLetters,
    onMemoToggle
}) {
    return (
        <div className="w-full max-w-2xl mx-auto p-2 pb-safe-area-bottom">
            {/* Memo Tool Bar */}
            <div className="flex justify-end mb-2 px-2">
                <button
                    onClick={() => setIsMemoMode(!isMemoMode)}
                    className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all
                    ${isMemoMode
                            ? 'bg-amber-400 text-black border-amber-400'
                            : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'}
                  `}
                >
                    <Pencil size={14} />
                    {isMemoMode ? "Memo On" : "Memo Off"}
                </button>
            </div>

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
                            const isMemoed = memoLetters[char];

                            let bgColor = 'bg-white/10 hover:bg-white/20 active:bg-white/25';
                            let textColor = 'text-white';
                            let decoration = '';
                            let opacity = '';

                            // Only apply visual "gray out" from logic if difficulty is EASY
                            if (status === 'absent' && difficulty === 'easy') {
                                bgColor = 'bg-slate-800/80 border border-white/5';
                                textColor = 'text-white/20';
                            }

                            // Memo Override styling
                            if (isMemoed) {
                                decoration = 'line-through decoration-2 decoration-red-500/80';
                                opacity = 'opacity-50';
                                if (status !== 'absent') textColor = 'text-white/50';
                            }

                            return (
                                <button
                                    key={char}
                                    onClick={() => {
                                        if (isMemoMode) {
                                            onMemoToggle(char);
                                        } else {
                                            onChar(char);
                                        }
                                    }}
                                    className={`
                    ${bgColor} ${textColor} ${decoration} ${opacity}
                    font-medium rounded-lg 
                    h-12 md:h-14 w-8 md:w-11 text-lg transition-all active:scale-95
                    shadow-md select-none relative
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
