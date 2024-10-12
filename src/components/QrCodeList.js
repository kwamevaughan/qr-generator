import React from 'react';
import QrCodeTable from './QrCodeTable';

const QrCodeList = ({ filteredQrHistory, setQrHistory, openModal, fetchScanAnalytics, downloadQRCode, openAnalyticsModal }) => {
    return (
        <div>
            {filteredQrHistory.length > 0 ? (
                <QrCodeTable
                    filteredQrHistory={filteredQrHistory}
                    setQrHistory={setQrHistory}
                    openModal={openModal}
                    fetchScanAnalytics={fetchScanAnalytics}
                    downloadQRCode={downloadQRCode}
                    openAnalyticsModal={openAnalyticsModal} // Ensure this is passed down
                />
            ) : (
                <p className="text-center">No QR codes generated yet.</p>
            )}
        </div>
    );
};

export default QrCodeList;
