import { useState } from 'react';
import QRCode from 'qrcode';
import { supabase } from '/lib/supabaseClient';
import Image from 'next/image';

const QRCodeGenerator = ({ user }) => {
    const [url, setUrl] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [folder, setFolder] = useState('');

    const generateQrCode = async () => {
        try {
            const qrCodeData = await QRCode.toDataURL(url);
            setQrCode(qrCodeData);

            const { data: qrCodeDataResponse, error } = await supabase
                .from('qr_codes')
                .insert([{ user_id: user.id, url, qr_code_data: qrCodeData, folder }])
                .select();

            if (error) {
                console.error('Error saving QR code:', error);
                return;
            }

            if (!qrCodeDataResponse || qrCodeDataResponse.length === 0) {
                console.error('No data returned from the insert operation:', qrCodeDataResponse);
                return;
            }

            // Use the dynamic root domain
            const loggingUrl = `${window.location.origin}/api/redirect?id=${qrCodeDataResponse[0].id}`;
            console.log('Logging URL:', loggingUrl);

            const qrCodeForLogging = await QRCode.toDataURL(loggingUrl);
            setQrCode(qrCodeForLogging);
            console.log('Generated QR Code Data URL:', qrCodeForLogging);
        } catch (error) {
            console.error('Failed to generate QR code:', error);
        }
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
                        width={200} // Adjust width as needed
                        height={200} // Adjust height as needed
                    />
                    <a
                        href={qrCode}
                        download="qr-code.png"
                        className="mt-4 inline-block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                        Download QR Code
                    </a>
                </div>
            )}
        </div>
    );
};

export default QRCodeGenerator;
