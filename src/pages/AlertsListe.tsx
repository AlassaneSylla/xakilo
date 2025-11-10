import { useEffect, useState } from "react"
import { getLowStockProducts } from "../api/productApi"
import { Toaster } from "react-hot-toast";

interface Product {
  id: number;
  product_name: string;
  category: string;
  category_display: string;
  product_ref: string;
  stock: number;
  unit_price?: number;
  purchase_price?: number;
  alert: number;
  created_by_username?: string;
  last_supplier?: string | null;
  last_entry_date?: string | null;
}

export default function AlertList() {
    const [lowStockProduct, setLowStockProduct] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        getLowStockProducts()
            .then((data) => setLowStockProduct(data.products))
            .catch((err) => console.error("Erreur lors de la recuperation de produits : ", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <span className="loading loading-spinner loading-lg text-[var(--primary)]"></span>
        </div>
        );
    }

    return(
        <div>
            {/* <Toaster position="top-center" reverseOrder={false} /> */}
            <h1 className="text-2xl font-bold uppercase">Produits en alerte de rupture</h1>
            <ul className="bg-base-100 rounded-box shadow-md divide-y divide-gray-200">
                {lowStockProduct.length > 0 ? (
                    lowStockProduct.map((product) => (
                    <li
                        key={product.id}
                        className="flex items-center justify-between gap-4 p-3 hover:bg-base-200 transition-all duration-200"
                    >
                        {/* image */}
                        <div className="flex-shrink-0">
                        <img
                            className="w-12 h-12 rounded-lg object-cover"
                            src="https://img.daisyui.com/images/profile/demo/1@94.webp"
                            alt={product.product_name}
                        />
                        </div>

                        {/* nom et categorie */}
                        <div className="flex flex-col w-1/4">
                        <span className="font-semibold text-sm">{product.product_name}</span>
                        <span className="text-xs opacity-60">{product.category}</span>
                        </div>

                        {/* stock et alerte */}
                        <div className="flex flex-col w-[10%]">
                        <span className="text-xs font-semibold text-red-500">
                            Stock : {product.stock}
                        </span>
                        <span className="text-xs opacity-60">Seuil : {product.alert}</span>
                        </div>

                        {/* fournisseur */}
                        <div className="flex flex-col text-sm w-1/4">
                            <span className="text-gray-700">
                                <span className="opacity-60">Fournisseur :</span>{" "}
                                <span className="font-semibold">{product.last_supplier || "—"}</span>
                            </span>
                            {product.last_entry_date && (
                                <span className="text-xs opacity-60">
                                {new Date(product.last_entry_date).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                        {/* reference */}
                        <div className="flex flex-col text-xs w-[10%]">
                        <span className="opacity-60">Référence</span>
                        <span className="font-semibold">{product.product_ref}</span>
                        </div>

                        {/* prix */}
                        <div className="flex flex-col text-xs w-1/6 text-right">
                        <span className="font-semibold text-gray-800">
                            Vente : {product.unit_price ?? "-"} FCFA
                        </span>
                        <span className="opacity-60">Achat : {product.purchase_price ?? "-"}</span>
                        </div>

                        {/* user */}
                        <div className="flex flex-col text-xs text-right w-[10%]">
                            <span className="opacity-60">ajouté par</span>
                            <span className="text-[var(--primary)] font-semibold">
                                {product.created_by_username}
                            </span>
                        </div>
                    </li>
                    ))
                ) : (
                    <li className="p-4 text-center text-gray-500">
                    Aucun produit en alerte de rupture
                    </li>
                )}
            </ul>

        </div>
    )
}