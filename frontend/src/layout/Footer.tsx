declare const __APP_VERSION__: string;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="h-12 bg-[var(--black)] text-[var(--brokenWhite)] flex items-center justify-between px-6 text-xs">
      <span className="text-gray-400">
        © {year} <span className="font-semibold text-white">Xakilo</span>
        <span className="hidden sm:inline text-gray-500"> · Gestion de boutique simplifiée</span>
      </span>
      <span className="text-gray-500">
        Développé par <span className="font-semibold text-white">Alassane Sylla</span>
        <span className="hidden sm:inline text-gray-600"> · v{__APP_VERSION__}</span>
      </span>
    </footer>
  );
}