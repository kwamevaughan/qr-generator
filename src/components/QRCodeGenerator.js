import { useState } from 'react';
import QRCode from 'qrcode';
import { supabase } from '/lib/supabaseClient';
import Image from 'next/image';
import { saveAs } from 'file-saver';

const QRCodeGenerator = ({ user, onQrCodeGenerated }) => {
    const [url, setUrl] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [folder, setFolder] = useState('');

    const generateQrCode = async () => {
        try {
            const qrCodeData = await QRCode.toDataURL(url);

            const { data: qrCodeDataResponse, error } = await supabase
                .from('qr_codes')
                .insert([{ user_id: user.id, url, folder }])
                .select();

            if (error) {
                console.error('Error saving QR code:', error);
                return;
            }

            if (!qrCodeDataResponse || qrCodeDataResponse.length === 0) {
                console.error('No data returned from the insert operation:', qrCodeDataResponse);
                return;
            }

            const loggingUrl = `${window.location.origin}/api/redirect?id=${qrCodeDataResponse[0].id}`;
            // You can also pass the original URL back to the parent
            onQrCodeGenerated(url); // Pass the URL to the parent component
            const qrCodeForLogging = await QRCode.toDataURL(loggingUrl);
            const finalQrCodeWithLogo = await overlayLogo(qrCodeForLogging, '/assets/images/logo.png');

            const { error: updateError } = await supabase
                .from('qr_codes')
                .update({ qr_code_data: finalQrCodeWithLogo })
                .eq('id', qrCodeDataResponse[0].id);

            if (updateError) {
                console.error('Error updating QR code data:', updateError);
            } else {
                setQrCode(finalQrCodeWithLogo);
            }
        } catch (error) {
            console.error('Failed to generate QR code:', error);
        }
    };

    const overlayLogo = (qrCodeDataUrl, logoUrl) => {
        return new Promise((resolve, reject) => {
            const qrImage = new window.Image();
            const logoImage = new window.Image();

            qrImage.src = qrCodeDataUrl;
            logoImage.src = logoUrl;

            Promise.all([
                new Promise((res) => (qrImage.onload = res)),
                new Promise((res) => (logoImage.onload = res)),
            ]).then(() => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const qrSize = qrImage.width;

                canvas.width = qrSize;
                canvas.height = qrSize;

                ctx.drawImage(qrImage, 0, 0, qrSize, qrSize);

                const logoSize = qrSize / 5;
                const logoX = (qrSize - logoSize) / 2;
                const logoY = (qrSize - logoSize) / 2;
                const padding = 5;

                ctx.fillStyle = 'white';
                ctx.fillRect(logoX - padding, logoY - padding, logoSize + 2 * padding, logoSize + 2 * padding);
                ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

                resolve(canvas.toDataURL());
            }).catch(reject);
        });
    };

    const downloadQRCode = (format) => {
        if (!qrCode) return;

        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `qr-code.${format}`;
        link.click();
    };

    return (
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
            <h2 className="text-lg font-bold text-center mb-4">Generate a QR Code</h2>

            <div className="mb-4">
                <label className="block text-gray-700 mb-2">Enter URL</label>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    placeholder="https://example.com"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-2">Folder</label>
                <input
                    type="text"
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    placeholder="Enter folder name (optional)"
                />
            </div>

            <button
                onClick={generateQrCode}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
                Generate QR Code
            </button>

            {qrCode && (
                <div className="mt-6 text-center">
                    <h3 className="text-lg font-semibold mb-2">Your QR Code:</h3>
                    <Image
                        src={qrCode}
                        alt="Generated QR Code"
                        className="mx-auto"
                        width={200}
                        height={200}
                    />
                    <DownloadButton qrCodeData={qrCode} onDownload={downloadQRCode} />
                </div>
            )}
        </div>
    );
};

const DownloadButton = ({ qrCodeData, onDownload }) => {
    return (
        <div className="relative group inline-block mt-4">
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg">
                Download QR Code
            </button>
            <div className="absolute hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg mt-1 w-24 z-10">
                <button
                    className="block w-full text-left px-2 py-1 hover:bg-gray-200"
                    onClick={() => onDownload('png')}
                >
                    PNG
                </button>
                <button
                    className="block w-full text-left px-2 py-1 hover:bg-gray-200"
                    onClick={() => onDownload('svg')}
                >
                    SVG
                </button>
                <button
                    className="block w-full text-left px-2 py-1 hover:bg-gray-200"
                    onClick={() => onDownload('pdf')}
                >
                    PDF
                </button>
            </div>
        </div>
    );
};

export default QRCodeGenerator;
