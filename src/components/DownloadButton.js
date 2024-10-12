// DownloadButton.js
import { useState } from 'react';

const DownloadButton = ({ qrCodeData, onDownload }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    return (
        <div className="relative inline-block">
            <button
                className="bg-green-500 text-white px-4 py-1 rounded-lg"
                onClick={toggleDropdown}
            >
                Download
            </button>
            {isDropdownOpen && (
                <div className="absolute bg-white border border-gray-200 rounded-lg shadow-lg mt-1 w-24 z-10">
                    <button
                        className="block w-full text-left px-2 py-1 hover:bg-gray-200"
                        onClick={() => {
                            onDownload(qrCodeData, 'png');
                            setIsDropdownOpen(false);
                        }}
                    >
                        PNG
                    </button>
                    <button
                        className="block w-full text-left px-2 py-1 hover:bg-gray-200"
                        onClick={() => {
                            onDownload(qrCodeData, 'svg');
                            setIsDropdownOpen(false);
                        }}
                    >
                        SVG
                    </button>
                    <button
                        className="block w-full text-left px-2 py-1 hover:bg-gray-200"
                        onClick={() => {
                            onDownload(qrCodeData, 'pdf');
                            setIsDropdownOpen(false);
                        }}
                    >
                        PDF
                    </button>
                </div>
            )}
        </div>
    );
};

export default DownloadButton;
