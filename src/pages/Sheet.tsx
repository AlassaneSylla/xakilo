import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getRemovalsByProductId } from "../api/removalsApi";
import { getEntriesByProductId } from "../api/entriesApi";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import Button from "../components/Button";
import { Download, Minus, Plus } from "lucide-react";


type Entry = {
  date_register: string | Date;
  quantity: number;
  supplier: string;
};

type RemovalProduct = {
  product_name: string; 
  quantity: number;
  unit_price?: number;
  total_price?: number;
};

type Removal = {
  destination: string;
  invoice?: {
    date_created?: string; 
  };
  products?: RemovalProduct[];
};

type StockPoint = {
  updateDate: string; // date au format lisible
  quantity: number;   // stock cumulé
};

export default function StockSheet() {
    const location = useLocation();
  const { product } = location.state || {}; // produit passé depuis Products

  const [entries, setEntries] = useState<Entry[]>([]);
  const [removals, setRemovals] = useState<Removal[]>([]);
  const [movements, setMovements] = useState<
    { date: string; quantity: number; type: "entry" | "removal"; supplier?: string }[]
  >([]);
  const [stockVariation, setStockVariation] = useState<StockPoint[]>([]);

  // Charger les données liées au produit
  useEffect(() => {
    if (!product?.id) return;

    getEntriesByProductId(product.id)
      .then(setEntries)
      .catch((err) => console.error("Erreur chargement entrées :", err));

    getRemovalsByProductId(product.id)
      .then(setRemovals)
      .catch((err) => console.error("Erreur chargement sorties :", err));
  }, [product]);

  // Construire les données du graphe et de l'historique
  useEffect(() => {
    if (!entries.length && !removals.length) return;

    // 📥 Entrées
    const entryPoints = entries.map((e) => ({
      date: typeof e.date_register === "string" ? e.date_register : e.date_register.toString(),
      quantity: e.quantity,
      type: "entry" as const,
      supplier: e.supplier,
    }));

    // 📤 Sorties
    const removalPoints = removals.flatMap((r) =>
      (r.products || []).map((p) => ({
        date: r.invoice?.date_created ?? "",
        quantity: p.quantity,
        type: "removal" as const,
        supplier: r.destination ?? "client inconnu",
      }))
    );

    // 🧩 Fusion et tri chronologique
    const allPoints = [...entryPoints, ...removalPoints].filter((p) => p.date);
    allPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 📊 Calcul du stock cumulé dans le temps
    let currentStock = 0;
    const variation: StockPoint[] = [];
    allPoints.forEach((move) => {
      currentStock += move.type === "entry" ? move.quantity : -move.quantity;
      variation.push({
        updateDate: new Date(move.date).toISOString().split("T")[0],
        quantity: currentStock,
      });
    });

    // mise à jour des états
    setMovements(allPoints);
    setStockVariation(variation);
    }, [entries, removals]);

    // 🔹 Derniers points (si tu veux limiter le graphe)
    const lastFive = stockVariation.slice(-5);

    // //pagination 
    const [ currentPage, setCurrentPage ] = useState(1);
    const itemsPerPage = 6;
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentHistoryItems = movements.slice(indexOfFirst, indexOfLast);
    const numberOfPages = Math.ceil(history.length / itemsPerPage);

  return (
    <div>
        <h1 className="text-2xl font-bold uppercase">
            Fiche de stock — {product?.product_ref}
        </h1>

        <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 mb-12'>
            <div>
                <div className="card w-110 bg-base-300 shadow-md">
                    <div className="card-body">
                        <div className="flex justify-between">
                            <h2 className="text-xl font-bold">Infos Produit</h2>
                        </div>
                        {product ? (
                        <ul className="space-y-2 ">
                        <li>
                            🏷️ Libellé produit : 
                            <span className="font-bold capitalize"> {product.product_name}</span> 
                        </li>
                        <li>
                            📂 Catégorie : 
                            <span className="font-bold capitalize"> {product.category}</span> 
                        </li>
                        <li>
                            📦 Stock actuel : 
                            <span className="font-bold"> {product.stock}</span> 
                        </li>
                        <li>
                            💰 Prix de vente : 
                            <span className="font-bold"> {product.unit_price} FCFA</span> 
                        </li>
                        <li>
                            💵 Prix d'achat : 
                            <span className="font-bold"> {product.purchase_price} FCFA</span> 
                        </li>
                        <li>
                            ⚠️ Seuil d'alerte : 
                            <span className="font-bold"> {product.alert}</span> 
                        </li>
                        </ul>
                        ) : (
                            <p>Aucun produit sélectionné.</p>
                        )}
                        <div className="mt-6">
                            {product.stock <= product.alert && (
                                <p className="text-red-500 mt-2">
                                    🚨 Stock faible — réapprovisionnement recommandé
                                </p>
                            )}
                        </div>
                    </div>
                </div>    
            </div>
            <div>
                <h2 className="text-xl font-bold mb-2">📈 Évolution du stock</h2>
                <div className="w-full h-80">
                    {stockVariation.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart  data={lastFive.length ? lastFive : stockVariation}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="updateDate" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="quantity" 
                                stroke="#00C4B4" 
                                name="Stock" 
                            />
                            </LineChart>
                        </ResponsiveContainer>
                        ) : (
                        <p className="text-gray-500">Aucune donnée disponible pour ce produit.</p>
                    )}

                </div>
            </div>
        </div>

        {/* Section call to action                   */}
        <div className="grid grid-cols-3 gap-10 mb-8">
            <Button variant="primary" size="md">
                <Plus /> Ajouter entée
            </Button>
            <Button variant="redghost" size="md">
                <Minus /> Enregistrer sortie
            </Button>
            <Button variant="greyghost" size="md">
                <Download /> Générer un rapport PDF
            </Button>
        </div>

        <div className='overfow-x-auto'>
            <h2 className="text-xl font-bold">Historique des mouvements</h2>
            <table className="table w-full">
                <thead>
                    <tr className="bg-base-200 text-[var(--black)]">
                        <th>🔁 Type mouvement</th>
                        <th>📅 Date</th>
                        <th>📥/📤 Quantité</th>
                        <th>👤 Fournisseur</th>
                    </tr>
                </thead>
                <tbody className='transition-all duration-300 ease-in-out'>
                    {currentHistoryItems.length > 0 ? (
                    currentHistoryItems.map((item, index) => (
                    <tr key={index} className="hover:bg-base-200">
                        <td className="flex">
                        {item.type === "entry" ? (
                            <>
                            <Plus className="text-green-500 mr-1" /> Entrée
                            </>
                        ) : (
                            <>
                            <Minus className="text-red-500 mr-1" /> Sortie
                            </>
                        )}
                        </td>
                        <td>{new Date(item.date).toLocaleDateString("fr-FR")}</td>
                        <td>{item.quantity}</td>
                        <td>{item.supplier || "-"}</td>
                    </tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan={4} className="text-center text-gray-500 py-4">
                            Aucun mouvement enregistré.
                        </td>
                    </tr>
                    )}
                </tbody> 
            </table>
        </div>

        <div className="flex justify-center mt-4 space-x-2">
            <button 
                className="btn btn-sm bg-[var(--black)] text-[var(--brokenWhite)]" 
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
            >
                Précédent
            </button>
            <span className="px-3 py-1 text-xs">
                Page {currentPage} sur ( {numberOfPages} )  
            </span>
            <button 
                className="btn btn-sm bg-[var(--black)] text-[var(--brokenWhite)]" 
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={indexOfLast >= history.length}
            >
                Suivant
            </button>
        </div>
    </div>
  );
}
