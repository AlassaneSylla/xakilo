import { type ReactNode } from "react";
import Button from "./Button";

type ModalProps = {
  title: string;
  children: ReactNode;
};

const ModalInvoice = ({ title, children }: ModalProps) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="modal-box w-11/12 max-w-4xl">
            <h3 className="font-semibold">{title}</h3>
            {children}
            <div className="modal-action">
                <form method="dialog" className="flex gap-3 no-print">
                    <Button variant="redghost" size="sm">Fermer</Button>
                    <Button variant="primary" size="sm" onClick={() => handlePrint()}>
                        Imprimer
                    </Button>
                </form>
            </div>
        </div>
  );
};

export default ModalInvoice;


