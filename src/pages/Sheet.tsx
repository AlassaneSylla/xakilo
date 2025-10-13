import { useLocation } from "react-router-dom"
import { useData } from "../context/DataContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { Plus, Minus, Download } from 'lucide-react';
import Button from "../components/Button";


type Stock = {
    // productId: string;     
    updateDate: Date;            
    quantity: number;        
};

export default function Sheet() {
    const location = useLocation();
    const { entries, removals } = useData();
    const { product } = location.state || {}; 
    
    const history = [
        ...entries.map(e => ({
            type: 'Entrée',
            date: e.dateRegister,
            quantity: e.quantity,
            supplier: e.supplier,
            comment: '' 
        })),
            ...removals.map(r => ({
            type: 'Sortie',
            date: r.dateRegister,
            quantity: r.quantity,
            supplier: r.destination, 
            comment: '' 
        }))
    ];

    //trie par ordre decroissant
    history.sort((a, b) => b.date.getTime() - a.date.getTime());

    //pagination 
    const [ currentPage, setCurrentPage ] = useState(1);
    const itemsPerPage = 6;
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentHistoryItems = history.slice(indexOfFirst, indexOfLast);
    const numberOfPages = Math.ceil(history.length / itemsPerPage);

    //get entries and removals
    const productEntries = entries.filter(e => e.reference === product.reference);
    const productRemovals = removals.filter(r => r.reference === product.reference);

    //to assembly data
    const movements = [
        ...productEntries.map(e => ({
            date: e.dateRegister,
            quantity: e.quantity,
            type: 'Entrée'
        })),
        ...productRemovals.map(r => ({
            date: r.dateRegister,
            quantity: r.quantity,
            type: "Sortie"
        }))
    ]

    //sort movements date
    movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let currentStock = 0;
    const stockVariation : Stock[] = [];

    for (const move of movements) {
        if (move.type === "Entrée") {
            currentStock += move.quantity;
        }
        else {
            currentStock -= move.quantity;
        }

        stockVariation.push({
            updateDate: move.date,
            quantity: currentStock,
        });
    }

    //take the lats 5 date
    const lastFiveDates = stockVariation.slice(-5);
    console.log(lastFiveDates);

    return (
        <div>
            <h1 className="text-2xl font-bold uppercase">Fiche de stock</h1>
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
                                🏷️ Libellé produit : <span className="font-bold capitalize"> {product.productName} </span> 
                            </li>
                            <li>
                                📂 Catégorie : <span className="font-bold capitalize"> {product.category} </span> 
                            </li>
                            <li>
                                🔢 Référence : <span className="font-bold"> {product.reference} </span> 
                            </li>
                            <li>
                                📦 Stock actuel : <span className="font-bold"> {product.stock} </span> 
                            </li>
                            <li>
                                💰 Prix de vente : <span className="font-bold"> {product.unitPrice} FCFA </span> 
                            </li>
                            <li>
                                💵 Prix d'achat : <span className="font-bold"> {product.purchasePrice} FCFA </span> 
                            </li>
                            <li>
                                ⚠️ Seuil d'alerte : <span className="font-bold"> {product.alert} </span> 
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
                    <h2 className='text-xl font-bold'>📈 Évolution du stock</h2> 
                    <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lastFiveDates}>
                            <XAxis 
                                dataKey="updateDate"
                                tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR')} 
                            />
                            <YAxis />
                            <Tooltip
                                labelClassName="text-xs"
                                labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR')}
                            />
                            <Legend />
                            <Line
                                className="text-xs"
                                type="monotone"
                                dataKey="quantity"
                                stroke="#00C4B4"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                            />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>  
                </div>
            </div>

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
                <table className="table">
                    <thead>
                        <tr className="bg-base-200 text-[var(--black)]">
                            <th>🔁 Type mouvement</th>
                            <th>📅 Date</th>
                            <th>📥/📤 Quantité</th>
                            <th>👤 Fournisseur</th>
                            <th>📝 Commentaire</th>
                        </tr>
                    </thead>
                    <tbody className='transition-all duration-300 ease-in-out'>
                        {currentHistoryItems.map((item, index) => (
                            <tr key={index} className="hover:bg-base-200">
                                <td className='flex '>
                                    { item.type === 'Entrée' ? (
                                        <><Plus className="text-red-500 mr-1" /> {item.type}</> 
                                    ) : ( 
                                        <><Minus className="text-green-500 mr-1" /> {item.type}</>
                                    )}
                                </td>
                                <td>{item.date.toLocaleDateString()}</td>
                                <td>{item.quantity}</td>
                                <td className="capitalize">{item.supplier}</td>
                                <td>commentaire</td>
                            </tr>
                        ))}
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
    )
}