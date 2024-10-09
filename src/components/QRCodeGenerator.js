import { useState } from 'react';
import QRCode from 'qrcode';
import { supabase } from '/lib/supabaseClient';

const QRCodeGenerator = ({ user }) => {
    const [url, setUrl] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [folder, setFolder] = useState('');

    const generateQrCode = async () => {
        try {
            // Generate the QR code data from the provided URL
            const qrCodeData = await QRCode.toDataURL(url);
            setQrCode(qrCodeData); // Temporarily set the QR code to show the original URL

            // Save the QR code along with folder information in Supabase
            const { data: qrCodeDataResponse, error } = await supabase
                .from('qr_codes')
                .insert([{ user_id: user.id, url, qr_code_data: qrCodeData, folder }])
                .select(); // Request the inserted data back

            if (error) {
                console.error('Error saving QR code:', error);
                return; // Exit if there's an error
            }

            // Log the response to see what is returned
            console.log('Response from Supabase insert:', qrCodeDataResponse);

            // Check if qrCodeDataResponse has data
            if (!qrCodeDataResponse || qrCodeDataResponse.length === 0) {
                console.error('No data returned from the insert operation:', qrCodeDataResponse);
                return; // Exit if no data is returned
            }

            // Create the logging URL with the QR code ID
            const loggingUrl = `http://localhost:3001/api/redirect?id=${qrCodeDataResponse[0].id}`;
            console.log('Logging URL:', loggingUrl); // Log the logging URL

            // Generate QR code for the logging URL
            const qrCodeForLogging = await QRCode.toDataURL(loggingUrl);
            setQrCode(qrCodeForLogging); // Set the QR code with the logging URL

            // Log the final QR code data URL
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
                    <img src={qrCode} alt="Generated QR Code" className="mx-auto" />
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
