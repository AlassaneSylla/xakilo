import ModalInvoice from "./InvoiceModal";
import logo from '../assets/xakilo_sm.png'

interface InvoiceTemplateProps {
  selectedInvoice: any;
}

export default function InvoiceTemplate({ selectedInvoice }: InvoiceTemplateProps) {
  return (
    <dialog id="invoice_modal" className="modal">
      <div id="invoice-print-area">
        <ModalInvoice
          title={`${selectedInvoice?.invoice?.invoice_number || ""}`}
        >
          {selectedInvoice && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p>
                    <span className="font-semibold">Client :</span> {selectedInvoice.client_name}
                  </p>
                  <p>
                    <span className="font-semibold">Destination :</span> {selectedInvoice.destination}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-semibold">Date :</span>{" "}
                    {new Date(selectedInvoice.invoice.date_created).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-semibold">Statut :</span>{" "}
                    <span className="text-red-500 font-semibold">
                        {selectedInvoice.invoice.status.toLowerCase()}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <img src={logo} alt="Logo Xakilo" className="w-14 h-14 object-contain" />

                  <div className="flex flex-col leading-tight text-xs">
                    <p className="font-semibold text-[var(--black)]">Xakilo</p>
                    <p>Marché Grand-Dakar, cantine 55</p>
                    <p>Tel : 77 429 74 25</p>
                  </div>
                </div>
              </div>

              <table className="table w-full text-xs">
                <thead>
                  <tr className="bg-base-200">
                    <th>Produit</th>
                    <th>Qté</th>
                    <th>PU</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.invoice.products.map((p: any, i: number) => (
                    <tr key={i}>
                      <td>{p.product_name}</td>
                      <td>{p.quantity}</td>
                      <td>{p.unit_price.toLocaleString()} FCFA</td>
                      <td>{p.total_price.toLocaleString()} FCFA</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-base-200">
                    <td colSpan={3}>Total</td>
                    <td>
                      {selectedInvoice.invoice.total_amount.toLocaleString()} FCFA
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </ModalInvoice>
      </div>
    </dialog>
  );
}
