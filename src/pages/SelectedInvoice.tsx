import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import type { Invoice } from "../context/DataContext";

export type InvoiceModalHandle = {
  open: (invoice: Invoice) => void;
  close: () => void;
};

const InvoiceModal = forwardRef<InvoiceModalHandle>((_props, ref) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  // expose des méthodes pour ouvrir/fermer le modal
  useImperativeHandle(ref, () => ({
    open: (invoiceData: Invoice) => {
      setInvoice(invoiceData);
      modalRef.current?.showModal();
    },
    close: () => modalRef.current?.close(),
  }));

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button
            onClick={() => setInvoice(null)}
            className="btn btn-sm btn-circle btn-ghost absolute right-1 top-1"
          >
            ✕
          </button>
        </form>
        <div className="flex justify-between item-center p-2 mb-1">
          <div>
            <h3 className="font-bold">Facture N° {invoice?.reference}</h3>
            <p className="text-xs">
              📅 Date :{" "}
              { invoice?.date
                ? new Date(invoice.date).toLocaleDateString("fr-FR")
                : "—" 
              }
            </p>
          </div>
          <div className="text-right">
            <h4 className="font-semibold text-[var(--primary)]">Xakilo</h4>
            <p className="text-sm">Dakar, Sénégal</p>
            <p className="text-sm">contact@xakilo.com</p>
          </div>
        </div>

        {/* about client */}
        <div className="mb-4">
          <h5 className="font-semibold text-sm mb-1">Informations du client</h5>
          <p className="font-bold">👤 {invoice?.client}</p>
          <p>📞 +221 77 000 00 00</p>
        </div>

        {/* about products */}
        <table className="table w-full mb-4 border text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ecran plat</td>
              <td>1</td>
              <td>275 000 FCFA</td>
              <td>275 000 FCFA</td>
            </tr>
            {/* {invoice.items?.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>{item.qty}</td>
                <td>{item.unitPrice.toLocaleString()} FCFA</td>
                <td>{(item.qty * item.unitPrice).toLocaleString()} FCFA</td>
              </tr>
            ))} */}
          </tbody>
        </table>

        {/* TOTAL */}
        <div className="text-right">
          <p className="text-sm font-semibold">
            Montant total : {invoice?.totalAmount.toLocaleString()} FCFA
          </p>
          <p className="text-sm text-gray-500">Statut : {invoice?.paymentStatus}</p>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Merci pour votre confiance 💼</p>
          <p>Cette facture a été générée par Xakilo.</p>
        </div>

      </div>
    </dialog>
  );
});

export default InvoiceModal;
