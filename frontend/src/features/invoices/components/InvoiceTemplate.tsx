import { useAuth } from '../../../providers/AuthProvider';
import InvoiceModal from './InvoiceModal';
import type { Removal } from '../../stock/removals/types';

type Props = { selectedInvoice: Removal | null };

function fmt(n: number) { return n.toLocaleString('fr-FR'); }

const MODE_LABELS: Record<string, string> = {
  especes: 'Espèces', mobile_money: 'Mobile Money', carte: 'Carte',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  payee:               { label: 'Payée',                    color: 'text-green-600' },
  partiellement_payee: { label: 'Partiellement payée',      color: 'text-amber-500' },
  en_attente:          { label: 'En attente de paiement',   color: 'text-amber-500' },
  annulee:             { label: 'Annulée',                  color: 'text-red-500'   },
};

function resolveStatus(invoiceStatus: string, balanceDue: number) {
  if (invoiceStatus === 'partiellement_payee' && balanceDue === 0) return STATUS_LABELS['payee'];
  return STATUS_LABELS[invoiceStatus] ?? { label: invoiceStatus, color: '' };
}

function BoutiqueHeader({ name, address, phone, logo }: { name: string; address: string; phone: string; logo: string | null }) {
  return (
    <div className="flex flex-col items-end text-right gap-1">
      {logo && <img src={logo} alt={name} className="w-14 h-14 object-contain" />}
      <div className="leading-snug">
        {name    && <p className="font-bold text-base">{name}</p>}
        {address && <p className="text-gray-500 text-xs">{address}</p>}
        {phone   && <p className="text-gray-500 text-xs">Tél : {phone}</p>}
      </div>
    </div>
  );
}

