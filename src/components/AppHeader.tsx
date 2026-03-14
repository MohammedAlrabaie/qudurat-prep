import { useLocation } from "wouter";

interface Props {
  right?: React.ReactNode;
  subtitle?: string;
}

export default function AppHeader({ right, subtitle }: Props) {
  const [, navigate] = useLocation();
  return (
    <header className="border-b border-white/8 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 bg-[#0d0f16]/90 backdrop-blur">
      <button onClick={() => navigate("/")} className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
          ق
        </div>
        <div>
          <span className="font-black text-base tracking-tight leading-none block text-white">قُدُرات</span>
          {subtitle && <span className="text-[10px] text-white/30 leading-none">{subtitle}</span>}
        </div>
      </button>
      <div className="flex items-center gap-2">{right}</div>
    </header>
  );
}
