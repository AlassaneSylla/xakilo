import { type ReactNode } from 'react';
import Button from '../../../shared/components/ui/Button';

type Props = {
  title: string;
  children: ReactNode;
};

export default function InvoiceModal({ title, children }: Props) {
  const handlePrint = () => window.print();

  return (
    <>
      <style>{`
        @media print {
          @page { size: A5 portrait; margin: 8mm; }
          body * { visibility: hidden; }
          #invoice-print-area, #invoice-print-area * { visibility: visible; }
          #invoice-print-area {
            position: fixed; inset: 0;
            width: 148mm; min-height: 210mm;
            padding: 8mm; background: white;
          }
        }
      `}</style>
      <div className="modal-box w-[148mm] max-w-[148mm] p-5">
        <p className="text-[10px] font-mono text-gray-400 mb-3 no-print">{title}</p>
        {children}
        <div className="modal-action mt-4">
          <form method="dialog" className="flex gap-3 no-print">
            <Button variant="redghost" size="sm">Fermer</Button>
            <Button variant="primary" size="sm" onClick={handlePrint}>Imprimer</Button>
          </form>
        </div>
      </div>
    </>
  );
}