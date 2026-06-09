import { useAuth } from '../../../providers/AuthProvider';
import InvoiceModal from '../../invoices/components/InvoiceModal';
import type { Removal } from '../../stock/removals/types';

type Props = { selectedInvoice: Removal | null };

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  payee:               { label: 'Payée',                  color: 'text-green-600' },
  partiellement_payee: { label: 'Partiellement payée',    color: 'text-amber-500' },
  en_attente:          { label: 'En attente de paiement', color: 'text-amber-500' },
  annulee:             { label: 'Annulée',                color: 'text-red-500'   },
};

function resolveStatus(invoiceStatus: string, balanceDue: number) {
  if (invoiceStatus === 'partiellement_payee' && balanceDue === 0)
    return STATUS_LABELS['payee'];
  return STATUS_LABELS[invoiceStatus] ?? { label: invoiceStatus, color: '' };
}

const MODE_LABELS: Record<string, string> = {
  especes:      'Espèces',
  mobile_money: 'Mobile Money',
  carte:        'Carte',
};

function fmt(n: number) { return n.toLocaleString('fr-FR'); }

export default function InvoiceTemplate({ selectedInvoice }: Props) {
  const { user } = useAuth();

  const boutiqueName    = user?.boutique_name    ?? '';
  const boutiquePhone   = user?.boutique_phone   ?? '';
  const boutiqueAddress = user?.boutique_address ?? '';
  const boutiqueLogo    = user?.boutique_logo    ?? null;

  if (!selectedInvoice?.invoice) return (
    <dialog id="invoice_modal" className="modal" />
  );

  const inv        = selectedInvoice.invoice;
  const payments   = selectedInvoice.payments ?? [];
  const amountPaid = selectedInvoice.amount_paid ?? 0;
  const balanceDue = selectedInvoice.balance_due ?? inv.total_amount - amountPaid;
  const statusInfo = resolveStatus(selectedInvoice.invoice_status, balanceDue);

  return (
    <dialog id="invoice_modal" className="modal">
      <div id="invoice-print-area">
        <InvoiceModal title={inv.invoice_number ?? ''}>
          <div className="space-y-4 text-xs">

            {/* ── En-tête ─────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-0.5">
                <p>
                  <span className="font-semibold">Client :</span> {selectedInvoice.client_name || '—'}
                  {selectedInvoice.client_phone && (
                    <span className="text-gray-400 ml-1">· {selectedInvoice.client_phone}</span>
                  )}
                </p>
                <p><span className="font-semibold">Vendeur :</span> {selectedInvoice.created_by_username || '—'}</p>
                <p><span className="font-semibold">Réf. :</span> {selectedInvoice.removal_ref}</p>
              </div>

              <div className="space-y-0.5">
                <p>
                  <span className="font-semibold">Date :</span>{' '}
                  {inv.date_created
                    ? new Date(inv.date_created).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                    : '—'}
                </p>
                <p>
                  <span className="font-semibold">Statut :</span>{' '}
                  <span className={`font-bold ${statusInfo.color}`}>{statusInfo.label}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 justify-end text-right">
                {boutiqueLogo && (
                  <img src={boutiqueLogo} alt="Logo boutique" className="w-12 h-12 object-contain" />
                )}
                <div className="leading-tight">
                  {boutiqueName    && <p className="font-bold">{boutiqueName}</p>}
                  {boutiqueAddress && <p>{boutiqueAddress}</p>}
                  {boutiquePhone   && <p>Tél : {boutiquePhone}</p>}
                </div>
              </div>
            </div>

            <div className="border-t border-base-300" />

            {/* ── Tableau produits ────────────────────────────── */}
            <table className="table w-full text-xs">
              <thead>
                <tr className="bg-base-200">
                  <th>Produit</th><th className="text-right">Qté</th>
                  <th className="text-right">Prix unit.</th><th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {inv.products.map((p, i) => (
                  <tr key={i}>
                    <td>{p.product_name}</td>
                    <td className="text-right">{p.quantity}</td>
                    <td className="text-right">{fmt(p.unit_price)} F</td>
                    <td className="text-right font-medium">{fmt(p.total_price)} F</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-base-200">
                  <td colSpan={3} className="text-right">Total facture</td>
                  <td className="text-right">{fmt(inv.total_amount)} F</td>
                </tr>
              </tfoot>
            </table>

            <div className="border-t border-base-300" />

            {/* ── Récapitulatif règlements ─────────────────────── */}
            <div>
              <p className="font-bold uppercase tracking-widest text-gray-400 mb-2">
                Suivi des règlements
              </p>

              {payments.length === 0 ? (
                <p className="italic text-gray-400 py-2 text-center">
                  Aucun règlement enregistré.
                </p>
              ) : (
                <table className="table w-full text-xs mb-3">
                  <thead>
                    <tr className="bg-base-200">
                      <th>Date</th><th>Mode</th><th>Encaissé par</th>
                      <th className="text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((pay) => (
                      <tr key={pay.id}>
                        <td>
                          {new Date(pay.date).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </td>
                        <td>{MODE_LABELS[pay.mode] ?? pay.mode}</td>
                        <td className="capitalize">{pay.received_by_username || '—'}</td>
                        <td className="text-right font-semibold text-green-600">
                          +{fmt(pay.amount)} F
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Bilan financier de la facture */}
              <div className="grid grid-cols-3 gap-2 text-center bg-base-200 rounded-lg p-3">
                <div>
                  <p className="text-gray-400 mb-0.5">Total</p>
                  <p className="font-bold">{fmt(inv.total_amount)} F</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">Encaissé</p>
                  <p className="font-bold text-green-600">{fmt(amountPaid)} F</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">Reste à payer</p>
                  <p className={`font-bold ${balanceDue > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                    {fmt(balanceDue)} F
                  </p>
                </div>
              </div>
            </div>

          </div>
        </InvoiceModal>
      </div>
    </dialog>
  );
}
