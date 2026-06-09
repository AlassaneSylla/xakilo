import { useEffect, useRef, useState } from 'react';
import { CalendarDays, X } from 'lucide-react';

type Props = {
  value: string;
  onChange: (date: string) => void;
};

export default function DateFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`btn btn-md font-semibold w-full flex items-center gap-1.5 transition-all duration-200 ${
          value
            ? 'bg-[var(--primary)] text-black border-[var(--primary)] hover:bg-[var(--primary-hover)] hover:text-white'
            : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-500 hover:text-white hover:border-gray-500'
        }`}
      >
        <CalendarDays size={15} />
        {value
          ? new Date(value + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'Filtrer par date'}
        {value && (
          <span
            onClick={clear}
            className="ml-auto rounded-full bg-black/10 hover:bg-black/20 p-0.5 cursor-pointer"
          >
            <X size={12} />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-base-100 border border-base-300 rounded-xl shadow-lg p-4 w-60">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Choisir une date</p>
          <input
            type="date"
            className="input input-sm w-full"
            value={value}
            onChange={(e) => { onChange(e.target.value); setOpen(false); }}
          />
          {value && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="btn btn-xs btn-ghost w-full text-gray-500 mt-2"
            >
              Effacer le filtre
            </button>
          )}
        </div>
      )}
    </div>
  );
}