// src/components/ScanAnalytics.js
import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabaseClient';

const ScanAnalytics = ({ qrCodeId, onClose }) => {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Current QR Code ID:", qrCodeId); // Log the current QR Code ID

        if (!qrCodeId) {
            console.log("No QR Code ID provided. Cannot fetch analytics.");
            setLoading(false);
            return;
        }

        const fetchScanAnalytics = async () => {
            console.log("Fetching scan analytics..."); // Log when fetching starts
            const { data, error } = await supabase
                .from('qr_code_scans')
                .select('*')
                .eq('qr_code_id', qrCodeId);

            if (error) {
                console.error('Error fetching scan analytics:', error);
                setError(error);
            } else {
                console.log("Scan analytics fetched:", data); // Log the fetched data
                setAnalytics(data);
            }
            setLoading(false);
        };

        fetchScanAnalytics();
    }, [qrCodeId]);

    if (loading) return <p>Loading analytics...</p>;
    if (error) return <p>Error loading analytics: {error.message}</p>;

    return (
        <div className="mt-4">
            <h4 className="font-bold">Scan Analytics:</h4>
            {analytics.length > 0 ? (
                <ul>
                    {analytics.map((scan) => (
                        <li key={scan.id}>
                            <p>Device: {scan.device}</p>
                            <p>Location: {scan.location}</p>
                            <p>Timestamp: {new Date(scan.created_at).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No scan data available.</p>
            )}
        </div>
    );
};

export default ScanAnalytics;
