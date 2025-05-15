//import Button from '../components/Button'
import Card from '../components/Card'
import StockFlowChart from '../components/StockFlowChart'

function Home() {
    return (
        <div>
            <h1 className="text-4xl font-bold">Bienvenu(e) Alassane</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-7">
                <Card title='Nombre total de produits' totalProduct={62} color='badge-accent'/>
                <Card title="Eentrées du jour" totalProduct={6} color='badge-success'/>
                <Card title='Sorties du jour' totalProduct={23} color='badge-warning'/>
                <Card title='Produits en rupture' totalProduct={6} color='badge-error'/>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5'>
                <div>
                    <h2 className='text-xl font-bold'>Évolution mensuelle des stock</h2>
                    <StockFlowChart/>
                </div>
                <div>
                    <h2 className='text-xl font-bold'>Repartition stock</h2>
                </div>
            </div>
        </div>
    )
}

export default Home


{/* <Button >Par défaut</Button>
            <Button variant="secondary">Secondaire large</Button>
            <Button variant="ghost">Ghost small</Button> */}