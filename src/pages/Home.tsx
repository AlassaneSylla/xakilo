import Button from '../components/Button'
import Card from '../components/Card'
import StockFlowChart from '../components/StockFlowChart'
import PieChart from '../components/PieChart';
import InpuOutput from '../components/InputOutput';

function Home() {
    return (
        <div>
            <h1 className="text-3xl font-bold uppercase">Bienvenu(e) Alassane</h1>

            {/* stock statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                <Card title='Nombre total de produits' totalProduct={62} color='badge-accent'/>
                <Card title="Entrées du jour ↗︎" totalProduct={6} color='badge-success'/>
                <Card title='Sorties du jour ↘︎' totalProduct={23} color='badge-warning'/>
                <Card title='Produits en rupture' totalProduct={6} color='badge-error'/>
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

export default Home


{/* <Button >Par défaut</Button>
            <Button variant="secondary">Secondaire large</Button>
            <Button variant="ghost">Ghost small</Button> */}