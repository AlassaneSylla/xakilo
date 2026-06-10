import { useAuth } from '../../../providers/AuthProvider';
import InvoiceModal from '../../invoices/components/InvoiceModal';
import type { Removal } from '../../stock/removals/types';

type Props = { selectedInvoice: Removal | null };

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  payee: { label: 'Payée', color: 'text-green-600' },
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
          <div className="flex flex-col gap-5 text-sm print:text-[11px]">

            {/* ── En-tête ─────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1 col-span-2">
                {/* Numéro de facture — identifiant officiel client */}
                <p className="text-base font-bold tracking-wide">
                  {inv.invoice_number ?? '—'}
                </p>
                <p>
                  <span className="font-semibold">Client :</span>{' '}
                  {selectedInvoice.client_name || '—'}
                  {selectedInvoice.client_phone && (
                    <span className="text-gray-400 ml-1">· {selectedInvoice.client_phone}</span>
                  )}
                </p>
                <p><span className="font-semibold">Vendeur :</span> {selectedInvoice.created_by_username || '—'}</p>
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
                {/* Référence interne stock — secondaire */}
              </div>

              <div className="flex flex-col items-end text-right gap-1">
                {boutiqueLogo && (
                  <img src={boutiqueLogo} alt={boutiqueName} className="w-14 h-14 object-contain" />
                )}
                <div className="leading-snug">
                  {boutiqueName    && <p className="font-bold text-base">{boutiqueName}</p>}
                  {boutiqueAddress && <p className="text-gray-500 text-xs">{boutiqueAddress}</p>}
                  {boutiquePhone   && <p className="text-gray-500 text-xs">Tél : {boutiquePhone}</p>}
                </div>
              </div>
            </div>

            <div className="border-t-2 border-base-300" />

            {/* ── Tableau produits ────────────────────────────── */}
            <div>
              <table className="w-full text-sm print:text-[11px] border-collapse">
                <thead>
                  <tr className="bg-base-200 text-left">
                    <th className="py-2 px-3 font-semibold">Produit</th>
                    <th className="py-2 px-3 font-semibold text-right">Qté</th>
                    <th className="py-2 px-3 font-semibold text-right">Prix unit.</th>
                    <th className="py-2 px-3 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.products.map((p, i) => (
                    <tr key={i} className="border-b border-base-200">
                      <td className="py-2.5 px-3">{p.product_name}</td>
                      <td className="py-2.5 px-3 text-right">{p.quantity}</td>
                      <td className="py-2.5 px-3 text-right">{fmt(p.unit_price)} F</td>
                      <td className="py-2.5 px-3 text-right font-medium">{fmt(p.total_price)} F</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-base-200 font-bold">
                    <td colSpan={3} className="py-2.5 px-3 text-right">Total facture</td>
                    <td className="py-2.5 px-3 text-right">{fmt(inv.total_amount)} F</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="border-t border-base-300" />

            {/* ── Récapitulatif règlements ─────────────────────── */}
            <div className="space-y-3">
              <p className="font-bold uppercase tracking-widest text-gray-400 text-xs">
                Suivi des règlements
              </p>

              {payments.length === 0 ? (
                <p className="italic text-gray-400 text-center py-3">
                  Aucun règlement enregistré.
                </p>
              ) : (
                <table className="w-full text-sm print:text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-base-200 text-left">
                      <th className="py-2 px-3 font-semibold">Date</th>
                      <th className="py-2 px-3 font-semibold">Mode</th>
                      <th className="py-2 px-3 font-semibold">Encaissé par</th>
                      <th className="py-2 px-3 font-semibold text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((pay) => (
                      <tr key={pay.id} className="border-b border-base-200">
                        <td className="py-2.5 px-3">
                          {new Date(pay.date).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </td>
                        <td className="py-2.5 px-3">{MODE_LABELS[pay.mode] ?? pay.mode}</td>
                        <td className="py-2.5 px-3 capitalize">{pay.received_by_username || '—'}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-green-600">
                          +{fmt(pay.amount)} F
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Bilan financier */}
              <div className="grid grid-cols-3 gap-3 text-center rounded-xl border border-base-300 p-4 mt-2">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total</p>
                  <p className="font-bold text-base">{fmt(inv.total_amount)} F</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Encaissé</p>
                  <p className="font-bold text-base text-green-600">{fmt(amountPaid)} F</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Reste à payer</p>
                  <p className={`font-bold text-base ${balanceDue > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                    {fmt(balanceDue)} F
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1" />

          </div>
        </InvoiceModal>
      </div>
    </dialog>
  );
}
