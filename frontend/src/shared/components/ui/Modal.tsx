import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export type ModalHandle = {
  open:  () => void;
  close: () => void;
};

const sizeClass = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const Modal = forwardRef<ModalHandle, ModalProps>(({ title, children, size = 'md' }, ref) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => ({
    open:  () => dialogRef.current?.showModal(),
    close: () => dialogRef.current?.close(),
  }));

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
      <div className={`modal-box relative w-full ${sizeClass[size]} rounded-xl shadow-2xl`}>
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        </form>
        {title && (
          <div className="pb-3 mb-4 border-b border-base-200">
            <h3 className="font-bold text-sm uppercase tracking-wide text-[var(--primary)]">{title}</h3>
          </div>
        )}
        <div>{children}</div>
      </div>
      <form method="dialog" className="modal-backdrop"><button>Fermer</button></form>
    </dialog>
  );
});

export default Modal;