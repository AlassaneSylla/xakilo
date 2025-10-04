
interface CardProps {
    title: string,
    totalProduct: number,
    color: string
}
export default function Card({title, totalProduct, color}: CardProps) {
    return (
      <div className="">
        <div className="stats shadow bg-[var(--black)] text-[var(--brokenWhite)]">
          <div className="stat">
            <div className="stat-title text-[var(--brokenWhite)]">{title}</div>
            <div className={`stat-value ${color}`}>{totalProduct}</div>
            <div className="stat-desc text-[var(--brokenWhite)]">
              <div className="stat-desc text-[var(--brokenWhite)]">
                {title === "Entrées du jour ↗︎" && "Livraisons reçues aujourd'hui"}
                {title === "Sorties du jour ↘︎" && "Produits vendus ou sortis"}
                {title === "Nombre total de produits" && "Stock global disponible"}
                {title === "Produits en rupture" && "À réapprovisionner rapidement"}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}