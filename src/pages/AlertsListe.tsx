import { useEffect, useState } from "react"
import { getLowStockProducts } from "../api/productApi"

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
}

export default function AlertList() {
    const [lowStockProduct, setLowStockProduct] = useState<Product[]>([]);

    useEffect(() => {
        getLowStockProducts()
            .then((data) => setLowStockProduct(data.products))
            .catch((err) => console.error("Erreur lors de la recuperation de produits : ", err));
    })

    return(
        <div>
           <div>
                {lowStockProduct.length > 0 ? (
                    lowStockProduct.map(product => (
                    <div key={product.id}>
                        {product.product_name} - Stock : {product.stock}
                    </div>
                    ))
                ) : (
                    <p>Aucun produit n'est en alerte de rupture</p>
                )}
            </div>
        </div>
    )
}