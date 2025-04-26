import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ children, isOpen, onClose }) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Create a portal to render the modal at the end of the document body
  return createPortal(
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      {children}
    </>,
    document.body
  );
};

export default Modal;
