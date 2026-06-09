import { useNavigate } from 'react-router-dom';
import { Zap, PackagePlus, ReceiptText, ArrowRight } from 'lucide-react';

import { useDashboard } from '../hooks/useDashboard';
import Card from '../../../shared/components/ui/Card';
import StockFlowChart from '../components/StockFlowChart';
import CategoryPieChart from '../components/CategoryPieChart';
import InputOutputWidget from '../components/InputOutputWidget';
import QuickSaleModal from '../../sales/components/QuickSaleModal';
import { PATHS } from '../../../router/paths';

const QUICK_ACTIONS = [
  {
    id: 'quick-sale',
    label: 'Vente Rapide',
    description: 'Enregistrer une vente & générer une facture',
    icon: <Zap size={22} />,
    color: 'bg-[var(--primary)] text-white',
    action: 'modal' as const,
  },
  {
    id: 'add-product',
    label: 'Ajouter un Produit',
    description: 'Créer une fiche produit dans l\'inventaire',
    icon: <PackagePlus size={22} />,
    color: 'bg-emerald-500 text-white',
    action: 'nav' as const,
    path: PATHS.PRODUCTS,
  },
  {
    id: 'new-invoice',
    label: 'Nouvelle Facture',
    description: 'Créer un document de vente client',
    icon: <ReceiptText size={22} />,
    color: 'bg-blue-500 text-white',
    action: 'nav' as const,
    path: PATHS.SALES,
  },
];

export default function HomePage() {
  const { stats, monthlyChartData, categoryChartData, recentTransactions, loading } = useDashboard();
  const navigate = useNavigate();

  const handleQuickAction = (action: typeof QUICK_ACTIONS[number]) => {
    if (action.action === 'modal') {
      (document.getElementById('quick_sale_modal') as HTMLDialogElement)?.showModal();
    } else {
      navigate(action.path!);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg text-(--primary)" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Tableau de bord</h1>
        <p className="text-sm text-gray-400 mt-0.5">Vue d'ensemble de votre activité</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Produits en stock" value={stats.totalProducts} color="badge-accent" />
        <Card title="Entrées ce mois" value={stats.entriesOfTheMonth} color="badge-success" />
        <Card title="Sorties aujourd'hui" value={stats.removalsOfTheDay} color="badge-warning" />
        <Card title="Produits en rupture" value={stats.lowStockCount} color="badge-error" />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body pb-2">
            <h2 className="font-semibold text-base mb-1">Évolution mensuelle des stocks</h2>
            <p className="text-xs text-gray-400 mb-3">Entrées & sorties sur les 12 derniers mois</p>
            <StockFlowChart data={monthlyChartData} />
          </div>
        </div>
        <div className="card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body pb-2">
            <h2 className="font-semibold text-base mb-1">Répartition du stock par catégorie</h2>
            <p className="text-xs text-gray-400 mb-3">Catégories avec au moins 1 article en stock</p>
            <CategoryPieChart data={categoryChartData} />
          </div>
        </div>
      </div>

      {/* Historique + Opérations rapides */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* Historique — 3/5 */}
        <div className="md:col-span-3 card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="font-semibold text-base mb-3">Dernières transactions</h2>
            <InputOutputWidget transactions={recentTransactions} />
          </div>
        </div>

        {/* Opérations rapides — 2/5 */}
        <div className="md:col-span-2 card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body">
            <h2 className="font-semibold text-base mb-4">Opérations rapides</h2>
            <div className="flex flex-col gap-3">
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.id}
                  onClick={() => handleQuickAction(qa)}
                  className="flex items-center gap-4 p-4 rounded-xl border border-base-300 bg-base-100 hover:bg-base-200 transition-all text-left group"
                >
                  <div className={`p-2.5 rounded-lg shrink-0 ${qa.color}`}>
                    {qa.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{qa.label}</p>
                    <p className="text-xs text-gray-400 truncate">{qa.description}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Modal vente rapide (rendu ici pour être disponible depuis le dashboard) */}
      <QuickSaleModal />
    </div>
  );
}