import { useEffect, useState, useRef } from 'react';
import { supabase } from '/lib/supabaseClient';
import { Bar } from 'react-chartjs-2';
import DatePicker from './DatePicker';
import { FaCalendarAlt, FaClock, FaWifi, FaGlobeAmericas } from 'react-icons/fa';
import Modal from "@/components/Modal";

const AnalyticsModal = ({ qrCodeId, onClose, isOpen }) => {
    const [analyticsData, setAnalyticsData] = useState([]);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setHours(0, 0, 0, 0)),
        endDate: new Date(new Date().setHours(23, 59, 59, 999)),
        key: 'selection',
    });

    const datePickerRef = useRef(); // Create a reference for the date picker

    const fetchScanAnalytics = async (qrCodeId) => {
        setLoadingAnalytics(true);
        const { data, error } = await supabase
            .from('qr_code_scans')
            .select('*')
            .eq('qr_code_id', qrCodeId);

        if (error) {
            console.error('Error fetching scan analytics:', error);
        } else {
            setAnalyticsData(data);
        }
        setLoadingAnalytics(false);
    };

    useEffect(() => {
        if (isOpen && qrCodeId) {
            fetchScanAnalytics(qrCodeId);
        }
    }, [isOpen, qrCodeId]);

    const filterAnalyticsByDate = () => {
        return analyticsData.filter(scan => {
            const scanDate = new Date(scan.scanned_at);
            return scanDate >= dateRange.startDate && scanDate <= dateRange.endDate;
        });
    };

    const renderChart = () => {
        const filteredData = filterAnalyticsByDate();
        const dateCounts = filteredData.reduce((acc, scan) => {
            const date = new Date(scan.scanned_at).toLocaleDateString();
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(dateCounts);
        const scanCounts = Object.values(dateCounts);

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

    const handleClickOutside = (event) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
            setShowDatePicker(false); // Hide the date picker
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <Modal isOpen={isOpen} onClose={() => {
            console.log("Analytics modal closing");
            onClose();
        }}>
            <h2 className="text-lg font-bold text-center mb-4">Scan Analytics</h2>
            <DatePicker
                dateRange={dateRange}
                onDateChange={setDateRange}
                showDatePicker={showDatePicker}
                setShowDatePicker={setShowDatePicker}
                datePickerRef={datePickerRef} // Pass the datePickerRef here
            />

            {loadingAnalytics && <p>Loading analytics...</p>}
            {!loadingAnalytics && analyticsData.length > 0 && (
                <div>
                    <Bar data={renderChart()} />
                    <h3 className="text-lg font-bold mt-4 mb-2">Scan Details</h3>
                    <ul className="space-y-4 h-64 overflow-y-auto">
                        {filterAnalyticsByDate().map((scan, index) => (
                            <li key={index} className="p-4 bg-gray-100 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="text-sm flex items-center">
                                        <FaCalendarAlt className="text-blue-500" />
                                        <span className="ml-2">Date: {new Date(scan.scanned_at).toLocaleDateString()}</span>
                                    </p>
                                    <p className="text-sm flex items-center">
                                        <FaClock className="text-gray-500" />
                                        <span className="ml-2">Time: {new Date(scan.scanned_at).toLocaleTimeString()}</span>
                                    </p>
                                    <p className="text-sm flex items-center">
                                        <FaWifi className="text-green-500" />
                                        <span className="ml-2">ISP: {scan.isp || 'Unknown'}</span>
                                    </p>
                                    <p className="text-sm flex items-center">
                                        <FaGlobeAmericas className="text-yellow-500" />
                                        <span className="ml-2">Country: {scan.country}</span>
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {!loadingAnalytics && analyticsData.length === 0 && <p>No scans available for this QR code.</p>}
        </Modal>
    );
};

export default AnalyticsModal;
