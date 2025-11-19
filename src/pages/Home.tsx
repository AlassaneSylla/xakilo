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
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalRemovals, setTotalRemovals] = useState(0);
    const [removalsOfTheDay, setRemovalsOfTheDay] = useState(0);
    const [totalEntries, setTotalEntries] = useState(0);
    const [entriesOfTheMonth, setEntriesOfTheMonth] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);


    useEffect(() => {
        const fetchAllData = async () => {
        try {
            const [products, removals, entries, lowStock] = await Promise.all([
            getProducts(),
            getRemovals(),
            getEntries(),
            getLowStockProducts(),
            ]);

            // total produits
            setTotalProducts(products.length);

            // total sorties
            setTotalRemovals(removals.length);

            // sorties du jour
            const today = new Date();
            const dailyRemovals = removals.filter((removal: any) => {
            if (!removal.invoice?.date_created) return false; // ignore les dons/pertes
            const removalDate = new Date(removal.invoice.date_created);
            return (
                removalDate.getDate() === today.getDate() &&
                removalDate.getMonth() === today.getMonth() &&
                removalDate.getFullYear() === today.getFullYear()
            );
            });
            setRemovalsOfTheDay(dailyRemovals.length);

            // total entrees
            setTotalEntries(entries.length);

            // entrees du mois
            const monthlyEntries = entries.filter((entry: any) => {
            const entryDate = new Date(entry.date_register);
            return (
                entryDate.getMonth() === today.getMonth() &&
                entryDate.getFullYear() === today.getFullYear()
            );
            });
            setEntriesOfTheMonth(monthlyEntries.length);

            // stock faible
            setLowStockCount(lowStock.count);
        } catch (error) {
            console.error("Erreur lors du chargement des données :", error);
        }
        };

        fetchAllData();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold uppercase">Bienvenu(e) Alassane</h1>

            {/* stock statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                <Card title='Nombre total de produits' totalProduct={totalProducts} color='badge-accent'/>
                <Card title="Entrées du mois ↗︎" totalProduct={entriesOfTheMonth} color='badge-success'/>
                <Card title='Sorties du jour ↘︎' totalProduct={removalsOfTheDay} color='badge-warning'/>
                <Card title='Produit(s) en rupture' totalProduct={lowStockCount} color='badge-error'/>
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