import React, { useEffect, useState } from 'react';

const Modal = ({ isOpen, onClose, children }) => {
    const [showChildren, setShowChildren] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (event) => {
            const modalContent = document.querySelector('.modal-content');
            if (modalContent && !modalContent.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            setShowChildren(true);
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('mousedown', handleClickOutside);
        } else {
            setShowChildren(false);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) {
            const timeout = setTimeout(() => setShowChildren(false), 300);
            return () => clearTimeout(timeout);
        }
    }, [isOpen]);

    if (!isOpen && !showChildren) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true">
            <div className="modal-content bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/3 relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 focus:outline-none"
                    aria-label="Close Modal"
                >
                    &times;
                </button>
                <div className={`transition-opacity duration-500 ease-in-out transform ${showChildren ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
