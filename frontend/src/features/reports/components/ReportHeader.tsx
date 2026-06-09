import { X } from 'lucide-react';
import type { ReportPeriod } from '../api/reportsApi';

type Tab = { key: ReportPeriod; label: string };

type Props = {
  title: string;
  tabs: Tab[];
  period: ReportPeriod;
  onPeriodChange: (p: ReportPeriod) => void;
  showDateFilter?: boolean;
  dateFrom?: string;
  dateTo?: string;
  onDateChange?: (from: string, to: string) => void;
  children?: React.ReactNode;
};

export default function ReportHeader({
  title, tabs, period, onPeriodChange,
  showDateFilter, dateFrom = '', onDateChange,
  children,
}: Props) {
  const isCustom = Boolean(dateFrom);

  const handleDateChange = (value: string) => {
    onDateChange?.(value, value);
  };

  const clear = () => { onDateChange?.('', ''); };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 no-print">
      {/* Titre + subtitle */}
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">{title}</h1>
        {children && <div className="mt-1">{children}</div>}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Sélecteur segmenté */}
        <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { onPeriodChange(t.key); clear(); }}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-150 ${
                period === t.key && !isCustom
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filtre date unique */}
        {showDateFilter && (
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleDateChange(e.target.value)}
              className={`input input-sm border-0 rounded-xl text-sm ${
                isCustom ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            />
            {isCustom && (
              <button
                onClick={clear}
                className="btn btn-xs btn-ghost text-gray-400 px-1"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}

        {/* Exporter PDF */}
      </div>
    </div>
  );
}