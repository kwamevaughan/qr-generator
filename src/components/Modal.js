import React, { useEffect, useState } from 'react';

const Modal = ({ isOpen, onClose, children }) => {
    const [showChildren, setShowChildren] = useState(false);

    // Close the modal when the Escape key is pressed
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

    // Use effect to manage visibility of children
    useEffect(() => {
        if (!isOpen) {
            const timeout = setTimeout(() => setShowChildren(false), 300); // Match with duration
            return () => clearTimeout(timeout);
        }
    }, [isOpen]);

    if (!isOpen && !showChildren) return null; // If modal is not open, render nothing

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="modal-content bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/3 relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 focus:outline-none"
                    aria-label="Close Modal"
                >
                    &times; {/* Close button */}
                </button>
                <div
                    className={`transition-opacity duration-500 ease-in-out transform ${showChildren ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                >
                    {children} {/* Render children inside the modal */}
                </div>
            </div>
        </div>
    );
};

export default Modal;
