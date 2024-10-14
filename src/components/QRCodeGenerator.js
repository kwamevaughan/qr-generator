import { useState } from 'react';
import QRCode from 'qrcode';
import { supabase } from '/lib/supabaseClient';
import Image from 'next/image';
import { saveAs } from 'file-saver';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles

const QRCodeGenerator = ({ user, mode, onQrCodeGenerated }) => {
    const [url, setUrl] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [folder, setFolder] = useState('');

    const handleUrlChange = (e) => {
        let value = e.target.value;

        if (!value.startsWith('http://') && !value.startsWith('https://')) {
            value = 'https://' + value;
        }

        setUrl(value);
    };

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
            onQrCodeGenerated(url);
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
                // Show success toast
                toast.success('QR Code generated successfully!', {
                    position: 'top-center',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Failed to generate QR code:', error);
            toast.error('Failed to generate QR Code. Please try again.', {
                position: 'top-center',
                autoClose: 3000,
            });
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

        // Show download toast
        toast.success('QR Code downloaded successfully!', {
            position: 'top-center',
            autoClose: 3000,
        });
    };

    return (
        <div
            className={`w-full max-w-xl shadow-md rounded-lg p-10 ${mode === 'dark' ? 'bg-[#1a1a2e] text-white' : 'bg-white text-black'}`}>
            <h2 className="text-lg font-bold text-center mb-4">Generate a QR Code</h2>

            <div className="mb-4">
                <label className={`block mb-2 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Enter URL</label>
                <input
                    type="text"
                    value={url}
                    onChange={handleUrlChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 ${mode === 'dark' ? 'border-gray-600 bg-[#1a1a2e] text-white' : 'border-gray-300'}`}
                    placeholder="example.com"
                />
            </div>
            <div className="mb-4">
                <label className={`block mb-2 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Folder</label>
                <input
                    type="text"
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 ${mode === 'dark' ? 'border-gray-600 bg-[#1a1a2e] text-white' : 'border-gray-300'}`}
                    placeholder="Enter folder name (optional)"
                />
            </div>

            <button
                onClick={generateQrCode}
                className={`w-full py-2 rounded-lg transition duration-300 ${mode === 'dark' ? 'text-white hover:bg-opacity-70' : 'text-white hover:bg-opacity-70'}`}
                style={{backgroundColor: 'rgb(244, 91, 37)'}}
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
                    <DownloadButton qrCodeData={qrCode} onDownload={downloadQRCode}/>
                </div>
            )}
            <ToastContainer/> {/* Include ToastContainer here */}
        </div>
    );
};

const DownloadButton = ({qrCodeData, onDownload}) => {
    return (
        <div className="relative group inline-block mt-4">
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg">
                Download QR Code
            </button>
            <div
                className="absolute hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg mt-0 w-24 z-10">
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
