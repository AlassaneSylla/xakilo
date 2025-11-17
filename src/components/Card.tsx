
interface CardProps {
    title: string,
    totalProduct: number,
    color: string
}
export default function Card({title, totalProduct, color}: CardProps) {
  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  const now = new Date();
  const currentMonth = months[now.getMonth()]; 
  return (
    <div className="">
      <div className="stats shadow bg-[var(--black)] text-[var(--brokenWhite)]">
        <div className="stat">
          <div className="stat-title text-[var(--brokenWhite)]">{title}</div>
          <div className={`stat-value ${color}`}>{totalProduct}</div>
          <div className="stat-desc text-[var(--brokenWhite)]">
            <div className="stat-desc text-[var(--brokenWhite)]">
              {title === "Entrées du mois ↗︎" && `Livraisons mois de ${currentMonth}`}
              {title === "Sorties du jour ↘︎" && "Produits vendus ou sortis"}
              {title === "Nombre total de produits" && "Stock global disponible"}
              {title === "Produit(s) en rupture" && "À réapprovisionner rapidement"} 
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
