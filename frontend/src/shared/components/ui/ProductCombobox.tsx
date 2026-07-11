import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import type { Product } from '../../../features/products/types';

type Props = {
  products: Product[];
  value: { product_id: number; product_name: string };
  onChange: (p: Product) => void;
  className?: string;
};

export default function ProductCombobox({ products, value, onChange, className = '' }: Props) {
  const [query, setQuery] = useState(value.product_name);
  const [open, setOpen]   = useState(false);
  const ref               = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? products
        .filter((p) =>
          p.product_name.toLowerCase().includes(query.toLowerCase()) ||
          (p.category ?? '').toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)
    : products.slice(0, 8);

  useEffect(() => { setQuery(value.product_name); }, [value.product_name]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(value.product_name);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [value.product_name]);

  const select = (p: Product) => {
    onChange(p);
    setQuery(p.product_name);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="relative">
        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          className="input input-sm w-full pl-6 pr-2"
          placeholder="Rechercher un produit…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-base-300 bg-base-100 shadow-lg">
          {filtered.map((p) => (
            <li
              key={p.id}
              onMouseDown={() => select(p)}
              className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-base-200 text-sm"
            >
              <div>
                <span className="font-medium">{p.product_name}</span>
                {p.category && <span className="ml-1 text-xs text-gray-400">· {p.category}</span>}
              </div>
              <span className={`text-xs font-semibold ml-2 shrink-0 ${p.stock <= 0 ? 'text-red-400' : 'text-gray-500'}`}>
                stock: {p.stock}
              </span>
            </li>
          ))}
        </ul>
      )}

      {open && filtered.length === 0 && query.trim() && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-base-300 bg-base-100 shadow-lg px-3 py-2 text-sm text-gray-400">
          Aucun produit trouvé
        </div>
      )}
    </div>
  );
}
