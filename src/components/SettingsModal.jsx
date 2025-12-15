import React from 'react';

export default function SettingsModal({ gameMode, setGameMode, onClose }) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h3 className="text-white font-semibold mb-2 text-lg">Difficulty</h3>
                <p className="text-white/60 text-sm mb-4">
                    Choose how much help you want with tracking guesses.
                </p>

                <div className="flex bg-white/5 p-1 rounded-xl">
                    <button
                        onClick={() => setGameMode('easy')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${gameMode === 'easy'
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'text-white/50 hover:text-white/80'
                            }`}
                    >
                        Easy
                        <span className="block text-[10px] opacity-70 font-normal mt-0.5">Show used letters</span>
                    </button>

                    <button
                        onClick={() => setGameMode('hard')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${gameMode === 'hard'
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'text-white/50 hover:text-white/80'
                            }`}
                    >
                        Hard
                        <span className="block text-[10px] opacity-70 font-normal mt-0.5">No hints</span>
                    </button>
                </div>
            </div>

            <div className="pt-4 border-t border-white/10">
                <button
                    onClick={onClose}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-xl transition-all"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
