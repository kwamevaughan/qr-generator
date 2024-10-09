import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabaseClient';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import Modal from './Modal';
import Image from 'next/image';

Chart.register(...registerables);

export default function QRCodeHistory({ userId }) {
    const [qrHistory, setQrHistory] = useState([]);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchQrHistory = async () => {
            const { data, error } = await supabase
                .from('qr_codes')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching QR code history:', error);
            } else {
                setQrHistory(data);
            }
        };

        if (userId) {
            fetchQrHistory();
        }
    }, [userId]);

    const fetchScanAnalytics = async (qrCodeId) => {
        setLoadingAnalytics(true);
        const { data, error } = await supabase
            .from('qr_code_scans')
            .select('*')
            .eq('qr_code_id', qrCodeId);

        if (error) {
            console.error('Error fetching scan analytics:', error);
            setLoadingAnalytics(false);
        } else {
            setAnalyticsData(data);
            setLoadingAnalytics(false);
            setIsModalOpen(true);
        }
    };

    const renderChart = () => {
        const labels = analyticsData.map(scan => new Date(scan.scanned_at).toLocaleString());
        const scanCounts = analyticsData.map(() => 1);

        return {
            labels,
            datasets: [
                {
                    label: 'Scan Counts',
                    data: scanCounts,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
            ],
        };
    };

    return (
        <div className="mt-8 w-full max-w-md bg-white shadow-md rounded-lg p-8">
            <h2 className="text-lg font-bold text-center mb-4">QR Code History</h2>
            {qrHistory.length > 0 ? (
                qrHistory.map((qr) => (
                    <div key={qr.id} className="mb-4">
                        <h3 className="text-lg font-bold">{qr.folder || 'Uncategorized'}</h3>
                        <p>URL: {qr.url}</p>
                        <Image
                            src={qr.qr_code_data}
                            alt="QR Code"
                            width={96} // Adjust width as needed
                            height={96} // Adjust height as needed
                            className="w-24 h-24"
                        />
                        <p>Created: {new Date(qr.created_at).toLocaleString()}</p>
                        <button
                            onClick={() => fetchScanAnalytics(qr.id)}
                            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
                        >
                            View Scan Analytics
                        </button>
                    </div>
                ))
            ) : (
                <p className="text-center">No QR codes generated yet.</p>
            )}

            {/* Modal for Scan Analytics */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h2 className="text-lg font-bold text-center mb-4">Scan Analytics</h2>
                {loadingAnalytics && <p>Loading analytics...</p>}
                {!loadingAnalytics && analyticsData.length > 0 && (
                    <div>
                        <Bar data={renderChart()} />
                        <h3 className="text-lg font-bold">Scan Details</h3>
                        <ul>
                            {analyticsData.map((scan, index) => (
                                <li key={index}>
                                    {new Date(scan.scanned_at).toLocaleString()} - {scan.device_type} - {scan.country}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {!loadingAnalytics && analyticsData.length === 0 && (
                    <p>No scan data available.</p>
                )}
            </Modal>
        </div>
    );
}
