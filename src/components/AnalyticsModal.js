import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabaseClient';

const AnalyticsModal = ({ qrCodeId, onClose }) => {
    const [analytics, setAnalytics] = useState([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!qrCodeId) return; // Exit if no QR Code ID
            const { data, error } = await fetchScanAnalytics(qrCodeId);
            if (error) {
                console.error("Error fetching analytics:", error);
            } else {
                console.log("Analytics data fetched:", data);
                setAnalytics(data);
            }
        };

        fetchAnalytics();
    }, [qrCodeId]);

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Scan Analytics</h2>
                {analytics.length > 0 ? (
                    <ul>
                        {analytics.map((scan) => (
                            <li key={scan.id}>
                                <p>Location: {scan.location}</p>
                                <p>Device: {scan.device}</p>
                                <p>Timestamp: {new Date(scan.timestamp).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No analytics available for this QR code.</p>
                )}
            </div>
        </div>
    );
};

export default AnalyticsModal;
