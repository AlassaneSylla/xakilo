import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";

import { getProducts } from "../api/productApi";
import { postRemoval } from "../api/removalsApi";
import { CircleX, Plus } from "lucide-react";
import Button from "../components/Button";
import toast from "react-hot-toast";


interface RemovalItem {
  product: number;
  quantity: number;
}

interface NewRemoval {
  client_name: string;
  destination: string;
  invoice_status: string;
  items: RemovalItem[];
}

export default function RemovalForm() {
    const navigate = useNavigate();
    const [removal, setRemoval] = useState<any[]>([]);
    const [removalProducts, setRemovalProducts] = useState<any[]>([]);
    const [newRemovalForm, setNewRemovalForm] = useState<NewRemoval>({
        client_name: "",
        destination: "vente",
        invoice_status: "payee",
        items: [],
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
       getProducts()
         .then((data) => setRemovalProducts(data))
         .catch((error) => console.log("Erreur Get Products : ", error));
    }, []);

    const addItem = () => {
        setNewRemovalForm(prev => ({
            ...prev,
            items: [...prev.items, { product: removalProducts[0]?.id || "", quantity: 1 }]
        }));
    };

    const updateItem = (index: number, field: keyof RemovalItem, value: any) => {
        const updatedItems = [...newRemovalForm.items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        setNewRemovalForm(prev => ({
            ...prev,
            items: updatedItems
        }));
    };

    const removeItem = (index: number) => {
        setNewRemovalForm((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const resetForm = () => {
        setNewRemovalForm({
            client_name: "",
            destination: "vente",
            invoice_status: "payee",
            items: [],
        });
    };

    const handleAddRemoval = async () => {
        setLoading(true);

        try {
            // console.log("DATA ENVOYÉE AU BACKEND :", JSON.stringify(newRemovalForm, null, 2));

            const newRemoval = await postRemoval(newRemovalForm);

            setRemoval((prev) => [newRemoval, ...prev]);

            toast.success("Sortie enregistrée avec succès !");

            resetForm();

            setTimeout(() => {
                navigate("/removals");   
            }, 800);

        } catch (error) {
            console.error("Erreur lors de l'ajout de la sortie :", error);
            toast.error("Erreur lors de l'ajout de la sortie !");
        } finally {

            setLoading(false);
        }
    };

    return(
        <div>
            <h1 className="text-2xl font-bold uppercase">Créer une sortie</h1>
            <div className="p-1 max-w-2xl mx-auto">
                <form 
                    onSubmit={(e) => { 
                        e.preventDefault(); 
                        handleAddRemoval(); 
                    }}
                    className="flex flex-col gap-4"
                >
                    {/* Client */}
                    <div>
                        <input 
                            type="text" 
                            placeholder="Prenom et nom du client ou raison sociale" 
                            className="input input-neutral w-full"
                            value={newRemovalForm.client_name}
                            onChange={(e) =>
                            setNewRemovalForm((prev) => ({ ...prev, client_name: e.target.value }))
                            } 
                            required
                        />
                    </div>

                    {/* Produits */}
                    <div>
                        {newRemovalForm.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                        
                                <select
                                    className="select select-bordered flex-1"
                                    value={item.product}
                                    onChange={(e) => updateItem(index, "product", Number(e.target.value))}
                                >
                                    <option value="">Sélectionner un produit</option>

                                    {removalProducts.map((p) => (
                                        <option key={p.id} value={p.id}>
                                        {p.product_name}
                                        </option>
                                    ))}
                                </select>


                                <input 
                                    type="number" 
                                    placeholder="neutral" 
                                    className="input input-neutral w-24"
                                    min={1}
                                    value={item.quantity}
                                    onChange={(e) =>
                                    updateItem(index, "quantity", Number(e.target.value))
                                    }
                                />

                                <CircleX
                                    className="text-red-500 hover:cursor-pointer"
                                    onClick={() => removeItem(index)} 
                                />
                            </div>
                        ))}

                        <button 
                            type="button" 
                            className="btn btn-xs hover:text-[color:var(--brokenWhite)] hover:bg-[color:var(--black)]" 
                            onClick={addItem}
                        >
                            <Plus className="text-[var(--primary)]" /> ajouter produit
                        </button>
                    </div>

                    {/* Destination */}
                    <div>
                        <label className="font-semibold">Destination</label>
                        <select
                            className="select select-bordered w-full"
                            value={newRemovalForm.destination}
                            onChange={(e) =>
                            setNewRemovalForm((prev) => ({ ...prev, destination: e.target.value }))
                            }
                        >
                            <option value="vente">Vente</option>
                            <option value="don">Don</option>
                            <option value="perte">Perte</option>
                        </select>
                    </div>

                    {/* Statut facture */}
                    {newRemovalForm.destination === "vente" && (
                        <div>
                            <label className="font-semibold">Statut facture</label>
                            <select
                            className="select select-bordered w-full"
                            value={newRemovalForm.invoice_status}
                            onChange={(e) =>
                                setNewRemovalForm((prev) => ({ ...prev, invoice_status: e.target.value }))
                            }
                            >
                            <option value="payee">Payée</option>
                            <option value="en_attente">En attente</option>
                            <option value="annulee">Annulée</option>
                            </select>
                        </div>
                    )}

                    <Button
                        variant="primary"
                        size="md" 
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                        <span 
                            className="loading loading-spinner loading-sm text-[var(--primary)]"
                        ></span>
                        ) : (
                        "Enregistrer"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}