interface CardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: string;
  icon?: string;
}

export default function Card({ title, value, subtitle, color = 'badge-accent', icon }: CardProps) {
  return (
    <div className="stats shadow-md bg-[var(--black)] text-[var(--brokenWhite)] rounded-xl overflow-hidden">
      <div className="stat px-5 py-4">
        <div className="stat-title text-xs font-medium text-gray-400 uppercase tracking-wide leading-tight">
          {icon && <span className="mr-1">{icon}</span>}
          {title}
        </div>
        <div className={`stat-value text-2xl font-bold mt-1 ${color}`}>{value}</div>
        {subtitle && (
          <div className="stat-desc text-xs text-gray-500 mt-1">{subtitle}</div>
        )}
      </div>
    </div>
  );
}