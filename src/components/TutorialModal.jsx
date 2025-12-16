import { X, Star, AlertCircle, Trophy } from 'lucide-react';

export default function TutorialModal({ isOpen, onClose, gameMode }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">🎓</span> How to Play
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/50 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 text-white/80 overflow-y-auto max-h-[60vh]">

                    <div className="space-y-2">
                        <h3 className="text-white font-bold text-lg">Goal</h3>
                        <p>Guess the hidden secret word. Use the clues to deduce the answer.</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-white font-bold text-lg">Clues</h3>

                        <div className="flex items-start gap-3 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                            <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">BULL</div>
                            <div>
                                <strong className="text-green-400 block">Correct Letter, Correct Spot</strong>
                                <span className="text-sm">Current letter is in the word and in the right position.</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                            <div className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">COW</div>
                            <div>
                                <strong className="text-yellow-400 block">Correct Letter, Wrong Spot</strong>
                                <span className="text-sm">Current letter is in the word but in a different position.</span>
                            </div>
                        </div>
                    </div>

                    {gameMode === 'master' && (
                        <div className="space-y-2 border-t border-white/10 pt-4">
                            <div className="flex items-center gap-2 text-red-400 font-bold">
                                <AlertCircle size={18} /> Master Mode Rules
                            </div>
                            <ul className="list-disc list-inside text-sm text-white/80 space-y-1">
                                <li>Words are <b>5 letters</b> long.</li>
                                <li><b>Repeats allowed:</b> A letter can appear max <b>2 times</b>.</li>
                                <li>Only <b>one letter</b> in the word can be repeated (e.g. APPLE is ok, but SEEDS is not).</li>
                            </ul>
                            <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20 text-sm mt-2">
                                <strong className="text-purple-400 flex items-center gap-1"><Star size={14} fill="currentColor" /> The Star Rule:</strong>
                                If you see a <b>BULL★</b> or <b>COW★</b>, it means that letter is the one that appears <b>twice</b>!
                            </div>
                        </div>
                    )}

                    {gameMode !== 'master' && (
                        <div className="space-y-2 border-t border-white/10 pt-4">
                            <p className="text-sm text-white/50 italic">
                                In this mode, all letters are unique. No repeats!
                            </p>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-white/5">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all active:scale-95"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
}