export default function InvoiceTemplate({ selectedInvoice }: Props) {
  const { user } = useAuth();

  const boutiqueName    = user?.boutique_name    ?? '';
  const boutiquePhone   = user?.boutique_phone   ?? '';
  const boutiqueAddress = user?.boutique_address ?? '';
  const boutiqueLogo    = user?.boutique_logo    ?? null;

  const r = selectedInvoice;

  /* ── Titre du document selon destination ── */
  const docTitle = !r ? '' :
    r.destination === 'vente' ? (r.invoice?.invoice_number ?? 'Facture') :
    r.destination === 'don'   ? `BON DE DON — ${r.removal_ref}` :
                                `BON DE PERTE — ${r.removal_ref}`;

  return (
    <dialog id="invoice_modal" className="modal">
      <div id="invoice-print-area">
        <InvoiceModal title={docTitle}>
          {r && (
            <div className="flex flex-col gap-5 text-sm print:text-[11px]">

              {/* ── En-tête ── */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 col-span-2">
                  <p className="text-base font-bold tracking-wide">{docTitle}</p>

                  {r.destination === 'vente' && (
                    <>
                      <p><span className="font-semibold">Client :</span>{' '}
                        {r.client_name || '—'}
                        {r.client_phone && <span className="text-gray-400 ml-1">· {r.client_phone}</span>}
                      </p>
                      <p><span className="font-semibold">Vendeur :</span> {r.created_by_username || '—'}</p>
                      <p><span className="font-semibold">Date :</span>{' '}
                        {r.invoice?.date_created
                          ? new Date(r.invoice.date_created).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                          : new Date(r.date_register).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                      <p><span className="font-semibold">Statut :</span>{' '}
                        <span className={`font-bold ${resolveStatus(r.invoice_status, r.balance_due ?? 0).color}`}>
                          {resolveStatus(r.invoice_status, r.balance_due ?? 0).label}
                        </span>
                      </p>
                    </>
                  )}

                  {r.destination === 'don' && (
                    <>
                      {r.client_name && <p><span className="font-semibold">Bénéficiaire :</span> {r.client_name}</p>}
                      <p><span className="font-semibold">Enregistré par :</span> {r.created_by_username || '—'}</p>
                      <p><span className="font-semibold">Date :</span>{' '}
                        {new Date(r.date_register).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </>
                  )}

                  {r.destination === 'perte' && (
                    <>
                      <p><span className="font-semibold">Déclaré par :</span> {r.created_by_username || '—'}</p>
                      <p><span className="font-semibold">Date :</span>{' '}
                        {new Date(r.date_register).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </>
                  )}
                </div>
                <BoutiqueHeader name={boutiqueName} address={boutiqueAddress} phone={boutiquePhone} logo={boutiqueLogo} />
              </div>

              <div className="border-t-2 border-base-300" />

              {/* ── Tableau produits ── */}
              <table className="w-full text-sm print:text-[11px] border-collapse">
                <thead>
                  <tr className="bg-base-200 text-left">
                    <th className="py-2 px-3 font-semibold">Produit</th>
                    <th className="py-2 px-3 font-semibold text-right">Qté</th>
                    {r.destination === 'vente' && (
                      <>
                        <th className="py-2 px-3 font-semibold text-right">Prix unit.</th>
                        <th className="py-2 px-3 font-semibold text-right">Total</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(r.destination === 'vente' ? (r.invoice?.products ?? r.items) : r.items).map((p, i) => (
                    <tr key={i} className="border-b border-base-200">
                      <td className="py-2.5 px-3">{p.product_name}</td>
                      <td className="py-2.5 px-3 text-right">{p.quantity}</td>
                      {r.destination === 'vente' && (
                        <>
                          <td className="py-2.5 px-3 text-right">{fmt(p.unit_price)} F</td>
                          <td className="py-2.5 px-3 text-right font-medium">{fmt(p.total_price)} F</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
                {r.destination === 'vente' && r.invoice && (
                  <tfoot>
                    <tr className="bg-base-200 font-bold">
                      <td colSpan={3} className="py-2.5 px-3 text-right">Total facture</td>
                      <td className="py-2.5 px-3 text-right">{fmt(r.invoice.total_amount)} F</td>
                    </tr>
                  </tfoot>
                )}
              </table>

              {/* ── Justification (perte uniquement) ── */}
              {r.destination === 'perte' && r.justification && (
                <>
                  <div className="border-t border-base-300" />
                  <div>
                    <p className="font-semibold text-xs uppercase tracking-widest text-gray-400 mb-1">Justification</p>
                    <p className="bg-base-200 rounded-lg px-4 py-3 text-sm italic">{r.justification}</p>
                  </div>
                </>
              )}

              {/* ── Suivi règlements (vente uniquement) ── */}
              {r.destination === 'vente' && r.invoice && (
                <>
                  <div className="border-t border-base-300" />
                  <div className="space-y-3">
                    <p className="font-bold uppercase tracking-widest text-gray-400 text-xs">Suivi des règlements</p>

                    {r.payments.length === 0 ? (
                      <p className="italic text-gray-400 text-center py-3">Aucun règlement enregistré.</p>
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
                          {r.payments.map((pay) => (
                            <tr key={pay.id} className="border-b border-base-200">
                              <td className="py-2.5 px-3">
                                {new Date(pay.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="py-2.5 px-3">{MODE_LABELS[pay.mode] ?? pay.mode}</td>
                              <td className="py-2.5 px-3 capitalize">{pay.received_by_username || '—'}</td>
                              <td className="py-2.5 px-3 text-right font-semibold text-green-600">+{fmt(pay.amount)} F</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    <div className="grid grid-cols-3 gap-3 text-center rounded-xl border border-base-300 p-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Total</p>
                        <p className="font-bold text-base">{fmt(r.invoice.total_amount)} F</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Encaissé</p>
                        <p className="font-bold text-base text-green-600">{fmt(r.amount_paid ?? 0)} F</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Reste à payer</p>
                        <p className={`font-bold text-base ${(r.balance_due ?? 0) > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                          {fmt(r.balance_due ?? 0)} F
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>
          )}
        </InvoiceModal>
      </div>
    </dialog>
  );
}