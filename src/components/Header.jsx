import { RefreshCw, BookOpen, Eye, Settings, BarChart2 } from 'lucide-react';

export default function Header({ onReset, onOpenDictionary, onReveal, onOpenSettings, onOpenStats }) {
    return (
        <header className="flex items-center justify-between px-6 py-4 backdrop-blur-md bg-white/5 sticky top-0 z-20 border-b border-white/5 shadow-lg">
            <h1 className="text-xl font-bold tracking-wider text-white">
                COWS <span className="text-primary-500">&</span> BULLS
            </h1>
            <div className="flex gap-2">
                <button
                    onClick={onReveal}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                    title="Give Up / Reveal Word"
                >
                    <Eye size={20} />
                </button>
                <button
                    onClick={onOpenDictionary}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                    title="Add to Dictionary"
                >
                    <BookOpen size={20} />
                </button>
                <button
                    onClick={onReset}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                    title="New Game"
                >
                    <RefreshCw size={20} />
                </button>
                <button
                    onClick={onOpenStats}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                    title="Statistics"
                >
                    <BarChart2 size={20} />
                </button>
                <button
                    onClick={onOpenSettings}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                    title="Settings"
                >
                    <Settings size={20} />
                </button>
            </div>
        </header>
    );
}
