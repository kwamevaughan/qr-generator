// QRCodeRow.js
import {FaChartPie, FaEdit, FaTrash} from 'react-icons/fa';
import Image from 'next/image';

const QRCodeRow = ({ qr, onEdit, onDelete, onDownload, onFetchAnalytics, editQrId, setNewUrl }) => {
    return (
        <tr className="hover:bg-gray-100">
            <td className="border border-gray-200 p-2 text-center">{qr.folder || 'Uncategorized'}</td>
            <td className="border border-gray-200 p-2 text-center relative">
                {editQrId === qr.id ? (
                    <div className="flex flex-col items-center">
                        <input
                            type="text"
                            value={qr.url}
                            onChange={(e) => setNewUrl(e.target.value)}
                            className="border rounded p-1 mb-2"
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={() => onEdit(qr.id)}
                                className="bg-green-500 text-white px-2 py-1 rounded"
                            >
                                Update
                            </button>
                            <button
                                onClick={() => onEdit(null)}
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
                                    onEdit(qr.id);
                                }}
                                className="text-blue-500 cursor-pointer"
                                title="Edit URL"
                            />
                            <FaTrash
                                onClick={() => onDelete(qr.id)}
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
                    onClick={() => onFetchAnalytics(qr.id)}
                    className="cursor-pointer"
                />
            </td>
            <td className="border border-gray-200 p-2 text-center">
                <button className="bg-green-500 text-white px-4 py-1 rounded-lg" onClick={() => onDownload(qr.qr_code_data)}>
                    Download
                </button>
            </td>
            <td className="border border-gray-200 p-2 text-center">
                <FaChartPie
                    onClick={() => onFetchAnalytics(qr.id)}
                    className="cursor-pointer text-blue-500"
                    title="View Scan Analytics"
                    size={24}
                />
            </td>
        </tr>
    );
};

export default QRCodeRow;
