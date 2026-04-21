import React, { forwardRef, useImperativeHandle, useRef } from "react";

interface ModalProps {
  title?: string;
  children?: React.ReactNode; 
}

const Modal = forwardRef(({ title, children }: ModalProps, ref) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => ({
    open: () => dialogRef.current?.showModal(),
    close: () => dialogRef.current?.close(),
  }));

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box relative">
       
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>

        {title && <h3 className="font-bold text-md">{title}</h3>}
        <div className="py-4">{children}</div>
      </div>
    </dialog>
  );
});

export default Modal;

