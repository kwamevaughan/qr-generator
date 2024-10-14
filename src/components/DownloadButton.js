import { useState } from 'react';
import { toast } from 'react-toastify';

const DownloadButton = ({ qrCodeData, onDownload }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
            {isDropdownOpen && (
                <div className="absolute bg-white border border-gray-200 rounded-lg shadow-lg m-0 p-0 w-24 z-10">
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
    );
};

export default DownloadButton;
