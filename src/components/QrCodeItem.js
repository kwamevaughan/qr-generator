// src/components/QrCodeItem.js
import { useState } from 'react';
import ScanAnalytics from './ScanAnalytics';

const QrCodeItem = ({ qr }) => {
    const [showAnalytics, setShowAnalytics] = useState(false);

    return (
        <li className="mb-2">
            <p>URL: {qr.url}</p>
            <img src={qr.qr_code_data} alt="QR Code" className="w-24 h-24" />
            <p>Created: {new Date(qr.created_at).toLocaleString()}</p>
            <button
                onClick={() => setShowAnalytics((prev) => !prev)}
                className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
                {showAnalytics ? 'Hide' : 'View'} Scan Analytics
            </button>
            {showAnalytics && <ScanAnalytics qrCodeId={qr.id} />}
        </li>
    );
};

export default QrCodeItem;
