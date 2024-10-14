import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const DownloadButton = ({ qrCodeData, onDownload }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownHeight, setDropdownHeight] = useState(0);

    const handleToggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    const handleMouseEnter = () => {
        setIsDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        setIsDropdownOpen(false);
    };

    const handleDownload = (format) => {
        onDownload(qrCodeData, format);
        toast.success(`Downloaded as ${format.toUpperCase()}`);
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        if (isDropdownOpen) {
            setDropdownHeight(document.querySelector('.dropdown-content').scrollHeight);
        } else {
            setDropdownHeight(0);
        }
    }, [isDropdownOpen]);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                className="bg-green-500 text-white px-4 py-1 rounded-lg"
                onClick={handleToggleDropdown}
            >
                Download
            </button>
            <div
                className="relative overflow-hidden transition-height duration-300 ease-in-out"
                style={{ height: `${dropdownHeight}px` }}
            >
                {isDropdownOpen && (
                    <div className="dropdown-content bg-white border border-gray-200 rounded-lg shadow-lg w-24 z-10">
                        <button
                            className="block w-full text-left px-2 py-1 hover:bg-gray-200"
                            onClick={() => handleDownload('png')}
                        >
                            PNG
                        </button>
                        <button
                            className="block w-full text-left px-2 py-1 hover:bg-gray-200"
                            onClick={() => handleDownload('svg')}
                        >
                            SVG
                        </button>
                        <button
                            className="block w-full text-left px-2 py-1 hover:bg-gray-200"
                            onClick={() => handleDownload('pdf')}
                        >
                            PDF
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DownloadButton;
