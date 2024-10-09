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
            // Generate QR code for the original URL
            const qrCodeData = await QRCode.toDataURL(url);

            // Insert the original URL into the database (this step is important for history)
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

            // Create the logging URL using the inserted QR code's ID
            const loggingUrl = `${window.location.origin}/api/redirect?id=${qrCodeDataResponse[0].id}`;
            console.log('Logging URL:', loggingUrl);

            // Generate QR code for the logging URL (with the tracking `id`)
            const qrCodeForLogging = await QRCode.toDataURL(loggingUrl);

            // Update the database to save the logging QR code data
            const { error: updateError } = await supabase
                .from('qr_codes')
                .update({ qr_code_data: qrCodeForLogging })
                .eq('id', qrCodeDataResponse[0].id);

            if (updateError) {
                console.error('Error updating QR code data:', updateError);
            } else {
                // Set the correct QR code with the tracking URL for display and download
                setQrCode(qrCodeForLogging);
            }
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
