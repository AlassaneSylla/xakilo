import { useEffect, useState } from 'react';

import { getProducts, getLowStockProducts } from '../api/productApi';
import { getEntries } from '../api/entriesApi';
import Button from '../components/Button'
import Card from '../components/Card'
import StockFlowChart from '../components/StockFlowChart'
import PieChart from '../components/PieChart';
import InpuOutput from '../components/InputOutput';
import { getRemovals } from '../api/removalsApi';


function Home() {
    const [removalOfTheDay, setRemovalOfTheDay] = useState<number>(0);
    const [entriesOfTheMonth, setEntriesOfTheMonth] = useState<number>(0);
    const [product, setProduct] = useState();
    const [count, setCount] = useState<number>(0);
    const [lowStock, setLowStock] = useState<number>(0);

    useEffect(() => {
        const fetchRemovals = async () => {
            try {
                const removals = await getRemovals();
                setCount(removals.length);

                const today = new Date();
                const currentDay = today.getDay();
                const currentMonth = today.getMonth();
                const currentYear = today.getFullYear();

                const dailyRemoval = removals.filter((removal: any) => {
                    const removalDate = new Date(removal.invoice.date_created);
                    return (
                        removalDate.getDay() == currentDay &&
                        removalDate.getMonth() == currentMonth &&
                        removalDate.getFullYear() == currentYear
                    )
                });

                setRemovalOfTheDay(dailyRemoval.length);

            } catch (error) {
                
            }
        };

        fetchRemovals();
    }, []);

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const entries = await getEntries();
                //entrees totale
                setCount(entries.length);

                const now = new Date();
                const currentMonth = now.getMonth(); // 0 = janvier
                const currentYear = now.getFullYear();

                const monthlyEntries = entries.filter((entry: any) => {
                    const entryDate = new Date(entry.date_register);
                    return (
                    entryDate.getMonth() === currentMonth &&
                    entryDate.getFullYear() === currentYear
                    );
                });

                setEntriesOfTheMonth(monthlyEntries.length);

            } catch (error) {
                console.error("Erreur chargement des entrees : ", error)
            }
        };

        fetchEntries();

    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProduct(data);
                setCount(data.length);
            } catch (error) {
                console.error("Erreur lors du chargement des produits : ", error)
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        getLowStockProducts()
            .then((data) => setLowStock(data.count))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold uppercase">Bienvenu(e) Alassane</h1>

            {/* stock statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                <Card title='Nombre total de produits' totalProduct={count} color='badge-accent'/>
                <Card title="Entrées du mois ↗︎" totalProduct={entriesOfTheMonth} color='badge-success'/>
                <Card title='Sorties du jour ↘︎' totalProduct={removalOfTheDay} color='badge-warning'/>
                <Card title='Produit(s) en rupture' totalProduct={lowStock} color='badge-error'/>
            </div>

            {/* stock charts */}
            <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 mb-12'>
                <div>
                    <h2 className='text-xl font-bold'>📈 Évolution mensuelle des stock</h2>
                    <StockFlowChart/>
                </div>
                <div>
                    <h2 className='text-xl font-bold'>🧱 Répartition des stocks</h2>
                    <PieChart/>
                </div>
            </div>

            {/* data and operations */}
            <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 mb-12'>
                <div>
                    <h2 className='text-xl font-bold'>📄 Historique entrées/sorties</h2>
                    <InpuOutput/>
                </div>
                <div>
                    <h2 className='text-xl font-bold'>🗂️ Opérartions</h2>
                    <div className='grid grid-cols-2 gap-3'>
                        <Button variant="primary" size="md">Ajouter Produit</Button>
                        <Button variant="ghost" size="md">Entrée Produit</Button>
                        <Button variant="redghost" size="md">Sortie Produit</Button>
                        <Button variant='secondary' size='md'>Modifier Données</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;