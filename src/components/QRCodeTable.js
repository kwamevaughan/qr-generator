import React, { useState } from 'react';
import Image from 'next/image';
import { FaEdit, FaTrash, FaChartPie } from 'react-icons/fa';
import DownloadButton from './DownloadButton';
import { supabase } from "../../lib/supabaseClient";

const QrCodeTable = ({ filteredQrHistory, setQrHistory, openModal, fetchScanAnalytics, downloadQRCode, openAnalyticsModal }) => {
    const [newUrl, setNewUrl] = useState('');
    const [editQrId, setEditQrId] = useState(null);

    const handleDelete = async (qrCodeId) => {
        try {
            const { error } = await supabase
                .from('qr_codes')
                .delete()
                .eq('id', qrCodeId);

            if (error) throw error;

            setQrHistory((prev) => prev.filter(qr => qr.id !== qrCodeId));
        } catch (error) {
            console.error('Error deleting QR code:', error);
        }
    };

    const handleUpdate = async (qrCodeId) => {
        try {
            const { error } = await supabase
                .from('qr_codes')
                .update({ url: newUrl })
                .eq('id', qrCodeId);

            if (error) throw error;

            setQrHistory((prev) =>
                prev.map((qr) =>
                    qr.id === qrCodeId ? { ...qr, url: newUrl } : qr
                )
            );
            setEditQrId(null);
            setNewUrl('');
        } catch (error) {
            console.error('Error updating QR code:', error);
        }
    };

    return (
        <div className="overflow-y-auto max-h-[400px]">
            <table className="w-full border-collapse border border-gray-200">
                <thead>
                <tr>
                    <th className="border border-gray-200 p-2 text-center">Folder</th>
                    <th className="border border-gray-200 p-2 text-center">URL</th>
                    <th className="border border-gray-200 p-2 text-center">Created</th>
                    <th className="border border-gray-200 p-2 text-center">QR Code</th>
                    <th className="border border-gray-200 p-2 text-center">Download</th>
                    <th className="border border-gray-200 p-2 text-center">View Scan Analytics</th>
                </tr>
                </thead>
                <tbody>
                {(filteredQrHistory || []).map((qr) => (
                    <tr key={qr.id} className="hover:bg-gray-100">
                        <td className="border border-gray-200 p-2 text-center">{qr.folder || 'Uncategorized'}</td>
                        <td className="border border-gray-200 p-2 text-center relative">
                            {editQrId === qr.id ? (
                                <div className="flex flex-col items-center">
                                    <input
                                        type="text"
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                        className="border rounded p-1 mb-2"
                                    />
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleUpdate(qr.id)}
                                            className="bg-green-500 text-white px-2 py-1 rounded"
                                        >
                                            Update
                                        </button>
                                        <button
                                            onClick={() => setEditQrId(null)}
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative inline-block group">
                                    <span className="cursor-pointer">{qr.url}</span>
                                    <div className="absolute right-0 flex space-x-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FaEdit
                                            onClick={() => {
                                                setNewUrl(qr.url);
                                                setEditQrId(qr.id);
                                            }}
                                            className="text-blue-500 cursor-pointer"
                                            title="Edit URL"
                                        />
                                        <FaTrash
                                            onClick={() => handleDelete(qr.id)}
                                            className="text-red-500 cursor-pointer"
                                            title="Delete QR Code"
                                        />
                                    </div>
                                </div>
                            )}
                        </td>
                        <td className="border border-gray-200 p-2 text-center">{new Date(qr.created_at).toLocaleString()}</td>
                        <td className="border border-gray-200 p-2 text-center">
                            <Image
                                src={qr.qr_code_data || '/logo.png'}
                                alt="QR Code"
                                width={48}
                                height={48}
                                onClick={() => openModal(qr.qr_code_data)} // Make sure this is correct
                                className="cursor-pointer"
                            />
                        </td>
                        <td className="border border-gray-200 p-2 text-center">
                            <DownloadButton
                                qrCodeData={qr.qr_code_data}
                                onDownload={downloadQRCode}
                            />
                        </td>
                        <td className="border border-gray-200 p-2 text-center">
                            <FaChartPie
                                onClick={() => {
                                    console.log(`Clicked on QR ID: ${qr.id}`);
                                    openAnalyticsModal(qr.id); // This should work now
                                }}
                                className="cursor-pointer text-blue-500"
                                title="View Scan Analytics"
                                size={24}
                            />

                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default QrCodeTable;
