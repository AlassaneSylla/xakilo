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
      <div className="modal-box w-[148mm] max-w-[148mm] p-6 flex flex-col print:p-0 print:w-full print:max-w-none print:h-full print:shadow-none print:rounded-none">
        <p className="text-[10px] font-mono text-gray-400 mb-3 no-print">Aperçu · {title}</p>
        <div className="flex flex-col flex-1 print:h-full">
          {children}
        </div>
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