import { useEffect, useState, useRef } from 'react';
import { supabase } from '/lib/supabaseClient';
import Image from 'next/image';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import Modal from "@/components/Modal";
import AnalyticsModal from './AnalyticsModal';
import DatePicker from './DatePicker';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { FaChartPie, FaChartBar, FaMobileAlt, FaDesktop, FaWifi, FaGlobeAmericas, FaWindows, FaApple, FaLinux, FaCalendarAlt, FaClock } from 'react-icons/fa';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import DownloadButton from "@/components/DownloadButton";
import QRCodeTable from "@/components/QRCodeTable";

Chart.register(...registerables);

export default function QRCodeHistory({ userId, mode }) {
    const [selectedQrCode, setSelectedQrCode] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState('');
    const [analyticsData, setAnalyticsData] = useState([]);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [qrHistory, setQrHistory] = useState([]);
    const [filteredQrHistory, setFilteredQrHistory] = useState([]);


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
            setAnalyticsModalOpen(true); // Open the modal here after setting data
        }
        setLoadingAnalytics(false);
    };



    const closeAnalyticsModal = () => {
        console.log("Closing analytics modal");
        setAnalyticsModalOpen(false);
        setAnalyticsData([]); // Clear analytics data when closing
    };

// Function to open the analytics modal
    const openAnalyticsModal = (qrCodeId) => {
        setSelectedQrCode(qrCodeId);
        fetchScanAnalytics(qrCodeId);
        setAnalyticsModalOpen(true);
    };

    const filterAnalyticsByDate = () => {
        if (dateRange.startDate && dateRange.endDate) {
            return analyticsData.filter(scan => {
                const scanDate = new Date(scan.scanned_at);
                return scanDate >= dateRange.startDate && scanDate <= dateRange.endDate;
            });
        }
        return analyticsData; // No filter applied
    };

    const handleTodaySelection = () => {
        const today = new Date();
        setDateRange({
            startDate: new Date(today.setHours(0, 0, 0, 0)), // Start of today
            endDate: new Date(today.setHours(23, 59, 59, 999)), // End of today
            key: 'selection',
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

    const getOsIcon = (osType) => {
        switch (osType) {
            case 'Windows':
                return <FaWindows className="text-blue-500" />;
            case 'MacOS':
                return <FaApple className="text-gray-600" />;
            case 'Linux':
                return <FaLinux className="text-orange-500" />;
            default:
                return <FaDesktop />;
        }
    };

    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
        endDate: new Date(new Date().setHours(23, 59, 59, 999)), // End of today
        key: 'selection',
    });
    const datePickerRef = useRef();


    const handleClickOutside = (event) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
            setShowDatePicker(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const handleDateSelection = (item) => {
        setDateRange(item.selection);
    };

    const handleDateInputClick = () => {
        setShowDatePicker((prev) => !prev);
    };


    useEffect(() => {
        const fetchQrHistory = async () => {
            if (!userId) return;

            const { data, error } = await supabase
                .from('qr_codes')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching QR code history:', error);
                return;
            }

            setQrHistory(data);
        };

        fetchQrHistory();
    }, [userId]);

    useEffect(() => {
        const filteredHistory = selectedFolder
            ? qrHistory.filter(qr => qr.folder === selectedFolder)
            : qrHistory;

        setFilteredQrHistory(filteredHistory);
    }, [selectedFolder, qrHistory]);

    const openModal = (qrCodeData) => {
        console.log("Opening modal with QR code data:", qrCodeData);
        setSelectedQrCode(qrCodeData);
        setModalOpen(true);
    };


    const closeModal = () => {
        console.log("Closing QR code modal");
        setModalOpen(false);
        setSelectedQrCode(null);
    };


    const downloadQRCode = async (qrCodeData, format) => {
        try {
            if (format === 'png') {

                saveAs(qrCodeData, 'qr-code.png');
            } else if (format === 'svg') {
                const svgQRCode = await QRCode.toString(qrCodeData, { type: 'svg' });
                const blob = new Blob([svgQRCode], { type: 'image/svg+xml' });
                saveAs(blob, 'qr-code.svg');
            } else if (format === 'pdf') {
                const doc = new jsPDF();
                const imgData = qrCodeData;
                doc.addImage(imgData, 'PNG', 15, 40, 180, 160);
                doc.save('qr-code.pdf');
            }
        } catch (error) {
            console.error('Error downloading QR code:', error);
        }
    };

    const uniqueFolders = [...new Set(qrHistory.map(qr => qr.folder))];

    return (
        <div
            className={`mt-8 w-full max-w-4xl shadow-md rounded-lg p-8 ${mode === 'dark' ? 'bg-[#1a1a2e] text-white' : 'bg-white text-black'}`}>
            <h2 className="text-lg font-bold text-center mb-4">QR Code History</h2>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Filter by Folder:</label>
                <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="border rounded p-2 w-full"
                >
                    <option value="">All Folders</option>
                    {uniqueFolders.map((folder, index) => (
                        <option key={index} value={folder}>{folder}</option>
                    ))}
                </select>
            </div>


            <QRCodeTable
                filteredQrHistory={filteredQrHistory}
                setQrHistory={setQrHistory}
                openModal={openModal}
                fetchScanAnalytics={fetchScanAnalytics}
                downloadQRCode={downloadQRCode}
                openAnalyticsModal={openAnalyticsModal} // Ensure this line is included
            />

            {/* Modal for Scan Analytics */}
            <AnalyticsModal
                qrCodeId={selectedQrCode}
                onClose={closeAnalyticsModal}
                loadingAnalytics={loadingAnalytics}
                analyticsData={analyticsData}
                isOpen={analyticsModalOpen} // This controls the AnalyticsModal
                setShowDatePicker={setShowDatePicker} // Pass the function here
            />


            {modalOpen && selectedQrCode && (
                <Modal isOpen={modalOpen} onClose={closeModal}>
                    <div className="flex flex-col items-center justify-center">
                        <Image
                            src={selectedQrCode}
                            alt="Enlarged QR Code"
                            width={512}
                            height={512}
                        />
                        <DownloadButton
                            qrCodeData={selectedQrCode} // Pass the selected QR code data
                            onDownload={downloadQRCode}  // Pass the download function
                            className="mt-5" // Optional margin for spacing
                        />
                    </div>
                </Modal>
            )}

        </div>
    );
}
